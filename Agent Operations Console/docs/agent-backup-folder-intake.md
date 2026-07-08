# Agent Backup Folder Intake

Each agent's nightly Google Drive backup can feed the Agent Operations Console before live Hermes/OpenClaw APIs are fully connected.

## Spreadsheet Fields For Lindsay

Add these fields to the agent connection spreadsheet for each agent:

- `Backup folder URL`
- `Local Google Drive sync path`
- `Status file path`
- `Cron inventory path`
- `Activity folder path`
- `Files/root path`
- `Backup cadence`
- `Last backup seen`
- `Backup notes`

## Recommended Folder Shape

Use the same structure for every agent when possible:

```text
Agent - Chris/
  STATUS.md
  MEMORY.md
  cron-inventory.json
  activity/
    latest-summary.md
  reports/
  sessions/
  files/
```

## Why This Is The Best First Bridge

- Read-only by default.
- Works even when the agent runs on another Mac.
- Uses existing nightly backup crons.
- Gives the console real status, cron, activity, and file data without opening live task execution yet.
- Keeps customer-facing sends, calendar writes, finance, HR, public website changes, and vault writes behind human approval.

## Build Step

After updating `data/agent-backup-sources.json`, run:

```bash
node scripts/build-agent-backup-data.mjs
```

Then refresh the app and open Integrations.
