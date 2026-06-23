# BLP Operating System

Top-layer launcher and module map for the expanding Brigham Larson Pianos webapp ecosystem.

## Current Modules

- Agent Operations Console: `../i-have-11-agents-2-in/index.html`
- Marketing Command Center: `../BLP Marketing WebApp/index.html`
- Shop Manager / Restoration Console: `../BLP-Chris-App-for-Lindsay-2026-06-03`
- Tuning CRM / Online Scheduling: `../BLP Tuning CRM WebApp`
- Onboarding & Training Portal: `../BLP-Onboarding-WebApp`

## Planned Modules

- Technician Dashboards
- Piano Log and Inventory
- Client CRM
- Restoration Pipeline
- Finance and Accounting
- Knowledge Vault
- Executive Vision Board

## Merge Direction

This folder is intentionally a shell, not a replacement for the current apps. As more agent-built modules arrive, use this top layer to:

- Preserve each existing module while it is evaluated.
- Define shared navigation and access tiers.
- Identify shared data sources and permissions.
- Prepare for a future unified app with login, roles, and module-level access.

## Imported Handoffs

- Chris Shop Manager: `docs/chris-shop-manager-handoff.md`
- Tuning CRM / Online Scheduling: `docs/tuning-crm-handoff.md`
- Onboarding & Training Portal: `docs/onboarding-webapp-handoff.md`
- Marketing Hermes agent connection intake: `docs/marketing-hermes-connection-intake.md`
- Sales communication credential intake: `docs/sales-communications-credential-intake.md`
- Sales communication production setup: `docs/sales-communications-production-setup.md`

## Netlify Environment

This app uses Netlify Functions for live sales data and communication actions. Store secrets in Netlify environment variables, not in browser code. Use `.env.example` as the placeholder checklist.

Sales communication actions require:

- `BLP_APP_ACCESS_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER=+18017010113`
- `SALES_CALL_BRIDGE_NUMBER`
- `SENDGRID_API_KEY`
- `SALES_EMAIL_FROM=brigham@brighamlarsonpianos.com`
- `SALES_EMAIL_BCC=info@brighamlarsonpianos.com`

The Sales Console will try Netlify Functions first. If communication credentials are missing during local/static preview, it falls back to native `sms:`, `tel:`, or `mailto:` actions where the browser/device supports them.

Run the local communication wiring verifier before deploying changes:

```bash
node scripts/verify-sales-communications.js
```

For one concise local readiness summary:

```bash
node scripts/sales-communications-readiness.js /path/to/local-sales.env
```

To audit that phone, text, and email icons are only used on working communication controls:

```bash
node scripts/audit-sales-communication-icons.js
```

Before deploying, validate a local env-style file or the current shell environment without printing secrets:

```bash
node scripts/validate-sales-communications-env.js /path/to/local-sales.env
```

After deploying Netlify environment variables, check production status without sending any SMS, call, or email:

```bash
SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=your-passcode node scripts/check-live-sales-communications.js
```

After that passes, run one controlled live test using internal recipients:

```bash
SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=your-passcode TEST_SALES_PHONE=+18015551212 TEST_SALES_EMAIL=test@example.com LIVE_SALES_TEST_CONFIRM="send live blp sales communication tests" node scripts/run-live-sales-communications-test.js
```

Record production proof in `docs/sales-communications-live-test-record.md` without pasting secrets or customer PII.

After filling the proof record, validate it before marking the production goal complete:

```bash
node scripts/check-sales-live-test-record.js
```
