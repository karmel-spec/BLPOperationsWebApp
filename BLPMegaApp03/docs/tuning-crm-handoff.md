# Tuning CRM / Online Scheduling Handoff

Imported: 2026-06-03

## Local Folder

`/Users/blpadmin/Desktop/BLP Tuning CRM WebApp`

## Local URL

`http://127.0.0.1:8900`

## Included Files

- `api_server.py`
- `index.html`
- `crm-watchdog.sh`

## What The App Does

- Dashboard metrics for the live tuning CRM.
- Today's appointments from tuner, moving, and recital calendars.
- Searchable client table with detail editing.
- Service-due queue for overdue customers.
- Duplicate customer detection.
- Tuner workload and city/geography summaries.
- Online scheduling flow that checks availability and drafts confirmation emails.

## Live Data Dependencies

This app is designed to use the `gog` CLI and an OpenClaw CRM helper module:

- `crm_lib`
- Google Sheets access for the BLP Tuning CRM live sheet.
- Google Calendar access for tuner calendars.
- Gmail draft access for scheduling confirmations.

On this laptop, the imported copy was patched to open safely even when the live helper is missing. The health endpoint reports the connection state:

`http://127.0.0.1:8900/api/health`

Current expected blocker until configured:

- `crm_lib` path from the original Ivory/OpenClaw environment is not present on this Mac.
- `gog` CLI is not currently available in the shell path.

## Next Wiring Steps

1. Install or locate `gog` on this Mac.
2. Confirm which Google Workspace account should own the tuning CRM live connection.
3. Bring over or recreate the OpenClaw `crm_lib` helper locally.
4. Verify the live tuning CRM sheet ID and tab name.
5. Confirm calendar permissions for:
   - `mckinlylopp.blp@gmail.com`
   - `matthewwessman.blp@gmail.com`
   - `curtisbiggs.blp@gmail.com`
   - `sydlong.blp@gmail.com`
   - `pianomoving.blp@gmail.com`
   - `recitalhall.blp@gmail.com`
6. Test:
   - `/api/health`
   - `/api/dashboard`
   - `/api/appointments/today`
   - `/api/service-due`

