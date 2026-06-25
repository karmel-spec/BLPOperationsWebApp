#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const recordPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "docs/sales-communications-live-test-record.md");

const text = fs.readFileSync(recordPath, "utf8");
const fields = parseBulletFields(text);

const requiredNonEmpty = [
  "Date tested",
  "Tester",
  "Production URL",
  "Git commit / deploy ID",
  "Result",
  "SMS provider SID recorded by script",
  "Call provider SID recorded by script",
  "Email accepted by provider",
  "Remaining issues",
];

const requiredYes = [
  "SMS arrived",
  "SMS sender displayed as `801-923-6643`",
  "Bridge phone rang first",
  "Test phone/customer leg connected",
  "Caller ID displayed as `801-701-0113`",
  "Email arrived at test inbox",
  "Email sender displayed as `brigham@brighamlarsonpianos.com`",
  "BCC arrived at `info@brighamlarsonpianos.com`",
  "Text icon/button triggers SMS workflow",
  "Phone icon/button triggers call workflow",
  "Email icon/button triggers email workflow",
  "Lead timeline records the text attempt",
  "Lead timeline records the call attempt",
  "Lead timeline records the email attempt",
  "Production communication goal ready to mark complete",
];

const failures = [];

for (const field of requiredNonEmpty) {
  const value = fields[field] || "";
  if (!value || isPlaceholder(value)) failures.push(`${field} is blank or placeholder`);
}

for (const field of requiredYes) {
  const value = fields[field] || "";
  if (!isAffirmative(value)) failures.push(`${field} must be confirmed yes/true/pass`);
}

if (containsLikelySecret(text)) {
  failures.push("record appears to contain a secret/token/passcode; remove it and store secrets only in Netlify");
}

if (failures.length) {
  console.error("Sales communications live test record is not complete:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sales communications live test record is complete enough for completion review.");
console.log("No obvious secrets were found.");

function parseBulletFields(markdown) {
  const result = {};
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^- ([^:]+):\s*(.*)$/);
    if (!match) continue;
    result[match[1].trim()] = match[2].trim();
  }
  return result;
}

function isPlaceholder(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized ||
    normalized === "todo" ||
    normalized === "tbd" ||
    normalized === "n/a" ||
    normalized === "your-passcode" ||
    normalized === "test@example.com" ||
    normalized.includes("your-site.netlify.app") ||
    normalized.includes("18015551212");
}

function isAffirmative(value) {
  return /^(yes|true|pass|passed|confirmed|complete|ok)\b/i.test(String(value || "").trim());
}

function containsLikelySecret(markdown) {
  const suspicious = [
    /BLP_APP_ACCESS_KEY\s*=\s*(?!your-passcode\b)(?!\.\.\.\b)\S+/i,
    /TWILIO_AUTH_TOKEN\s*=\s*(?!\.\.\.\b)\S+/i,
    /GOOGLE_CLIENT_SECRET\s*=\s*(?!\.\.\.\b)\S+/i,
    /GOOGLE_REFRESH_TOKEN\s*=\s*(?!\.\.\.\b)\S+/i,
    /\bSG\.[A-Za-z0-9_-]{12,}/,
    /\bAC[a-f0-9]{32}\b/i,
  ];
  return suspicious.some((pattern) => pattern.test(markdown));
}
