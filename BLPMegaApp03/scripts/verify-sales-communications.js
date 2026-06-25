const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const salesHtmlPath = path.join(root, "modules/sales-console/index.html");
const envExamplePath = path.join(root, ".env.example");
const appReadmePath = path.join(root, "README.md");
const salesReadmePath = path.join(root, "modules/sales-console/README.md");
const runbookPath = path.join(root, "docs/sales-communications-production-setup.md");
const credentialIntakePath = path.join(root, "docs/sales-communications-credential-intake.md");
const liveTestRecordPath = path.join(root, "docs/sales-communications-live-test-record.md");
const functionsDir = path.join(root, "netlify/functions");

const requiredFiles = [
  salesHtmlPath,
  envExamplePath,
  appReadmePath,
  salesReadmePath,
  runbookPath,
  credentialIntakePath,
  liveTestRecordPath,
  path.join(functionsDir, "sales-send-sms.js"),
  path.join(functionsDir, "sales-send-email.js"),
  path.join(functionsDir, "sales-start-call.js"),
  path.join(functionsDir, "sales-communications-status.js"),
  path.join(root, "scripts/check-live-sales-communications.js"),
  path.join(root, "scripts/run-live-sales-communications-test.js"),
  path.join(root, "scripts/audit-sales-communication-icons.js"),
  path.join(root, "scripts/gmail-oauth-local-authorize.js"),
  path.join(root, "scripts/validate-sales-communications-env.js"),
  path.join(root, "scripts/sales-communications-readiness.js"),
  path.join(root, "scripts/check-sales-live-test-record.js"),
];

const requiredEnvKeys = [
  "BLP_APP_ACCESS_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_SMS_FROM_NUMBER=+18019236643",
  "TWILIO_CALLER_ID_NUMBER=+18017010113",
  "SALES_CALL_BRIDGE_NUMBER",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GMAIL_SEND_AS=brigham@brighamlarsonpianos.com",
  "SALES_EMAIL_BCC=info@brighamlarsonpianos.com",
];

const requiredHtmlSnippets = [
  "const SALES_SMS_ENDPOINT = '/.netlify/functions/sales-send-sms';",
  "const SALES_EMAIL_ENDPOINT = '/.netlify/functions/sales-send-email';",
  "const SALES_CALL_ENDPOINT = '/.netlify/functions/sales-start-call';",
  "const SALES_COMMS_STATUS_ENDPOINT = '/.netlify/functions/sales-communications-status';",
  "const SALES_TWILIO_SMS_DISPLAY = '801-923-6643';",
  "const SALES_TWILIO_CALLER_ID_DISPLAY = '801-701-0113';",
  "const SALES_EMAIL_FROM = 'brigham@brighamlarsonpianos.com';",
  "const SALES_EMAIL_BCC = 'info@brighamlarsonpianos.com';",
  "startRecommendedAction",
  "renderDrawerContactActions",
  "postCommunication(SALES_SMS_ENDPOINT",
  "postCommunication(SALES_EMAIL_ENDPOINT",
  "postCommunication(SALES_CALL_ENDPOINT",
  "loadCommunicationStatus",
  "startCommunicationStatusChecks",
  "salesCommsStatus",
  "salesCommsText",
  "channel.mismatch",
  "channel.fromMismatch",
  "channel.bccMismatch",
  "openNativeSmsFallback",
  "openNativeEmailFallback",
  "openNativePhoneFallback",
];

const forbiddenHtmlSnippets = [
  "Save to Gmail Drafts",
  "send from info@",
  "send-from-info",
  "iMessage — from this Mac",
  "SalesCaptain SMS",
  "📵",
];

const checks = [];

function pass(label) {
  checks.push({ ok: true, label });
}

function fail(label) {
  checks.push({ ok: false, label });
}

function contains(text, snippet) {
  return text.includes(snippet);
}

async function withEnv(env, fn) {
  const previousEnv = {};
  for (const key of Object.keys(env)) {
    previousEnv[key] = process.env[key];
    process.env[key] = env[key];
  }
  try {
    await fn();
  } finally {
    for (const key of Object.keys(env)) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  }
}

async function withMockFetch(fn) {
  const previousFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url) === "https://oauth2.googleapis.com/token") {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          access_token: "mock-access-token",
          scope: "https://www.googleapis.com/auth/gmail.send",
        }),
      };
    }
    if (String(url) === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: "mock-gmail-message" }),
      };
    }
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ sid: "mocked-sid" }),
    };
  };
  try {
    await fn(calls);
  } finally {
    global.fetch = previousFetch;
  }
}

function loadFunction(relativePath) {
  const fullPath = path.join(root, relativePath);
  delete require.cache[require.resolve(fullPath)];
  return require(fullPath);
}

function event(body) {
  return {
    httpMethod: "POST",
    headers: { "x-blp-key": "test-key" },
    body: JSON.stringify(body),
  };
}

function assert(condition, label) {
  condition ? pass(label) : fail(label);
}

function decodeBase64Url(value) {
  return Buffer.from(String(value || "").replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

for (const file of requiredFiles) {
  fs.existsSync(file) ? pass(`exists: ${path.relative(root, file)}`) : fail(`missing: ${path.relative(root, file)}`);
}

const html = fs.readFileSync(salesHtmlPath, "utf8");
const envExample = fs.readFileSync(envExamplePath, "utf8");
const appReadme = fs.readFileSync(appReadmePath, "utf8");
const salesReadme = fs.readFileSync(salesReadmePath, "utf8");
const runbook = fs.readFileSync(runbookPath, "utf8");
const credentialIntake = fs.readFileSync(credentialIntakePath, "utf8");
const liveTestRecord = fs.readFileSync(liveTestRecordPath, "utf8");
const callFunctionSource = fs.readFileSync(path.join(functionsDir, "sales-start-call.js"), "utf8");
const statusFunctionSource = fs.readFileSync(path.join(functionsDir, "sales-communications-status.js"), "utf8");
const smsFunctionSource = fs.readFileSync(path.join(functionsDir, "sales-send-sms.js"), "utf8");
const emailFunctionSource = fs.readFileSync(path.join(functionsDir, "sales-send-email.js"), "utf8");

for (const snippet of requiredHtmlSnippets) {
  contains(html, snippet) ? pass(`html contains ${snippet}`) : fail(`html missing ${snippet}`);
}

for (const snippet of forbiddenHtmlSnippets) {
  !contains(html, snippet) ? pass(`html excludes ${snippet}`) : fail(`html still contains ${snippet}`);
}

contains(html, "onclick=\"callLead('${l.id}')\" ${!l.phone ? 'disabled title=\"No phone number on file\"' : ''}")
  ? pass("drawer next-action call button disables without phone")
  : fail("drawer next-action call button should disable without phone");

!contains(callFunctionSource, "BRIGHAM_LEAD_ALERT_PHONE")
  ? pass("call function requires explicit sales bridge number")
  : fail("call function still falls back to BRIGHAM_LEAD_ALERT_PHONE");

!contains(statusFunctionSource, "BRIGHAM_LEAD_ALERT_PHONE")
  ? pass("status function requires explicit sales bridge number")
  : fail("status function still falls back to BRIGHAM_LEAD_ALERT_PHONE");

contains(smsFunctionSource, 'APPROVED_SMS_FROM_NUMBER = "+18019236643"')
  ? pass("SMS function pins approved Twilio sender")
  : fail("SMS function should pin approved Twilio sender");

contains(callFunctionSource, 'APPROVED_CALLER_ID_NUMBER = "+18017010113"')
  ? pass("call function pins approved Twilio caller ID")
  : fail("call function should pin approved Twilio caller ID");

contains(emailFunctionSource, 'APPROVED_FROM_EMAIL = "brigham@brighamlarsonpianos.com"') &&
contains(emailFunctionSource, 'APPROVED_BCC_EMAIL = "info@brighamlarsonpianos.com"')
  ? pass("email function pins approved sender and BCC")
  : fail("email function should pin approved sender and BCC");

for (const key of requiredEnvKeys) {
  contains(envExample, key) ? pass(`env example contains ${key}`) : fail(`env example missing ${key}`);
  contains(runbook, key) ? pass(`runbook contains ${key}`) : fail(`runbook missing ${key}`);
}

contains(appReadme, "docs/sales-communications-production-setup.md")
  ? pass("app README links sales communications runbook")
  : fail("app README missing sales communications runbook link");

contains(appReadme, "scripts/check-live-sales-communications.js")
  ? pass("app README documents live communications checker")
  : fail("app README missing live communications checker");

contains(appReadme, "scripts/run-live-sales-communications-test.js")
  ? pass("app README documents live communications test runner")
  : fail("app README missing live communications test runner");

contains(salesReadme, "../../docs/sales-communications-production-setup.md")
  ? pass("sales README links sales communications runbook")
  : fail("sales README missing sales communications runbook link");

contains(salesReadme, "GMAIL_SEND_AS") && contains(salesReadme, "required; must be `brigham@brighamlarsonpianos.com`")
  ? pass("sales README marks approved sender as required")
  : fail("sales README should mark approved sender as required");

contains(runbook, "Production Verification")
  ? pass("runbook contains production verification checklist")
  : fail("runbook missing production verification checklist");

contains(runbook, "scripts/check-live-sales-communications.js") &&
contains(runbook, "Live sales communications status is configured.")
  ? pass("runbook documents live communications checker")
  : fail("runbook missing live communications checker");

contains(runbook, "scripts/run-live-sales-communications-test.js") &&
contains(runbook, "LIVE_SALES_TEST_CONFIRM=\"send live blp sales communication tests\"")
  ? pass("runbook documents guarded live communications test runner")
  : fail("runbook missing guarded live communications test runner");

contains(runbook, "docs/sales-communications-live-test-record.md") &&
contains(appReadme, "docs/sales-communications-live-test-record.md")
  ? pass("docs link live communications test record")
  : fail("docs should link live communications test record");

contains(runbook, "scripts/check-sales-live-test-record.js") &&
contains(appReadme, "scripts/check-sales-live-test-record.js")
  ? pass("docs mention live test record validator")
  : fail("docs should mention live test record validator");

contains(runbook, "docs/sales-communications-credential-intake.md") &&
contains(appReadme, "docs/sales-communications-credential-intake.md") &&
contains(credentialIntake, "Do not paste secrets") &&
contains(credentialIntake, "TWILIO_SMS_FROM_NUMBER`: must be `+18019236643`") &&
contains(credentialIntake, "TWILIO_CALLER_ID_NUMBER`: must be `+18017010113`") &&
contains(credentialIntake, "GMAIL_SEND_AS`: must be `brigham@brighamlarsonpianos.com`") &&
contains(credentialIntake, "SALES_EMAIL_BCC`: must be `info@brighamlarsonpianos.com`")
  ? pass("docs link credential intake and capture required approved identities")
  : fail("credential intake should document approved identities without secrets");

contains(liveTestRecord, "SMS sender displayed as `801-923-6643`") &&
contains(liveTestRecord, "Caller ID displayed as `801-701-0113`") &&
contains(liveTestRecord, "Email sender displayed as `brigham@brighamlarsonpianos.com`") &&
contains(liveTestRecord, "BCC arrived at `info@brighamlarsonpianos.com`") &&
contains(liveTestRecord, "Do not paste Twilio auth tokens")
  ? pass("live test record captures required proof without secrets")
  : fail("live test record missing required proof fields");

contains(appReadme, "scripts/audit-sales-communication-icons.js") ||
contains(runbook, "scripts/audit-sales-communication-icons.js")
  ? pass("docs mention communication icon audit")
  : fail("docs should mention communication icon audit");

contains(appReadme, "scripts/validate-sales-communications-env.js") &&
contains(runbook, "scripts/validate-sales-communications-env.js") &&
contains(runbook, "Secrets were not printed.")
  ? pass("docs mention redacted env validator")
  : fail("docs should mention redacted env validator");

contains(appReadme, "scripts/sales-communications-readiness.js") &&
contains(runbook, "scripts/sales-communications-readiness.js")
  ? pass("docs mention sales communications readiness summary")
  : fail("docs should mention sales communications readiness summary");

const inlineScripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
try {
  new Function(inlineScripts.join("\n;\n"));
  pass("sales console inline scripts parse");
} catch (error) {
  fail(`sales console inline scripts parse: ${error.message}`);
}

for (const file of requiredFiles.filter((file) => file.endsWith(".js"))) {
  try {
    new Function(fs.readFileSync(file, "utf8").replace(/^#!.*\n/, ""));
    pass(`function syntax: ${path.relative(root, file)}`);
  } catch (error) {
    fail(`function syntax failed: ${path.relative(root, file)}: ${error.message}`);
  }
}

async function verifyMockedProviderPayloads() {
  await withEnv({
    BLP_APP_ACCESS_KEY: "test-key",
    TWILIO_ACCOUNT_SID: "AC123",
    TWILIO_AUTH_TOKEN: "token",
    TWILIO_SMS_FROM_NUMBER: "+18019236643",
    TWILIO_CALLER_ID_NUMBER: "+18017010113",
    SALES_CALL_BRIDGE_NUMBER: "+18015550101",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    GOOGLE_REFRESH_TOKEN: "google-refresh-token",
    GMAIL_SEND_AS: "brigham@brighamlarsonpianos.com",
    SALES_EMAIL_BCC: "info@brighamlarsonpianos.com",
  }, async () => {
    await withMockFetch(async (calls) => {
      const sms = loadFunction("netlify/functions/sales-send-sms.js");
      const response = await sms.handler(event({ to: "801-555-1212", body: "Hello from BLP" }));
      const form = new URLSearchParams(calls[0].options.body);
      const body = JSON.parse(response.body);
      assert(response.statusCode === 200 && body.ok, "mock SMS function returns ok");
      assert(calls[0].url.includes("/Accounts/AC123/Messages.json"), "mock SMS uses Twilio messages endpoint");
      assert(form.get("From") === "+18019236643", "mock SMS sends from +18019236643");
      assert(form.get("To") === "+18015551212", "mock SMS normalizes destination phone");
      assert(form.get("Body") === "Hello from BLP", "mock SMS sends requested body");
    });

    await withMockFetch(async (calls) => {
      const email = loadFunction("netlify/functions/sales-send-email.js");
      const response = await email.handler(event({ to: "client@example.com", subject: "BLP follow-up", body: "Hi there" }));
      const tokenForm = new URLSearchParams(calls[0].options.body);
      const payload = JSON.parse(calls[1].options.body);
      const mime = decodeBase64Url(payload.raw);
      const body = JSON.parse(response.body);
      assert(response.statusCode === 200 && body.ok, "mock email function returns ok");
      assert(calls[0].url === "https://oauth2.googleapis.com/token", "mock email refreshes Google OAuth token");
      assert(tokenForm.get("grant_type") === "refresh_token", "mock email uses Google refresh token grant");
      assert(calls[1].url === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send", "mock email uses Gmail send endpoint");
      assert(calls[1].options.headers.Authorization === "Bearer mock-access-token", "mock email sends Gmail access token");
      assert(mime.includes("From: brigham@brighamlarsonpianos.com"), "mock email sends from brigham@");
      assert(mime.includes("Bcc: info@brighamlarsonpianos.com"), "mock email includes info@ BCC");
      assert(mime.includes("To: client@example.com"), "mock email sends to requested recipient");
      assert(mime.includes("Subject: BLP follow-up"), "mock email sends requested subject");
      assert(mime.includes("Hi there"), "mock email sends requested body");
    });

    await withMockFetch(async (calls) => {
      const call = loadFunction("netlify/functions/sales-start-call.js");
      const response = await call.handler(event({ to: "385-555-2222" }));
      const form = new URLSearchParams(calls[0].options.body);
      const twiml = form.get("Twiml") || "";
      const body = JSON.parse(response.body);
      assert(response.statusCode === 200 && body.ok, "mock call function returns ok");
      assert(calls[0].url.includes("/Accounts/AC123/Calls.json"), "mock call uses Twilio calls endpoint");
      assert(form.get("From") === "+18017010113", "mock call originates from +18017010113");
      assert(form.get("To") === "+18015550101", "mock call first dials bridge phone");
      assert(twiml.includes('callerId="+18017010113"'), "mock call TwiML uses approved caller ID");
      assert(twiml.includes("+13855552222"), "mock call TwiML dials normalized customer phone");
    });

    const status = loadFunction("netlify/functions/sales-communications-status.js");
    const response = await status.handler({ httpMethod: "GET", headers: { "x-blp-key": "test-key" } });
    const body = JSON.parse(response.body);
    assert(response.statusCode === 200 && body.ok, "mock status function returns ok");
    assert(body.configured === true, "mock status reports fully configured");
    assert(body.status.sms.from === "+18019236643", "mock status reports approved SMS number");
    assert(body.status.call.from === "+18017010113", "mock status reports approved call number");
    assert(body.status.email.from === "brigham@brighamlarsonpianos.com", "mock status reports brigham@ sender");
    assert(body.status.email.bcc === "info@brighamlarsonpianos.com", "mock status reports info@ BCC");
  });

  await withEnv({
    BLP_APP_ACCESS_KEY: "test-key",
    TWILIO_ACCOUNT_SID: "AC123",
    TWILIO_AUTH_TOKEN: "token",
    TWILIO_SMS_FROM_NUMBER: "+18015550123",
    TWILIO_CALLER_ID_NUMBER: "+18015550123",
    SALES_CALL_BRIDGE_NUMBER: "+18015550101",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    GOOGLE_REFRESH_TOKEN: "google-refresh-token",
    GMAIL_SEND_AS: "someone-else@brighamlarsonpianos.com",
    SALES_EMAIL_BCC: "not-info@brighamlarsonpianos.com",
  }, async () => {
    const sms = loadFunction("netlify/functions/sales-send-sms.js");
    const smsResponse = await sms.handler(event({ to: "801-555-1212", body: "Hello from BLP" }));
    const smsBody = JSON.parse(smsResponse.body);
    assert(smsResponse.statusCode === 501 && smsBody.configured === false, "SMS rejects unapproved Twilio sender");

    const call = loadFunction("netlify/functions/sales-start-call.js");
    const callResponse = await call.handler(event({ to: "385-555-2222" }));
    const callBody = JSON.parse(callResponse.body);
    assert(callResponse.statusCode === 501 && callBody.configured === false, "call rejects unapproved Twilio caller ID");

    const email = loadFunction("netlify/functions/sales-send-email.js");
    const emailResponse = await email.handler(event({ to: "client@example.com", subject: "BLP follow-up", body: "Hi there" }));
    const emailBody = JSON.parse(emailResponse.body);
    assert(emailResponse.statusCode === 501 && emailBody.configured === false, "email rejects unapproved sender or BCC");

    const status = loadFunction("netlify/functions/sales-communications-status.js");
    const statusResponse = await status.handler({ httpMethod: "GET", headers: { "x-blp-key": "test-key" } });
    const statusBody = JSON.parse(statusResponse.body);
    assert(statusResponse.statusCode === 200 && statusBody.configured === false, "status reports unapproved identities as not configured");
    assert(statusBody.status.sms.mismatch && statusBody.status.call.mismatch, "status explains unapproved Twilio number");
    assert(statusBody.status.email.fromMismatch && statusBody.status.email.bccMismatch, "status explains unapproved email identities");
  });
}

(async () => {
  await verifyMockedProviderPayloads();

  const failures = checks.filter((check) => !check.ok);
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} sales communication verification check(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${checks.length} sales communication verification checks passed.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
