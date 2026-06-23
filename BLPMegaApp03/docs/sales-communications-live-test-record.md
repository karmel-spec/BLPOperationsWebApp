# Sales Communications Live Test Record

Use this record after production environment variables are installed and the deployed Sales Console is ready for live verification.

Do not paste Twilio auth tokens, Google OAuth secrets, app passcodes, customer PII, or full message contents into this file.

## Deployment

- Date tested:
- Tester:
- Production URL:
- Git commit / deploy ID:

## Configuration Check

Command:

```bash
SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=your-passcode node scripts/check-live-sales-communications.js
```

Expected result:

```text
Live sales communications status is configured.
SMS/call from: +18017010113
Email from: brigham@brighamlarsonpianos.com
Email BCC: info@brighamlarsonpianos.com
No SMS, call, or email was sent by this check.
```

- Result:
- Notes:

## Controlled Live Provider Test

Command:

```bash
SALES_APP_URL=https://your-site.netlify.app BLP_APP_ACCESS_KEY=your-passcode TEST_SALES_PHONE=+18015551212 TEST_SALES_EMAIL=test@example.com LIVE_SALES_TEST_CONFIRM="send live blp sales communication tests" node scripts/run-live-sales-communications-test.js
```

- Test phone owner:
- Test email owner:
- SMS provider SID recorded by script:
- Call provider SID recorded by script:
- Email accepted by provider:

## Receipt Checks

- SMS arrived:
- SMS sender displayed as `801-701-0113`:
- Bridge phone rang first:
- Test phone/customer leg connected:
- Caller ID displayed as `801-701-0113`:
- Email arrived at test inbox:
- Email sender displayed as `brigham@brighamlarsonpianos.com`:
- BCC arrived at `info@brighamlarsonpianos.com`:

## Sales Console UI Checks

Use a safe internal test lead in the Sales Console.

- Text icon/button triggers SMS workflow:
- Phone icon/button triggers call workflow:
- Email icon/button triggers email workflow:
- Lead timeline records the text attempt:
- Lead timeline records the call attempt:
- Lead timeline records the email attempt:

## Final Decision

- Production communication goal ready to mark complete:
- Remaining issues:
