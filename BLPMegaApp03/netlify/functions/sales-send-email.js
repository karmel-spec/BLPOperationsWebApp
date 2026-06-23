const APPROVED_FROM_EMAIL = "brigham@brighamlarsonpianos.com";
const APPROVED_BCC_EMAIL = "info@brighamlarsonpianos.com";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders() };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "POST required" });
  }

  const authError = requireTeamKey(event);
  if (authError) return authError;

  const apiKey = process.env.SENDGRID_API_KEY;
  const from = String(process.env.SALES_EMAIL_FROM || "").trim().toLowerCase();
  const bcc = String(process.env.SALES_EMAIL_BCC || "").trim().toLowerCase();

  if (!apiKey || !from || !bcc) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Sales email sending is not configured yet.",
      required: ["SENDGRID_API_KEY", "SALES_EMAIL_FROM", "SALES_EMAIL_BCC"],
      approved: { SALES_EMAIL_FROM: APPROVED_FROM_EMAIL, SALES_EMAIL_BCC: APPROVED_BCC_EMAIL },
    });
  }
  if (from !== APPROVED_FROM_EMAIL || bcc !== APPROVED_BCC_EMAIL) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Sales email sender and BCC must match the approved BLP addresses.",
      approved: { SALES_EMAIL_FROM: APPROVED_FROM_EMAIL, SALES_EMAIL_BCC: APPROVED_BCC_EMAIL },
      received: { SALES_EMAIL_FROM: from, SALES_EMAIL_BCC: bcc },
    });
  }

  const payload = parseJson(event.body);
  if (!payload.ok) return json(400, { ok: false, error: payload.error });

  const to = String(payload.data.to || "").trim();
  const subject = String(payload.data.subject || "").trim();
  const body = String(payload.data.body || "").trim();

  if (!isEmail(to)) return json(400, { ok: false, error: "A valid recipient email is required." });
  if (!subject) return json(400, { ok: false, error: "Subject is required." });
  if (!body) return json(400, { ok: false, error: "Email body is required." });

  let response;
  try {
    response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          bcc: isEmail(bcc) ? [{ email: bcc }] : [],
        }],
        from: { email: from },
        subject,
        content: [{ type: "text/plain", value: body }],
      }),
    });
  } catch (error) {
    return json(502, { ok: false, error: "Email provider request failed.", detail: String(error.message || error).slice(0, 800) });
  }

  const text = await response.text();
  if (!response.ok) {
    return json(response.status, { ok: false, error: "Email send failed.", detail: text.slice(0, 800) });
  }

  return json(200, { ok: true, from, bcc, to });
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

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
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
