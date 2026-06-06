const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "POST required" });
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

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  const response = await fetch(appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, secret: syncSecret }),
  });
  const text = await response.text();

  if (!response.ok) {
    return json(response.status, { ok: false, error: "Apps Script write failed.", detail: text.slice(0, 800) });
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
