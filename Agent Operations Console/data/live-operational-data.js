// Generated from live data JSON files. Run node scripts/build-live-operational-data.mjs after source updates.
window.BLP_LIVE_OPERATIONAL_DATA = {
  "generatedAt": "2026-07-08T01:30:58.803Z",
  "source": "Live JSON/backup data layer",
  "tasks": [],
  "approvalItems": [],
  "queueItems": [],
  "healthSignals": [
    {
      "name": "Lindsay",
      "status": "Watch",
      "load": "Running · hermes cronjob list --json (1 job · healthy)",
      "blocker": "Waiting for backup folder or live status feed",
      "cron": "hermes cronjob list --json (1 job · healthy)",
      "score": 68,
      "trend": "Stable",
      "lastAction": "OpenClaw connection details received",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 6:59 PM"
    },
    {
      "name": "Walter",
      "status": "Guarded",
      "load": "Needs follow-up · openclaw cron list (owns jobs; list not yet enumerated — follow-up needed)",
      "blocker": "REST wrapper agreed but not built; missing example payload, status response, retention policy, and safe test task.",
      "cron": "openclaw cron list (owns jobs; list not yet enumerated — follow-up needed)",
      "score": 40,
      "trend": "Stable",
      "lastAction": "Awaiting live data source",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 9:07 PM"
    },
    {
      "name": "Cody",
      "status": "Watch",
      "load": "Idle (gateway often stopped) · No recurring jobs yet — invoked on demand",
      "blocker": "Gateway often stopped — start with: hermes profile start codycoder.",
      "cron": "No recurring jobs yet — invoked on demand",
      "score": 68,
      "trend": "Stable",
      "lastAction": "OpenClaw connection details received",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 6:55 PM"
    },
    {
      "name": "Libby",
      "status": "Watch",
      "load": "Degraded · 5 jobs · ALL FAILING (timeouts + quota) — flagged for Walter/infra review",
      "blocker": "All 5 cron jobs failing (timeouts + OpenAI quota + Telegram routing) — flagged for Walter/infra review.",
      "cron": "5 jobs · ALL FAILING (timeouts + quota) — flagged for Walter/infra review",
      "score": 28,
      "trend": "Declining",
      "lastAction": "OpenClaw connection details received",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 6:30 PM"
    },
    {
      "name": "Chris",
      "status": "Watch",
      "load": "Verified live · 4 jobs · 1 failing (Friday Report Gate)",
      "blocker": "Friday Report Gate cron failing (ECONNREFUSED 127.0.0.1:1234 — repoint to 18789).",
      "cron": "4 jobs · 1 failing (Friday Report Gate)",
      "score": 60,
      "trend": "Declining",
      "lastAction": "OpenClaw connection details received",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 6:37 PM"
    },
    {
      "name": "Sally",
      "status": "Guarded",
      "load": "Unknown",
      "blocker": "Registry column empty. Note: Arnold replaced Sally in sales ops 2026-07-07 — confirm whether to retire this card.",
      "cron": "No live cron feed connected",
      "score": 40,
      "trend": "Stable",
      "lastAction": "Awaiting live data source",
      "lastCorrection": "No live correction logged",
      "checkIn": "Not connected"
    },
    {
      "name": "Melody",
      "status": "Watch",
      "load": "Green · 5 jobs · healthy (per 2026-05-27 registry reply)",
      "blocker": "No Discord bot token yet — needs Lindsay to provide bot slot.",
      "cron": "5 jobs · healthy (per 2026-05-27 registry reply)",
      "score": 68,
      "trend": "Stable",
      "lastAction": "OpenClaw connection details received",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 7:22 PM"
    },
    {
      "name": "Dawn",
      "status": "Guarded",
      "load": "Scaffolded — not online · Planned: 6 AM Karmel brief · 6 AM Brigham brief · 7:30 AM standup prep",
      "blocker": "dawn@ mailbox does not exist (550 bounce); Gmail OAuth not wired; agent setup incomplete. Walter relays her status.",
      "cron": "Planned: 6 AM Karmel brief · 6 AM Brigham brief · 7:30 AM standup prep",
      "score": 40,
      "trend": "Stable",
      "lastAction": "Awaiting live data source",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 6:42 PM"
    },
    {
      "name": "Ivory",
      "status": "Watch",
      "load": "Healthy · 9 jobs · 1 failing (nightly backup — 9 consecutive timeouts)",
      "blocker": "Nightly backup cron failing (9 consecutive timeouts) — under investigation.",
      "cron": "9 jobs · 1 failing (nightly backup — 9 consecutive timeouts)",
      "score": 87,
      "trend": "Declining",
      "lastAction": "Nightly backup status file detected",
      "lastCorrection": "No live correction logged",
      "checkIn": "May 27, 6:35 PM"
    },
    {
      "name": "Marcus",
      "status": "Guarded",
      "load": "Unknown",
      "blocker": "Registry column empty; backup Drive folder not shared with lindsay@.",
      "cron": "No live cron feed connected",
      "score": 40,
      "trend": "Stable",
      "lastAction": "Awaiting live data source",
      "lastCorrection": "No live correction logged",
      "checkIn": "Not connected"
    },
    {
      "name": "Monte",
      "status": "Guarded",
      "load": "Unknown",
      "blocker": "Registry column empty; backup Drive folder not shared with lindsay@.",
      "cron": "No live cron feed connected",
      "score": 40,
      "trend": "Stable",
      "lastAction": "Awaiting live data source",
      "lastCorrection": "No live correction logged",
      "checkIn": "Not connected"
    }
  ],
  "logEvents": []
};
