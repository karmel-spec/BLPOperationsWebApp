const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-blp-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "GET") {
    return json(405, { ok: false, error: "GET required" });
  }

  const accessKey = process.env.BLP_APP_ACCESS_KEY;
  if (!accessKey) {
    return json(501, { ok: false, configured: false, error: "BLP_APP_ACCESS_KEY is not set in Netlify env vars." });
  }
  const providedKey = event.headers["x-blp-key"] || event.headers["X-Blp-Key"] || "";
  if (providedKey !== accessKey) {
    return json(401, { ok: false, error: "Team passcode required or incorrect." });
  }


  const appsScriptUrl = process.env.SALES_LEADS_APPS_SCRIPT_URL;
  const syncSecret = process.env.SALES_LEADS_SYNC_SECRET;

  if (!appsScriptUrl || !syncSecret) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Sales leads sync is not configured yet.",
      required: ["SALES_LEADS_APPS_SCRIPT_URL", "SALES_LEADS_SYNC_SECRET"],
    });
  }

  const url = new URL(appsScriptUrl);
  url.searchParams.set("secret", syncSecret);
  url.searchParams.set("action", "list");

  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    return json(response.status, { ok: false, error: "Apps Script read failed.", detail: text.slice(0, 800) });
  }

  try {
    const data = JSON.parse(text);
    return json(200, data);
  } catch (error) {
    return json(502, { ok: false, error: "Apps Script returned non-JSON data.", detail: text.slice(0, 800) });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}
