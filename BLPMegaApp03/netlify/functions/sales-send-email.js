const APPROVED_FROM_EMAIL = "brigham@brighamlarsonpianos.com";
const APPROVED_BCC_EMAIL = "info@brighamlarsonpianos.com";
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders() };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "POST required" });
  }

  const authError = requireTeamKey(event);
  if (authError) return authError;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const from = String(process.env.GMAIL_SEND_AS || "").trim().toLowerCase();
  const bcc = String(process.env.SALES_EMAIL_BCC || "").trim().toLowerCase();

  if (!clientId || !clientSecret || !refreshToken || !from || !bcc) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Sales Gmail sending is not configured yet.",
      required: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "GMAIL_SEND_AS", "SALES_EMAIL_BCC"],
      approved: { GMAIL_SEND_AS: APPROVED_FROM_EMAIL, SALES_EMAIL_BCC: APPROVED_BCC_EMAIL },
    });
  }
  if (from !== APPROVED_FROM_EMAIL || bcc !== APPROVED_BCC_EMAIL) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Sales email sender and BCC must match the approved BLP addresses.",
      approved: { GMAIL_SEND_AS: APPROVED_FROM_EMAIL, SALES_EMAIL_BCC: APPROVED_BCC_EMAIL },
      received: { GMAIL_SEND_AS: from, SALES_EMAIL_BCC: bcc },
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

  let accessToken;
  try {
    accessToken = await getGoogleAccessToken({ clientId, clientSecret, refreshToken });
  } catch (error) {
    return json(502, { ok: false, error: "Google OAuth token refresh failed.", detail: String(error.message || error).slice(0, 800) });
  }

  const raw = encodeBase64Url(buildMimeMessage({ from, to, bcc, subject, body }));
  let response;
  try {
    response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });
  } catch (error) {
    return json(502, { ok: false, error: "Gmail send request failed.", detail: String(error.message || error).slice(0, 800) });
  }

  const text = await response.text();
  if (!response.ok) {
    return json(response.status, { ok: false, error: "Gmail send failed.", detail: text.slice(0, 800) });
  }

  const result = parseJson(text);
  return json(200, { ok: true, provider: "gmail", from, bcc, to, messageId: result.ok ? result.data.id : undefined });
};

async function getGoogleAccessToken({ clientId, clientSecret, refreshToken }) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const text = await response.text();
  const parsed = parseJson(text);
  if (!response.ok || !parsed.ok || !parsed.data.access_token) {
    throw new Error(text || `Google token endpoint returned ${response.status}`);
  }
  if (parsed.data.scope && !String(parsed.data.scope).split(/\s+/).includes(GMAIL_SEND_SCOPE)) {
    throw new Error(`Google refresh token is missing ${GMAIL_SEND_SCOPE}`);
  }
  return parsed.data.access_token;
}

function buildMimeMessage({ from, to, bcc, subject, body }) {
  return [
    `From: ${sanitizeHeader(from)}`,
    `To: ${sanitizeHeader(to)}`,
    `Bcc: ${sanitizeHeader(bcc)}`,
    `Subject: ${sanitizeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

function encodeBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

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

function sanitizeHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
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
