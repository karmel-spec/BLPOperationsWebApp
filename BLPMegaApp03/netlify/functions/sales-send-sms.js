const twilioMessagesEndpoint = (accountSid) =>
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

const APPROVED_SMS_FROM_NUMBER = "+18019236643";

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
  const fromNumber = normalizePhone(process.env.TWILIO_SMS_FROM_NUMBER);

  if (!accountSid || !authToken || !fromNumber) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Twilio SMS is not configured yet.",
      required: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_SMS_FROM_NUMBER"],
    });
  }
  if (fromNumber !== APPROVED_SMS_FROM_NUMBER) {
    return json(501, {
      ok: false,
      configured: false,
      error: "TWILIO_SMS_FROM_NUMBER must be the approved BLP sales SMS number.",
      required: ["TWILIO_SMS_FROM_NUMBER=+18019236643"],
      received: fromNumber,
    });
  }

  const payload = parseJson(event.body);
  if (!payload.ok) return json(400, { ok: false, error: payload.error });

  const to = normalizePhone(payload.data.to);
  const body = String(payload.data.body || "").trim();

  if (!to) return json(400, { ok: false, error: "A valid destination phone number is required." });
  if (!body) return json(400, { ok: false, error: "Message body is required." });

  const form = new URLSearchParams({ To: to, From: fromNumber, Body: body });
  let response;
  try {
    response = await fetch(twilioMessagesEndpoint(accountSid), {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
  } catch (error) {
    return json(502, { ok: false, error: "Twilio SMS request failed.", detail: String(error.message || error).slice(0, 800) });
  }

  const text = await response.text();
  if (!response.ok) {
    return json(response.status, { ok: false, error: "Twilio SMS send failed.", detail: text.slice(0, 800) });
  }

  let twilio = {};
  try { twilio = JSON.parse(text); } catch (error) {}
  return json(200, { ok: true, sid: twilio.sid || null, from: fromNumber, to });
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
