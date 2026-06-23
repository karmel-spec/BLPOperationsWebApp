#!/usr/bin/env node
const APPROVED_TWILIO_FROM = "+18017010113";
const APPROVED_EMAIL_FROM = "brigham@brighamlarsonpianos.com";
const APPROVED_EMAIL_BCC = "info@brighamlarsonpianos.com";

const rawBaseUrl = process.argv[2] || process.env.SALES_APP_URL || "";
const teamKey = process.env.BLP_APP_ACCESS_KEY || process.env.SALES_APP_ACCESS_KEY || "";

if (!rawBaseUrl || !teamKey) {
  console.error("Usage: SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=... node scripts/check-live-sales-communications.js");
  console.error("Or:    BLP_APP_ACCESS_KEY=... node scripts/check-live-sales-communications.js https://your-site.netlify.app");
  process.exit(2);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");
const statusUrl = `${baseUrl}/.netlify/functions/sales-communications-status`;

(async () => {
  let response;
  try {
    response = await fetch(statusUrl, {
      headers: { "x-blp-key": teamKey },
      cache: "no-store",
    });
  } catch (error) {
    console.error(`Could not reach ${statusUrl}`);
    console.error(String(error.message || error));
    process.exit(1);
  }

  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    console.error(`Status endpoint did not return JSON. HTTP ${response.status}`);
    process.exit(1);
  }

  if (response.status === 401) {
    console.error("Live communications check failed: BLP_APP_ACCESS_KEY was rejected.");
    process.exit(1);
  }

  if (!response.ok || !body.ok) {
    console.error(`Live communications check failed: HTTP ${response.status}`);
    console.error(body.error || JSON.stringify(body, null, 2));
    process.exit(1);
  }

  const failures = [];
  const status = body.status || {};

  requireConfigured(status.sms, "sms", failures);
  requireConfigured(status.call, "call", failures);
  requireConfigured(status.email, "email", failures);

  if ((status.sms || {}).from !== APPROVED_TWILIO_FROM) failures.push(`sms from must be ${APPROVED_TWILIO_FROM}`);
  if ((status.call || {}).from !== APPROVED_TWILIO_FROM) failures.push(`call from must be ${APPROVED_TWILIO_FROM}`);
  if (!(status.call || {}).bridgeConfigured) failures.push("call bridge must be configured");
  if ((status.email || {}).from !== APPROVED_EMAIL_FROM) failures.push(`email from must be ${APPROVED_EMAIL_FROM}`);
  if ((status.email || {}).bcc !== APPROVED_EMAIL_BCC) failures.push(`email BCC must be ${APPROVED_EMAIL_BCC}`);

  if (failures.length || !body.configured) {
    console.error("Live communications are not fully configured:");
    for (const failure of failures) console.error(`- ${failure}`);
    console.error("Status summary:");
    console.error(JSON.stringify(redactStatus(status), null, 2));
    process.exit(1);
  }

  console.log("Live sales communications status is configured.");
  console.log(`SMS/call from: ${APPROVED_TWILIO_FROM}`);
  console.log(`Email from: ${APPROVED_EMAIL_FROM}`);
  console.log(`Email BCC: ${APPROVED_EMAIL_BCC}`);
  console.log("No SMS, call, or email was sent by this check.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function requireConfigured(channel, name, failures) {
  if (!channel || !channel.configured) {
    const missing = channel && Array.isArray(channel.missing) && channel.missing.length
      ? ` missing ${channel.missing.join(", ")}`
      : "";
    failures.push(`${name} is not configured${missing}`);
  }
  for (const key of ["mismatch", "fromMismatch", "bccMismatch"]) {
    if (channel && channel[key]) failures.push(`${name}: ${channel[key]}`);
  }
}

function redactStatus(status) {
  return Object.fromEntries(
    Object.entries(status || {}).map(([key, value]) => [
      key,
      {
        configured: !!value.configured,
        missing: value.missing || [],
        from: value.from,
        bcc: value.bcc,
        bridgeConfigured: value.bridgeConfigured,
        mismatch: value.mismatch,
        fromMismatch: value.fromMismatch,
        bccMismatch: value.bccMismatch,
      },
    ])
  );
}
