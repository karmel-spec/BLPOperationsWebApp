# Arnold — Hermes Chief Sales Agent: Setup

Arnold is the AI sales agent for Brigham Larson Pianos. He is wired into the
sales console in three places:

1. **Draft writing** — `netlify/functions/arnold-draft.js`. When a draft is
   opened in the console's editor (or regenerated), Arnold rewrites it through
   the Claude API in Brigham's voice. The console's rule-based drafts remain
   the instant fallback, so nothing breaks if Arnold is offline.
2. **Morning oversight** — `netlify/functions/arnold-morning-digest.js`,
   scheduled in `netlify.toml` for 13:00 UTC daily (7:00 AM Mountain in
   summer). Pulls the live Leads Log, finds what needs attention (hot leads
   going cold, new leads, lonely leads, 30-day takeovers), and texts Brigham a
   digest via Twilio.
3. **The 30-day takeover rule** — in the console itself: active leads Brigham
   is working with 30+ days since contact display as Arnold's.

## What Arnold needs to go live

One new Netlify environment variable:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | A Claude API key from https://platform.claude.com → API keys |
| `ARNOLD_MODEL` (optional) | Defaults to `claude-opus-4-8` |

Everything else Arnold uses is already part of the sales stack:
`BLP_APP_ACCESS_KEY`, `SALES_LEADS_APPS_SCRIPT_URL`, `SALES_LEADS_SYNC_SECRET`,
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM_NUMBER`, and
`BRIGHAM_LEAD_ALERT_PHONE` (the digest recipient).

The repo now has a `package.json` with `@anthropic-ai/sdk` — Netlify installs
it automatically at deploy.

## Testing after deploy

Draft (replace the key):

```bash
curl -s https://<site>/.netlify/functions/arnold-draft \
  -H "x-blp-key: $BLP_APP_ACCESS_KEY" -H "content-type: application/json" \
  -d '{"channel":"text","engagement_state":"stale_convo","lead":{"name":"Test Person","phone":"+18015551234","instrument":"Used Upright","days_since_contact":12,"temp":8}}'
```

Digest without sending the SMS (dry run):

```bash
curl -s "https://<site>/.netlify/functions/arnold-morning-digest?dry_run=1" \
  -H "x-blp-key: $BLP_APP_ACCESS_KEY"
```

The scheduled run fires automatically once deployed; check
Netlify → Functions → arnold-morning-digest for logs.

## Guardrails baked in

- Drafts are **never auto-sent** — they land in the console's existing
  review → edit → "Approve & send" flow.
- Arnold refuses to draft for a channel the lead isn't reachable on (no
  email → no email draft), mirroring the console's rule.
- Voice contract lives in the function's system prompt: "Hi [Name]," opener,
  deposit-queue reframe, "Thanks,\nBrigham" signoff, never "hope this email
  finds you well" / "investment" / manufactured urgency, never customer-facing
  CRM language.
- Costs stay bounded: drafts are generated only on explicit user action
  (open/regenerate), one digest per day, ~1–2¢ per draft at Opus pricing.

## Gmail review before drafting

Arnold checks the mailbox for the 3 most recent emails exchanged with the
lead (last 120 days) before drafting, so a customer reply that never made it
onto the sheet can't be contradicted. His rules treat the mailbox as
outranking the sheet.

This needs the Google refresh token to include read access (the original
token was send-only). One-time upgrade:

1. Run `GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/gmail-oauth-local-authorize.js`
2. Sign in as **the account that receives customer email (brighamlarson@gmail.com)**
   and approve both permissions (send + read).
3. Replace `GOOGLE_REFRESH_TOKEN` in Netlify with the new value it prints, redeploy.

Until then Arnold notes "Gmail check: unavailable" in his context and drafts
cautiously from sheet data alone — nothing breaks.

## SalesCaptain review — blocked on account info

Not built yet: the repo has no SalesCaptain API credentials or docs. If the
BLP SalesCaptain account exposes an API key or webhooks (check its Settings →
Integrations/API page), the same pattern as the Gmail check can pull the
lead's SalesCaptain conversation by phone number before drafting. If it only
sends notification emails to the mailbox, the Gmail review above already
catches those indirectly.

## Later (opt-in, not built)

Auto-send for low-risk first follow-ups via the existing send functions, once
Karmel trusts Arnold's drafts. Everything is in place to add it.
