const twilioCallsEndpoint = (accountSid) =>
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

const APPROVED_CALLER_ID_NUMBER = "+18017010113";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders() };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "POST required" });
  }

  const authError = requireTeamKey(event);
  if (authError) return authError;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = normalizePhone(process.env.TWILIO_CALLER_ID_NUMBER);
  const bridgeNumber = normalizePhone(process.env.SALES_CALL_BRIDGE_NUMBER);

  if (!accountSid || !authToken || !fromNumber || !bridgeNumber) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Twilio call bridging is not configured yet.",
      required: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_CALLER_ID_NUMBER", "SALES_CALL_BRIDGE_NUMBER"],
      note: "SALES_CALL_BRIDGE_NUMBER is the staff phone Twilio should call first before dialing the customer.",
    });
  }
  if (fromNumber !== APPROVED_CALLER_ID_NUMBER) {
    return json(501, {
      ok: false,
      configured: false,
      error: "TWILIO_CALLER_ID_NUMBER must be the approved BLP sales caller ID number.",
      required: ["TWILIO_CALLER_ID_NUMBER=+18017010113"],
      received: fromNumber,
    });
  }

  const payload = parseJson(event.body);
  if (!payload.ok) return json(400, { ok: false, error: payload.error });

  const customerNumber = normalizePhone(payload.data.to);
  if (!customerNumber) return json(400, { ok: false, error: "A valid customer phone number is required." });

  const twiml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<Response>",
    "<Say voice=\"alice\">Connecting your BLP sales call.</Say>",
    `<Dial callerId="${escapeXml(fromNumber)}">${escapeXml(customerNumber)}</Dial>`,
    "</Response>",
  ].join("");

  const form = new URLSearchParams({
    To: bridgeNumber,
    From: fromNumber,
    Twiml: twiml,
  });

  let response;
  try {
    response = await fetch(twilioCallsEndpoint(accountSid), {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
  } catch (error) {
    return json(502, { ok: false, error: "Twilio call request failed.", detail: String(error.message || error).slice(0, 800) });
  }

  const text = await response.text();
  if (!response.ok) {
    return json(response.status, { ok: false, error: "Twilio call start failed.", detail: text.slice(0, 800) });
  }

  let twilio = {};
  try { twilio = JSON.parse(text); } catch (error) {}
  return json(200, { ok: true, sid: twilio.sid || null, from: fromNumber, bridgeNumber, to: customerNumber });
};

function requireTeamKey(event) {
  const accessKey = process.env.BLP_APP_ACCESS_KEY;
  if (!accessKey) {
    return json(501, { ok: false, configured: false, error: "BLP_APP_ACCESS_KEY is not set in Netlify env vars." });
  }
  const providedKey = event.headers["x-blp-key"] || event.headers["X-Blp-Key"] || "";
  if (providedKey !== accessKey) {
    return json(401, { ok: false, error: "Team passcode required or incorrect." });
  }
  return null;
}

function parseJson(body) {
  try {
    return { ok: true, data: JSON.parse(body || "{}") };
  } catch (error) {
    return { ok: false, error: "Invalid JSON body." };
  }
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) return `+${raw.replace(/\D/g, "")}`;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-blp-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}
