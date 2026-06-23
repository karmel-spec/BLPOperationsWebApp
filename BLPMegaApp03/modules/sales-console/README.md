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

Email/SMS/call actions have Netlify function hooks, but real sending requires production environment variables before messages or calls are placed.

Communication environment variables:

- `BLP_APP_ACCESS_KEY` — shared app passcode required by the Netlify functions.
- `TWILIO_ACCOUNT_SID` — Twilio account SID.
- `TWILIO_AUTH_TOKEN` — Twilio auth token.
- `TWILIO_FROM_NUMBER` — BLP Twilio number, expected to be `+18017010113`.
- `SALES_CALL_BRIDGE_NUMBER` — staff phone Twilio should call first before dialing the customer.
- `SENDGRID_API_KEY` — SendGrid key for sales email sending.
- `SALES_EMAIL_FROM` — required; must be `brigham@brighamlarsonpianos.com`.
- `SALES_EMAIL_BCC` — required; must be `info@brighamlarsonpianos.com`.

Full production setup and live verification steps are in `../../docs/sales-communications-production-setup.md`.

Continue from `mockup.html`. Do not assume Gmail, SalesCaptain, Twilio, or Google Sheets writes are already connected.

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
