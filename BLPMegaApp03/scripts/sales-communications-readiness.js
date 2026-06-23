#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const envFile = process.argv[2] || "";

const requiredFiles = [
  "netlify/functions/sales-send-sms.js",
  "netlify/functions/sales-start-call.js",
  "netlify/functions/sales-send-email.js",
  "netlify/functions/sales-communications-status.js",
  "scripts/verify-sales-communications.js",
  "scripts/audit-sales-communication-icons.js",
  "scripts/validate-sales-communications-env.js",
  "scripts/check-live-sales-communications.js",
  "scripts/run-live-sales-communications-test.js",
  "docs/sales-communications-credential-intake.md",
  "docs/sales-communications-production-setup.md",
  "docs/sales-communications-live-test-record.md",
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missingFiles.length) {
  console.error("Sales communications readiness: missing local files");
  for (const file of missingFiles) console.error(`- ${file}`);
  process.exit(1);
}

const verify = runNode("scripts/verify-sales-communications.js");
const iconAudit = runNode("scripts/audit-sales-communication-icons.js");
const envValidation = envFile ? runNode("scripts/validate-sales-communications-env.js", [envFile]) : null;

if (!verify.ok || !iconAudit.ok || (envValidation && !envValidation.ok)) {
  console.error("Sales communications readiness failed.");
  if (!verify.ok) console.error("- Local communication verifier failed.");
  if (!iconAudit.ok) console.error("- Communication icon audit failed.");
  if (envValidation && !envValidation.ok) console.error("- Environment validator failed.");
  process.exit(1);
}

console.log("Sales communications local readiness passed.");
console.log("- Local communication verifier passed.");
console.log("- Communication icon audit passed.");
console.log(envValidation ? "- Environment validator passed." : "- Environment validator skipped; pass a local env file to check it.");
console.log("");
console.log("Remaining production gates:");
console.log("1. Enter real values in Netlify environment variables.");
console.log("2. Redeploy the production site.");
console.log("3. Run scripts/check-live-sales-communications.js against production.");
console.log("4. Run scripts/run-live-sales-communications-test.js with internal recipients.");
console.log("5. Record proof in docs/sales-communications-live-test-record.md.");

function runNode(script, args = []) {
  const result = spawnSync(process.execPath, [path.join(root, script), ...args], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  return { ok: result.status === 0, stdout: result.stdout, stderr: result.stderr };
}
