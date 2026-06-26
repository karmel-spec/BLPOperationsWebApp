#!/usr/bin/env node
const fs = require("fs");

const APPROVED_TWILIO_SMS_FROM = "+18017690054";
const APPROVED_TWILIO_CALLER_ID = "+18017010113";
const APPROVED_EMAIL_FROM = "brigham@brighamlarsonpianos.com";
const APPROVED_EMAIL_BCC = "info@brighamlarsonpianos.com";

const required = [
  "BLP_APP_ACCESS_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_SMS_FROM_NUMBER",
  "TWILIO_CALLER_ID_NUMBER",
  "SALES_CALL_BRIDGE_NUMBER",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GMAIL_SEND_AS",
  "SALES_EMAIL_BCC",
];

const source = process.argv[2] ? readEnvFile(process.argv[2]) : process.env;
const failures = [];

for (const key of required) {
  if (!String(source[key] || "").trim()) failures.push(`${key} is missing`);
}

if (normalizePhone(source.TWILIO_SMS_FROM_NUMBER) !== APPROVED_TWILIO_SMS_FROM) {
  failures.push(`TWILIO_SMS_FROM_NUMBER must be ${APPROVED_TWILIO_SMS_FROM}`);
}

if (normalizePhone(source.TWILIO_CALLER_ID_NUMBER) !== APPROVED_TWILIO_CALLER_ID) {
  failures.push(`TWILIO_CALLER_ID_NUMBER must be ${APPROVED_TWILIO_CALLER_ID}`);
}

if (normalizeEmail(source.GMAIL_SEND_AS) !== APPROVED_EMAIL_FROM) {
  failures.push(`GMAIL_SEND_AS must be ${APPROVED_EMAIL_FROM}`);
}

if (normalizeEmail(source.SALES_EMAIL_BCC) !== APPROVED_EMAIL_BCC) {
  failures.push(`SALES_EMAIL_BCC must be ${APPROVED_EMAIL_BCC}`);
}

if (!normalizePhone(source.SALES_CALL_BRIDGE_NUMBER)) {
  failures.push("SALES_CALL_BRIDGE_NUMBER must be a valid US phone number or E.164 number");
}

if (failures.length) {
  console.error("Sales communication environment is not ready:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sales communication environment has the required keys and approved identities.");
console.log(`TWILIO_SMS_FROM_NUMBER=${APPROVED_TWILIO_SMS_FROM}`);
console.log(`TWILIO_CALLER_ID_NUMBER=${APPROVED_TWILIO_CALLER_ID}`);
console.log(`GMAIL_SEND_AS=${APPROVED_EMAIL_FROM}`);
console.log(`SALES_EMAIL_BCC=${APPROVED_EMAIL_BCC}`);
console.log("Secrets were not printed.");

function readEnvFile(filePath) {
  const env = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    env[match[1]] = unquote(match[2].trim());
  }
  return env;
}

function unquote(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}
