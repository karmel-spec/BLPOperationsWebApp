const twilioEndpoint = (accountSid) =>
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

const repLabels = {
  sally: "Sally",
  brigham: "Brigham",
  karmel: "Karmel",
  admin: "Admin",
};

function repName(value) {
  return repLabels[value] || value || "";
}

function formatLeadMessage(lead) {
  const lines = [
    "New BLP sales lead",
    `${lead.name || "Unknown lead"}${lead.temp ? ` | Temp ${lead.temp}/10` : ""}`,
    lead.instrument ? `Need: ${lead.instrument}` : "",
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.email ? `Email: ${lead.email}` : "",
    lead.location ? `Location: ${lead.location}` : "",
    lead.lead_type ? `Type: ${lead.lead_type}` : "",
    lead.piano_type ? `Piano: ${lead.piano_type}` : "",
    lead.band ? `Value: ${lead.band}` : "",
    lead.rep_opened ? `Opened by: ${repName(lead.rep_opened)}` : "",
    (lead.rep_working || lead.rep) ? `Working rep: ${repName(lead.rep_working || lead.rep)}` : "",
    lead.source ? `Source: ${lead.source}` : "",
    lead.inquiry_method ? `Inquiry: ${lead.inquiry_method}` : "",
    lead.next ? `Next: ${lead.next}` : "",
    lead.notes ? `Notes: ${lead.notes}` : "",
  ].filter(Boolean);

  return lines.join("\n").slice(0, 1500);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders() };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "POST required" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const brighamNumber = process.env.BRIGHAM_LEAD_ALERT_PHONE;

  if (!accountSid || !authToken || !fromNumber || !brighamNumber) {
    return json(500, {
      ok: false,
      error: "SMS environment variables are not configured.",
      required: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER", "BRIGHAM_LEAD_ALERT_PHONE"],
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { ok: false, error: "Invalid JSON body." });
  }

  const lead = payload.lead || {};
  const body = formatLeadMessage(lead);

  if (!lead.name && !lead.phone && !lead.email) {
    return json(400, { ok: false, error: "Lead details are missing." });
  }

  const form = new URLSearchParams({
    To: brighamNumber,
    From: fromNumber,
    Body: body,
  });

  const response = await fetch(twilioEndpoint(accountSid), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const result = await response.text();

  if (!response.ok) {
    return json(response.status, { ok: false, error: "Twilio send failed.", detail: result.slice(0, 800) });
  }

  return json(200, { ok: true });
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
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
