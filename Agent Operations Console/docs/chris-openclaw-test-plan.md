# Chris OpenClaw Connection Test Plan

## Goal

Confirm that the BLP Agent Operations Console can send a safe, read-only task to Chris through OpenClaw and record the attempt in the local audit trail.

## Current Blocker

The `openclaw` command is not currently available on this Mac's command path from the console project. Before the live test, confirm the actual OpenClaw CLI binary path or install/link the CLI so this works:

```bash
openclaw --help
```

## Safe Manual Test

Once `openclaw` is available, run:

```bash
openclaw agent --agent chris --session-key agent:chris:console-test --message "Safe integration test from console connector. Reply exactly: CHRIS_CONSOLE_TEST_OK. Do not send external messages or modify files." --json --timeout 180
```

Expected result:

```text
CHRIS_CONSOLE_TEST_OK
```

## App Bridge Test

Start the local API with OpenClaw dispatch enabled:

```bash
BLP_OPENCLAW_SEND_ENABLED=true BLP_OPENCLAW_BIN="/path/to/openclaw" node scripts/local-api.mjs
```

Then in the app:

1. Open Chris in Agent Desk.
2. Click Message Agent.
3. Enter: `Safe integration test from console connector. Reply exactly: CHRIS_CONSOLE_TEST_OK. Do not send external messages or modify files.`
4. Save the action.
5. Check `data/audit-log.jsonl` for an `openclaw_dispatch_attempt`.

## Safety Boundary

This test should not send external messages, change files, modify customer records, update calendars, or touch finance/public systems.
