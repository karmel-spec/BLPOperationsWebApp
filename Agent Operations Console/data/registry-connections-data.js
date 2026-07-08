// BLP Agent Registry — connection layer
// Source of truth: "BLP OpenClaw Agent Connection Details" Google Sheet
// https://docs.google.com/spreadsheets/d/1uB5vYpNwld1HbuGuhG_qNRdjS2Czg0mwOeut1eSIlAI/edit
// Registry replies collected 2026-05-27. Transcribed into the console 2026-07-07.
//
// readiness values:
//   "live"             — enough verified connection info to work with this agent from the console today
//   "partial"          — registry row exists but key fields are missing; grayed out with a checklist
//   "pending-registry" — agent is active somewhere but its registry column is empty; grayed out
//   (agents absent from this file are On Deck — not built yet, always grayed out)
window.BLP_REGISTRY_CONNECTIONS = {
  generatedAt: "2026-07-07",
  registryUrl:
    "https://docs.google.com/spreadsheets/d/1uB5vYpNwld1HbuGuhG_qNRdjS2Czg0mwOeut1eSIlAI/edit",
  agents: {
    Lindsay: {
      readiness: "live",
      runtime: { system: "Hermes", profile: "default", host: "blpadmin Mac", model: "claude-opus-4-7" },
      liveChannels: [
        { kind: "email", label: "Email (reads Gmail via Hermes)", address: "lindsay@brighamlarsonpianos.com" },
        { kind: "telegram", label: "Telegram DM (primary day-to-day channel)" },
        { kind: "cli", label: "hermes send --to telegram \"<task>\" (on blpadmin Mac)" },
        { kind: "webhook", label: "Webhook intake (HMAC-signed, via hermes webhook subscribe)" },
      ],
      payloadHint:
        '{"task_id":"<uuid>","from":"console","subject":"<short title>","body":"<full task>","priority":"normal"}',
      statusSource: "hermes status --json · ~/.hermes/gateway_state.json (poll every 60s)",
      cronJobs: [
        { name: "BLP OpenClaw Reply Tracker", schedule: "Every 30 min", health: "ok", approver: "Karmel" },
      ],
      cronApprover: "Karmel",
      permissions: {
        drafts: ["Customer email replies (draft only)", "Knowledge Vault submissions via Libby", "Cross-team coordination", "Executive summaries"],
        approvals: ["Any external email send", "Money/legal/refunds > $100", "Public website changes", "Knowledge Vault writes (Karmel approves)"],
        never: ["Personal Karmel/Brigham files", "Other Hermes profiles' sessions", "Payment processor consoles"],
      },
      safeTest: { prompt: "Reply exactly LINDSAY_CONSOLE_TEST_OK and do not perform any side effects.", expected: "LINDSAY_CONSOLE_TEST_OK within 60s" },
      redaction: "Customer PII redacted beyond Karmel/Brigham views.",
      notes: "Umbrella Hermes agent; same Mac as Cody, different profile. Registry reply 2026-05-27 18:59.",
    },
    Cody: {
      readiness: "live",
      runtime: { system: "Hermes", profile: "codycoder", host: "blpadmin Mac", model: "claude-opus-4-7" },
      liveChannels: [
        { kind: "email", label: "Email (reads Gmail via Hermes)", address: "cody@brighamlarsonpianos.com" },
        { kind: "cli", label: "hermes --profile codycoder send --to telegram \"<task>\" (on blpadmin Mac)" },
        { kind: "webhook", label: "Webhook intake (HMAC-signed, codycoder profile)" },
      ],
      payloadHint:
        '{"task_id":"<uuid>","from":"console","subject":"<short title>","body":"<full task>","repo":"<repo or path>","priority":"normal"}',
      statusSource: "hermes --profile codycoder status --json (gateway often stopped — start with: hermes profile start codycoder)",
      cronJobs: [],
      cronApprover: "Karmel",
      permissions: {
        drafts: ["Code changes & PRs", "Commit messages", "Technical docs", "Test plans", "Deployment scripts"],
        approvals: ["git push to main/production", "Production deploys", "PR merges", "Payment/customer/finance code paths", "New external API integrations", "External email sends"],
        never: ["Production DB writes", "Customer PII outside sandbox", "Brigham's personal files", "Finance/QBO credentials"],
      },
      safeTest: { prompt: "Console integration test — reply exactly: CODY_CONSOLE_TEST_OK. Do not modify any files or push any commits.", expected: "CODY_CONSOLE_TEST_OK" },
      redaction: "Strip tokens, secrets, customer PII from console display.",
      notes: "Hermes agent, not OpenClaw. Gateway often stopped. Registry reply 2026-05-27 18:55 (via Lindsay).",
    },
    Ivory: {
      readiness: "live",
      runtime: { system: "OpenClaw", agentId: "ivory", host: "ivorylarson Mac" },
      liveChannels: [
        { kind: "email", label: "Email (primary intake)", address: "ivory@brighamlarsonpianos.com" },
        { kind: "internal", label: "OpenClaw sessions_send (internal, agent-to-agent)" },
      ],
      payloadHint: 'Email body: "Ivory, please [clear instruction with expected output]"',
      statusSource: "STATUS.md in Ivory's OpenClaw workspace (healthy / degraded / blocked) — daily poll",
      cronJobs: [
        { name: "Google Review requests", schedule: "Mon–Sat 6:01 PM", health: "ok", approver: "Karmel" },
        { name: "Tuning confirmations (14-day lookahead)", schedule: "Mon–Fri 8:00 AM", health: "ok", approver: "Karmel" },
        { name: "QBO Invoice Audit", schedule: "Mon–Fri 4:00 AM", health: "ok", approver: "Karmel" },
        { name: "Morning Brief inputs (feeds Walter)", schedule: "Mon–Fri 7:00 AM", health: "ok", approver: "Lindsay" },
        { name: "Daily Cron Report → Lindsay", schedule: "Mon–Fri 7:30 AM", health: "ok", approver: "Lindsay" },
        { name: "Drive Backup", schedule: "Daily 11:00 PM", health: "ok", approver: "Lindsay" },
        { name: "Nightly Backup (Lindsay protocol)", schedule: "Daily 3:05 AM", health: "failing", note: "9 consecutive timeouts — under investigation", approver: "Lindsay" },
        { name: "Syd Rescheduling", schedule: "Mon & Thu 8:00 AM", health: "ok", approver: "Walter" },
        { name: "Weekly CRM Calendar Sync", schedule: "Mon 8:00 AM", health: "ok", approver: "Lindsay" },
      ],
      cronApprover: "Karmel (customer-facing) / Lindsay (infra) / Walter (scheduling)",
      permissions: {
        drafts: ["Gmail drafts in info@ (Karmel sends)", "Internal drafts in ivory@", "Campaign-log entries", "STATUS.md updates"],
        approvals: ["Any customer-facing send", "Tuner calendar changes", "CRM deletions", "Cron schedule changes", "Template/brand-voice changes", "ANY finance action"],
        never: ["karmel@ personal email", "brigham@ business email", "QBO/Relay/banking", "HR/payroll", "Customer payment info"],
      },
      safeTest: { prompt: "Ivory, please report your current STATUS.md contents and the result of your last Google Review request run.", expected: "STATUS.md contents + last run summary (read-only)" },
      redaction: "Customer PII redacted before console display.",
      notes: "Tuning revenue loop. Registry reply 2026-05-27 17:35.",
    },
    Melody: {
      readiness: "live",
      runtime: { system: "OpenClaw", agentId: "melody", host: "ivorylarson Mac" },
      liveChannels: [
        { kind: "email", label: "Email", address: "melody@brighamlarsonpianos.com" },
        { kind: "internal", label: "OpenClaw session agent:melody:main (cron or direct prompt)" },
      ],
      payloadHint: '{"type":"session_message","target":"agent:melody:main","prompt":"<task>","source":"direct"}',
      statusSource: "agents/melody/STATUS.md (idle / running / error) + daily cron report heartbeat",
      cronJobs: [
        { name: "Email Responder (info@ drafts)", schedule: "Every ~2 hours", health: "ok", approver: "Karmel" },
        { name: "Daily SalesCaptain Report → walter@", schedule: "Daily", health: "ok", approver: "Walter" },
        { name: "Nightly Backup (BLP standard)", schedule: "Daily 3:00 AM MT", health: "ok", approver: "Lindsay" },
        { name: "Nightly KB Digest → libby@", schedule: "Nightly", health: "ok", approver: "Libby" },
        { name: "Daily Cron Report → Lindsay", schedule: "Mornings", health: "ok", approver: "Lindsay" },
      ],
      cronApprover: "Karmel",
      permissions: {
        drafts: ["Customer email replies (drafts only — Karmel sends)"],
        approvals: ["External email sends", "CRM modifications", "Calendar changes", "Customer record access", "Finance data", "Public-facing changes"],
        never: ["Finance/accounting systems", "Public website", "Customer payment data"],
      },
      safeTest: { prompt: "Reply exactly MELODY_CONSOLE_TEST_OK. Do not send external messages or modify CRM.", expected: "MELODY_CONSOLE_TEST_OK" },
      redaction: "Customer PII redacted before console display.",
      notes: "Front desk. No Discord bot token yet — needs Lindsay to provide bot slot. Registry reply 2026-05-27 19:22.",
    },
    Chris: {
      readiness: "live",
      runtime: { system: "OpenClaw", agentId: "chris", host: "ivorylarson Mac", model: "gpt-5.5 (OpenAI Codex)" },
      liveChannels: [
        { kind: "email", label: "Email (drafts + shop/admin)", address: "chris@brighamlarsonpianos.com" },
        { kind: "cli", label: "openclaw agent --agent chris --session-key agent:chris:console-<task_id> --message \"<task>\" (on ivorylarson Mac)" },
      ],
      payloadHint:
        '{"agent":"chris","session_key":"agent:chris:console-<task_id>","message":"<task>","timeout":600}',
      statusSource: "openclaw status --json · Chris STATUS.md (idle / working / awaiting_approval / blocked / completed / failed)",
      cronJobs: [
        { name: "Nightly Knowledge Vault Backup", schedule: "3:04 AM Denver", health: "ok", approver: "Lindsay/Karmel" },
        { name: "Daily Cron Report → Lindsay", schedule: "7:50 AM Mon–Fri", health: "ok", approver: "Lindsay" },
        { name: "Monthly Restoration Audio Request", schedule: "9:00 AM on 15th–31st", health: "ok", approver: "Karmel/Brigham" },
        { name: "Friday Report Gate", schedule: "4:30 PM Fri (LA)", health: "failing", note: "OutboundDeliveryError: ECONNREFUSED 127.0.0.1:1234 — port mystery resolved, gateway is 18789; job needs repointing", approver: "Karmel/Brigham" },
      ],
      cronApprover: "Karmel / Brigham",
      permissions: {
        drafts: ["Shop/admin emails", "Customer email drafts", "Reports", "Knowledge Vault submissions", "Status summaries"],
        approvals: ["Customer-facing sends", "Calendar changes", "Piano Log / live shop record updates", "CRM/shop/customer deletions", "Destructive file ops", "Finance / legal / HR", "Public website & social"],
        never: ["Secrets/tokens outside verified tool paths", "Unrelated personal data", "Anything outside Chris/shop scope"],
      },
      safeTest: { prompt: "Safe integration test from console connector. Reply exactly: CHRIS_CONSOLE_TEST_OK. Do not send external messages or modify files.", expected: "CHRIS_CONSOLE_TEST_OK (verified live 2026-05-27)" },
      redaction: "Redact customer PII, tokens, API keys, inbox contents, financial data.",
      notes: "Connection test verified live. Per-task session keys prevent history collision. Registry reply 2026-05-27 17:37.",
    },
    Libby: {
      readiness: "live",
      runtime: { system: "OpenClaw", agentId: "libby", host: "ivorylarson Mac" },
      liveChannels: [
        { kind: "email", label: "Email (primary intake)", address: "libby@brighamlarsonpianos.com" },
        { kind: "internal", label: "OpenClaw sessions_send (agent-to-agent)" },
      ],
      payloadHint:
        "KB proposal template — TO:Libby / TYPE:kb-proposal / DOMAIN:<pricing|brand|products|team|procedures|locations|vendors|metrics|legal> / CHANGE:<...> / RATIONALE:<...> / SOURCE:<...>",
      statusSource: "openclaw cron list --agent-id libby (idle / running / error — best-effort)",
      cronJobs: [
        { name: "Daily KB Status Report → Walter/Dawn brief", schedule: "Weekdays 5:30 AM MDT", health: "failing", note: "Last run errored (timeout)", approver: "Karmel" },
        { name: "Nightly KB Drive Sync", schedule: "Weekdays 1:00 AM MDT", health: "failing", note: "OpenAI quota error", approver: "Karmel" },
        { name: "Nightly Agent File Backup", schedule: "Daily 3:00 AM MDT", health: "failing", note: "Quota error", approver: "Lindsay" },
        { name: "Daily cron health email → Lindsay", schedule: "7:00 AM MDT", health: "failing", note: "Timeout", approver: "Lindsay" },
        { name: "Evening Obsidian status report", schedule: "6:00 PM MDT", health: "failing", note: "Telegram routing missing", approver: "Karmel" },
      ],
      cronApprover: "Karmel",
      permissions: {
        drafts: ["KB entries formatted for Karmel approval"],
        approvals: ["ANY Knowledge Vault write — Libby is the gatekeeper, Karmel is the sole approver"],
        never: ["Customer financial data", "Raw HR records"],
      },
      safeTest: { prompt: "Reply exactly LIBBY_CONSOLE_TEST_OK. Do not modify the KB.", expected: "LIBBY_CONSOLE_TEST_OK" },
      redaction: "Generally none — KB is operational data; customer records never enter Libby's pipeline.",
      notes: "⚠ All 5 cron jobs currently failing (timeouts + OpenAI quota) — flagged for Walter/infrastructure review. Registry reply 2026-05-27 18:05.",
    },
    Walter: {
      readiness: "partial",
      runtime: { system: "OpenClaw", agentId: "main", host: "ivorylarson Mac", sessionKey: "agent:main:main" },
      liveChannels: [],
      statusSource: "~/.openclaw/cron/jobs.json + session logs (local gateway 127.0.0.1:18789, token-auth)",
      cronJobs: [],
      cronApprover: "Karmel",
      permissions: {
        drafts: ["Internal replies (draft)"],
        approvals: ["External sends", "Public changes", "Finance", "Legal/HR", "Vault writes"],
        never: [],
      },
      missing: [
        "REST wrapper for task intake + status (Walter agreed to own the plan — not built yet)",
        "Example request payload and example status response",
        "Safe test task + expected response",
        "Cron job enumeration (owns recurring jobs but list not provided)",
        "Log retention policy confirmation",
      ],
      notes: "Chief of Staff on OpenClaw 'main'. Gateway is local-only (127.0.0.1:18789). Follow-up recommended after the REST wrapper is scoped. Registry reply 2026-05-27 21:07.",
    },
    Dawn: {
      readiness: "partial",
      runtime: { system: "OpenClaw", agentId: "(scaffolded)", host: "ivorylarson Mac" },
      liveChannels: [],
      statusSource: "Not available yet — currently relayed through Walter",
      cronJobs: [],
      cronApprover: "Karmel",
      permissions: {
        drafts: ["Draft-only; no customer-facing sends until wired"],
        approvals: ["All external sends", "Public changes", "Finance", "Legal/HR", "Vault writes"],
        never: [],
      },
      missing: [
        "Provision dawn@brighamlarsonpianos.com mailbox (currently bounces 550 5.1.1)",
        "Complete OpenClaw agent setup (currently scaffolded)",
        "Wire Gmail OAuth",
        "Start planned crons: 6 AM Karmel brief, 6 AM Brigham brief, 7:30 AM standup prep",
      ],
      notes: "Morning Brief / Email Assistance agent — scaffolded but not online. Walter relays her status. Registry reply 2026-05-27 18:42 (via Walter).",
    },
    Marcus: {
      readiness: "pending-registry",
      runtime: { system: "OpenClaw", host: "unknown" },
      liveChannels: [],
      cronJobs: [],
      missing: [
        "Entire registry column is empty — no intake method, endpoint, status source, cron list, permissions, or safe test",
        "Nightly backup Drive folder not shared with lindsay@",
        "Reply to the connection-details email survey",
      ],
      notes: "Marked Active in the roster, but the registry has no connection details yet.",
    },
    Monte: {
      readiness: "pending-registry",
      runtime: { system: "OpenClaw", host: "unknown" },
      liveChannels: [],
      cronJobs: [],
      missing: [
        "Entire registry column is empty — no intake method, endpoint, status source, cron list, permissions, or safe test",
        "Nightly backup Drive folder not shared with lindsay@",
        "Reply to the connection-details email survey",
      ],
      notes: "CFO agent. Finance-adjacent — will need the guarded connector path once registry details arrive.",
    },
    Sally: {
      readiness: "pending-registry",
      runtime: { system: "OpenClaw", host: "unknown" },
      liveChannels: [],
      cronJobs: [],
      missing: [
        "Entire registry column is empty — no intake method, endpoint, status source, cron list, permissions, or safe test",
        "Reply to the connection-details email survey",
      ],
      notes: "Has a 'Sally Agent Backup' Drive folder, but no connection details in the registry. (Note: Arnold replaced Sally in sales ops on 2026-07-07 per BLPOperationsWebApp — confirm whether Sally's console card should be retired.)",
    },
  },
};
