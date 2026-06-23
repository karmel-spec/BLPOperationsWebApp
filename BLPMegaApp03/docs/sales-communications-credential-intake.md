# Sales Communications Credential Intake

Use this checklist to gather production setup information for the BLP Sales Console communication actions.

Do not paste secrets into this file, chat, email, tickets, screenshots, or git. Enter secret values directly into Netlify environment variables or another approved secret manager.

## Site

- Production site URL:
- Netlify site/team owner:
- Person who can update Netlify environment variables:
- Person who can deploy/redeploy the site:

## Shared App Access

- `BLP_APP_ACCESS_KEY`: secret passcode used by Sales Console Netlify functions.
- Where it will be stored: Netlify environment variables.
- Who will enter it:

## Twilio

- Twilio account owner:
- `TWILIO_ACCOUNT_SID`: secret value, enter directly into Netlify.
- `TWILIO_AUTH_TOKEN`: secret value, enter directly into Netlify.
- `TWILIO_FROM_NUMBER`: must be `+18017010113`.
- Confirm `801-701-0113` supports SMS:
- Confirm `801-701-0113` supports voice:
- Confirm outbound region/country permissions are sufficient:

## Call Bridge

- `SALES_CALL_BRIDGE_NUMBER`: staff phone Twilio calls first before dialing the lead.
- Staff phone owner:
- Staff phone can receive test call:
- Staff phone is acceptable for production sales calls:

## Email

- Email provider: SendGrid.
- `SENDGRID_API_KEY`: secret value, enter directly into Netlify.
- `SALES_EMAIL_FROM`: must be `brigham@brighamlarsonpianos.com`.
- `SALES_EMAIL_BCC`: must be `info@brighamlarsonpianos.com`.
- Confirm `brigham@brighamlarsonpianos.com` is a verified sender/domain:
- Confirm BCC to `info@brighamlarsonpianos.com` is allowed:

## Safe Test Recipients

- `TEST_SALES_PHONE`: safe internal test phone for SMS.
- `TEST_SALES_CALL_PHONE`: safe internal test phone for the call customer leg, if different.
- `TEST_SALES_EMAIL`: safe internal test email inbox.
- Person watching the test phone:
- Person watching the test email:
- Person watching `info@brighamlarsonpianos.com` for BCC:

## Final Validation Order

1. Enter the required values in Netlify.
2. Redeploy the site so functions receive the latest environment.
3. Run `node scripts/check-live-sales-communications.js`.
4. Run `node scripts/run-live-sales-communications-test.js` with internal recipients and the required confirmation phrase.
5. Record proof in `docs/sales-communications-live-test-record.md`.
