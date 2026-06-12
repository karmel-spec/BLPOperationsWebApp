# BLP Sales Console Prototype Handoff

## Files In This Package

- `mockup.html` — the current static sales console prototype.
- `sales-console-training-guide.md` — quick reference for the sales team and future Codex agents.
- `BLP_Sales_Console_Handoff_README.md` — this handoff note.

## Google Sheet Source

Leads Log:

https://docs.google.com/spreadsheets/d/1sdOeaChihEjAQBCi8U0_lTTlYP4H38eiC6zgmRLoWC0/edit

Primary tab:

`Shop/Sales LEADS-30 Days`

## How To Preview

Put `mockup.html` in a folder, open Terminal in that folder, then run:

```bash
python3 -m http.server 8765
```

Open:

```text
http://127.0.0.1:8765/mockup.html
```

## Notes For The Next Codex Agent

This is a static HTML prototype, not a production app yet.

The lead data is currently embedded in `mockup.html`.

Internet is needed for Tailwind styling to load.

SMS sending is not live yet (Twilio hook only).

**Email sending from info@brighamlarsonpianos.com IS now wired** through the Gmail
API — see "Connecting Live Email Sending" below. It stays dormant and degrades
gracefully until the Gmail env vars are set in Netlify.

Continue from `index.html`. Do not assume SalesCaptain, Twilio, or Google Sheets
writes are already connected.

## Connecting Live Email Sending

When a rep clicks **Approve & Send** on an email draft, the app POSTs the approved
draft to the Netlify function `netlify/functions/send-sales-email.js`, which sends it
from `info@brighamlarsonpianos.com` via the Gmail API. The email goes out for real
*before* anything is logged — if the send fails, the lead is never marked as
contacted and the rep sees an error toast.

Until the Gmail keys are set, the function returns HTTP 501 and the app shows
"Email backend not connected yet — ask admin to set the Gmail keys." Nothing breaks.

### Required Netlify environment variables

| Variable | Purpose |
|---|---|
| `BLP_APP_ACCESS_KEY` | Team passcode (already required by the other functions). |
| `GMAIL_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud → APIs & Services → Credentials. |
| `GMAIL_CLIENT_SECRET` | OAuth 2.0 client secret for that client. |
| `GMAIL_REFRESH_TOKEN` | Refresh token for the **info@** mailbox, scope `https://www.googleapis.com/auth/gmail.send`. |
| `GMAIL_SENDER` *(optional)* | From address. Defaults to `info@brighamlarsonpianos.com`. |
| `GMAIL_SENDER_NAME` *(optional)* | Display name. Defaults to `Brigham Larson Pianos`. |

### One-time Gmail OAuth setup

1. In **Google Cloud Console**, create (or reuse) a project and enable the **Gmail API**.
2. Configure the OAuth consent screen and create an **OAuth client ID** of type
   *Web application* (or *Desktop app*). Note the client ID and secret.
3. While signed in as **info@brighamlarsonpianos.com**, grant consent for the
   `gmail.send` scope and capture a **refresh token** (e.g. via the
   [OAuth Playground](https://developers.google.com/oauthplayground/) — set your own
   client ID/secret in its settings, authorize `https://www.googleapis.com/auth/gmail.send`,
   then exchange the auth code for tokens).
4. Put the client ID, client secret, and refresh token into the three Netlify env
   vars above, then redeploy.

The function builds a `multipart/alternative` message: a plain-text part plus an HTML
part where the draft's `[label](url)` links (videos, "schedule me here") become real
clickable links. Header fields are stripped of CR/LF to prevent header injection.

## Recent Edit Batch

- Contact-aware draft recommendations: no email draft without email; no text draft without phone/cell.
- Cleaner email links for videos and Calendly.
- Piano make capitalization in subject lines and draft bodies.
- Removed customer-facing “sales lead” wording.
- Sticky lead table header.
- Wrapped headline text.
- Clickable funnel work queues.
- Brigham queue assignment dropdown for Sally/Admin/Karmel.
- Undo-last-assignment behavior.
- Editable lead drawer fields.
- In-app Guide tab.
