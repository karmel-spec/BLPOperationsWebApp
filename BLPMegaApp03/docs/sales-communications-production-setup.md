# Sales Communications Production Setup

This runbook finishes the live communication wiring for the BLP Sales Console.

The app code already routes sales communication actions through Netlify Functions first, then falls back to native device actions during local/static preview:

- Text: `/.netlify/functions/sales-send-sms`
- Call: `/.netlify/functions/sales-start-call`
- Email: `/.netlify/functions/sales-send-email`
- Configuration status: `/.netlify/functions/sales-communications-status`

Do not put real credentials in HTML, JavaScript, markdown, or `.env` files committed to git. Store production values in Netlify environment variables.

Use `docs/sales-communications-credential-intake.md` to gather owners, required variable names, and safe test recipients without recording secret values.

## Required Accounts

### Twilio

Use the approved BLP business number:

```text
+18017010113
```

Confirm in Twilio:

- The number is owned by, or fully verified in, the Twilio account.
- SMS is enabled for the number.
- Voice calling is enabled for the number.
- The account is allowed to send messages/calls to the customer regions BLP uses.

The functions reject any `TWILIO_FROM_NUMBER` other than `+18017010113`.

### Gmail Provider

The Netlify email function uses the Gmail API with OAuth. Confirm:

- The Google Cloud project has the Gmail API enabled.
- The OAuth consent screen is configured for BLP/Google Workspace.
- The OAuth client has `http://localhost:7777/oauth2callback` registered as a redirect URI for the local authorization helper.
- `brigham@brighamlarsonpianos.com` authorizes the app with the `https://www.googleapis.com/auth/gmail.send` scope.
- BCC to `info@brighamlarsonpianos.com` is allowed.

The email function rejects any sender other than `brigham@brighamlarsonpianos.com` or any BCC other than `info@brighamlarsonpianos.com`.

## Netlify Environment Variables

Set these in Netlify for the `BLPMegaApp03` site:

```text
BLP_APP_ACCESS_KEY=
SALES_LEADS_APPS_SCRIPT_URL=
SALES_LEADS_SYNC_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+18017010113
SALES_CALL_BRIDGE_NUMBER=
BRIGHAM_LEAD_ALERT_PHONE=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GMAIL_SEND_AS=brigham@brighamlarsonpianos.com
SALES_EMAIL_BCC=info@brighamlarsonpianos.com
```

`SALES_CALL_BRIDGE_NUMBER` is the staff phone Twilio calls first. After staff answers, Twilio dials the customer with `+18017010113` as caller ID.

`BRIGHAM_LEAD_ALERT_PHONE` is used by the existing new-lead alert function. It may be the same staff phone as `SALES_CALL_BRIDGE_NUMBER`, but it does not have to be.

To create `GOOGLE_REFRESH_TOKEN`, run the local Gmail authorization helper from `BLPMegaApp03` after creating the Google OAuth client:

```bash
GOOGLE_CLIENT_ID=your-client-id GOOGLE_CLIENT_SECRET=your-client-secret node scripts/gmail-oauth-local-authorize.js
```

Open the printed URL, sign in as `brigham@brighamlarsonpianos.com`, approve Gmail send access, then copy only the printed `GOOGLE_REFRESH_TOKEN` value into Netlify.

## Local Checks Before Deploy

From `BLPMegaApp03`:

```bash
node scripts/verify-sales-communications.js
```

For one concise local readiness summary:

```bash
node scripts/sales-communications-readiness.js /path/to/local-sales.env
```

Expected result:

```text
All sales communication verification checks passed.
```

Before copying values into Netlify, validate a local env-style file without printing secrets:

```bash
node scripts/validate-sales-communications-env.js /path/to/local-sales.env
```

Expected result:

```text
Sales communication environment has the required keys and approved identities.
TWILIO_FROM_NUMBER=+18017010113
GMAIL_SEND_AS=brigham@brighamlarsonpianos.com
SALES_EMAIL_BCC=info@brighamlarsonpianos.com
Secrets were not printed.
```

From the repository root, the unconfigured-state smoke test should return `501` with missing-variable lists when secrets are absent:

```bash
env -i PATH="$PATH" BLP_APP_ACCESS_KEY=test node - <<'NODE'
const funcs = [
  ['sms', './BLPMegaApp03/netlify/functions/sales-send-sms.js', 'POST', { to: '801-555-1212', body: 'hello' }],
  ['email', './BLPMegaApp03/netlify/functions/sales-send-email.js', 'POST', { to: 'client@example.com', subject: 'hello', body: 'body' }],
  ['call', './BLPMegaApp03/netlify/functions/sales-start-call.js', 'POST', { to: '801-555-1212' }],
  ['status', './BLPMegaApp03/netlify/functions/sales-communications-status.js', 'GET', null],
];
(async () => {
  for (const [name, file, method, body] of funcs) {
    const mod = require(file);
    const res = await mod.handler({ httpMethod: method, headers: { 'x-blp-key': 'test' }, body: body ? JSON.stringify(body) : '' });
    const parsed = JSON.parse(res.body);
    console.log(name, res.statusCode, parsed.configured === false, parsed.required ? parsed.required.join(',') : JSON.stringify(parsed.status));
  }
})();
NODE
```

Expected missing-variable summary:

```text
sms 501 true TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_FROM_NUMBER
email 501 true GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,GOOGLE_REFRESH_TOKEN,GMAIL_SEND_AS,SALES_EMAIL_BCC
call 501 true TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_FROM_NUMBER,SALES_CALL_BRIDGE_NUMBER
status 200 true ...
```

## Production Verification

After deploying with real Netlify environment variables:

1. Open the Sales Console in production.
2. Enter the BLP team passcode when prompted.
3. Run the live status checker:
   ```bash
   SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=your-passcode node scripts/check-live-sales-communications.js
   ```
4. Confirm it prints `Live sales communications status is configured.`
5. Run one controlled live test with internal recipients:
   ```bash
   SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=your-passcode TEST_SALES_PHONE=+18015551212 TEST_SALES_EMAIL=test@example.com LIVE_SALES_TEST_CONFIRM="send live blp sales communication tests" node scripts/run-live-sales-communications-test.js
   ```
6. Confirm the SMS arrives from `801-701-0113`.
7. Confirm Twilio calls the bridge phone first, then connects to the customer/test phone with `801-701-0113` as caller ID.
8. Confirm the email sends from `brigham@brighamlarsonpianos.com`.
9. Confirm `info@brighamlarsonpianos.com` receives the BCC.
10. Use a test lead with a safe internal phone and email in the Sales Console UI.
11. Click each text, phone, and email icon/button.
12. Confirm the lead timeline records each attempted action.
13. Record the results in `docs/sales-communications-live-test-record.md`.
14. Validate the completed record:
   ```bash
   node scripts/check-sales-live-test-record.js
   ```

Only after those live checks pass should the communication goal be considered production complete.
