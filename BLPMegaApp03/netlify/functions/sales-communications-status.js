const APPROVED_FROM_NUMBER = "+18017010113";
const APPROVED_FROM_EMAIL = "brigham@brighamlarsonpianos.com";
const APPROVED_BCC_EMAIL = "info@brighamlarsonpianos.com";

const groups = {
  sms: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
  call: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER", "SALES_CALL_BRIDGE_NUMBER"],
  email: ["SENDGRID_API_KEY", "SALES_EMAIL_FROM", "SALES_EMAIL_BCC"],
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders() };
  }

  if (event.httpMethod !== "GET") {
    return json(405, { ok: false, error: "GET required" });
  }

  const authError = requireTeamKey(event);
  if (authError) return authError;

  const status = Object.fromEntries(
    Object.entries(groups).map(([name, keys]) => {
      const missing = keys.filter((key) => !process.env[key]);
      return [name, { configured: missing.length === 0, missing }];
    })
  );

  const twilioFrom = normalizePhone(process.env.TWILIO_FROM_NUMBER);
  const emailFrom = String(process.env.SALES_EMAIL_FROM || "").trim().toLowerCase();
  const emailBcc = String(process.env.SALES_EMAIL_BCC || "").trim().toLowerCase();

  status.email.from = emailFrom || APPROVED_FROM_EMAIL;
  status.email.bcc = emailBcc || APPROVED_BCC_EMAIL;
  status.email.approvedFrom = APPROVED_FROM_EMAIL;
  status.email.approvedBcc = APPROVED_BCC_EMAIL;
  status.sms.from = twilioFrom || APPROVED_FROM_NUMBER;
  status.sms.approvedFrom = APPROVED_FROM_NUMBER;
  status.call.from = twilioFrom || APPROVED_FROM_NUMBER;
  status.call.approvedFrom = APPROVED_FROM_NUMBER;
  status.call.bridgeConfigured = !!process.env.SALES_CALL_BRIDGE_NUMBER;

  if (twilioFrom && twilioFrom !== APPROVED_FROM_NUMBER) {
    status.sms.configured = false;
    status.call.configured = false;
    status.sms.mismatch = "TWILIO_FROM_NUMBER must be +18017010113";
    status.call.mismatch = "TWILIO_FROM_NUMBER must be +18017010113";
  }
  if (emailFrom && emailFrom !== APPROVED_FROM_EMAIL) {
    status.email.configured = false;
    status.email.fromMismatch = "SALES_EMAIL_FROM must be brigham@brighamlarsonpianos.com";
  }
  if (emailBcc && emailBcc !== APPROVED_BCC_EMAIL) {
    status.email.configured = false;
    status.email.bccMismatch = "SALES_EMAIL_BCC must be info@brighamlarsonpianos.com";
  }

  return json(200, {
    ok: true,
    configured: status.sms.configured && status.call.configured && status.email.configured,
    status,
  });
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
