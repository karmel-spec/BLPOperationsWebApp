#!/usr/bin/env node
const APPROVED_TWILIO_FROM = "+18017010113";
const APPROVED_EMAIL_FROM = "brigham@brighamlarsonpianos.com";
const APPROVED_EMAIL_BCC = "info@brighamlarsonpianos.com";
const CONFIRM_PHRASE = "send live blp sales communication tests";

const baseUrl = (process.env.SALES_APP_URL || "").replace(/\/+$/, "");
const teamKey = process.env.BLP_APP_ACCESS_KEY || process.env.SALES_APP_ACCESS_KEY || "";
const testPhone = process.env.TEST_SALES_PHONE || "";
const testCallPhone = process.env.TEST_SALES_CALL_PHONE || testPhone;
const testEmail = process.env.TEST_SALES_EMAIL || "";
const confirmation = String(process.env.LIVE_SALES_TEST_CONFIRM || "").trim().toLowerCase();

if (!baseUrl || !teamKey || !testPhone || !testCallPhone || !testEmail || confirmation !== CONFIRM_PHRASE) {
  console.error("This script sends one live SMS, starts one live bridge call, and sends one live email.");
  console.error("Required environment variables:");
  console.error("  SALES_APP_URL=https://your-site.netlify.app");
  console.error("  BLP_APP_ACCESS_KEY=...");
  console.error("  TEST_SALES_PHONE=+18015551212");
  console.error("  TEST_SALES_CALL_PHONE=+18015551212  (optional; defaults to TEST_SALES_PHONE)");
  console.error("  TEST_SALES_EMAIL=person@example.com");
  console.error(`  LIVE_SALES_TEST_CONFIRM="${CONFIRM_PHRASE}"`);
  process.exit(2);
}

(async () => {
  await assertLiveStatus();

  const stamp = new Date().toISOString();
  const sms = await postJson("sales-send-sms", {
    to: testPhone,
    body: `BLP Sales Console live SMS test from ${APPROVED_TWILIO_FROM}. Timestamp: ${stamp}`,
  });
  console.log(`SMS test accepted by provider. sid=${sms.sid || "n/a"} to=${sms.to || "n/a"}`);

  const call = await postJson("sales-start-call", { to: testCallPhone });
  console.log(`Call test started. sid=${call.sid || "n/a"} bridge=${call.bridgeNumber || "n/a"} customer=${call.to || "n/a"}`);

  const email = await postJson("sales-send-email", {
    to: testEmail,
    subject: `BLP Sales Console live email test ${stamp}`,
    body: [
      "This is a controlled BLP Sales Console live email test.",
      `Expected sender: ${APPROVED_EMAIL_FROM}`,
      `Expected BCC: ${APPROVED_EMAIL_BCC}`,
      `Timestamp: ${stamp}`,
    ].join("\n"),
  });
  console.log(`Email test accepted by provider. from=${email.from || "n/a"} bcc=${email.bcc || "n/a"} to=${email.to || "n/a"}`);

  console.log("Live communication test requests completed.");
  console.log("Now manually confirm receipt/caller ID/BCC in the receiving phone and inboxes.");
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

async function assertLiveStatus() {
  const status = await getJson("sales-communications-status");
  const failures = [];
  if (!status.configured) failures.push("status endpoint reports configured=false");
  if (((status.status || {}).sms || {}).from !== APPROVED_TWILIO_FROM) failures.push(`SMS from is not ${APPROVED_TWILIO_FROM}`);
  if (((status.status || {}).call || {}).from !== APPROVED_TWILIO_FROM) failures.push(`call from is not ${APPROVED_TWILIO_FROM}`);
  if (!(((status.status || {}).call || {}).bridgeConfigured)) failures.push("call bridge is not configured");
  if (((status.status || {}).email || {}).from !== APPROVED_EMAIL_FROM) failures.push(`email from is not ${APPROVED_EMAIL_FROM}`);
  if (((status.status || {}).email || {}).bcc !== APPROVED_EMAIL_BCC) failures.push(`email BCC is not ${APPROVED_EMAIL_BCC}`);
  if (failures.length) throw new Error(`Live status check failed before sending tests:\n- ${failures.join("\n- ")}`);
}

async function getJson(functionName) {
  const response = await fetch(`${baseUrl}/.netlify/functions/${functionName}`, {
    headers: { "x-blp-key": teamKey },
    cache: "no-store",
  });
  return parseResponse(functionName, response);
}

async function postJson(functionName, payload) {
  const response = await fetch(`${baseUrl}/.netlify/functions/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-blp-key": teamKey,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse(functionName, response);
}

async function parseResponse(functionName, response) {
  let body = {};
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`${functionName} returned HTTP ${response.status} without JSON`);
  }
  if (response.status === 401) throw new Error(`${functionName} rejected BLP_APP_ACCESS_KEY`);
  if (!response.ok || !body.ok) {
    throw new Error(`${functionName} failed: ${body.error || `HTTP ${response.status}`} ${body.detail || ""}`.trim());
  }
  return body;
}
