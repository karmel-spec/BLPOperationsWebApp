Subject: OpenClaw connection details needed for BLP Agent Operations Console

Hi [Agent Name],

We are wiring the BLP Agent Operations Console into the live OpenClaw agent team so humans can see your current work, health, cron jobs, recent activity, and eventually assign tasks through the dashboard.

Please reply with the connection details below for your OpenClaw setup. If a field does not exist yet, write “not available yet” and tell us the closest available alternative.

Agent identity:
- Agent name:
- OpenClaw agent ID or unique identifier:
- Role/title:
- Department:
- Agent email:

Task intake:
- How should the console send you a new task? REST endpoint, CLI command, webhook, file drop, database row, email, Discord, or other?
- Exact endpoint URL or command:
- Required request format/example payload:
- Required headers or authentication method:
- Example successful task creation response:

Status and current work:
- How can the console fetch your current status? REST endpoint, CLI command, JSON file, log file, webhook, or other?
- Exact endpoint, command, or file path:
- Available status values, for example queued/running/awaiting_approval/completed/failed:
- Example status response:
- How often should the console poll, or should you push updates by webhook?

Cron jobs / automations:
- Do you own any recurring jobs, scheduled reports, reminders, or automations?
- Where can the console read your cron/job list?
- For each job, please include name, schedule, input/source, output destination, last run, next run, failure behavior, and human approver.
- Example cron/job output:

Recent activity / logs:
- Where can the console read recent activity or session logs?
- Exact endpoint, command, or file path:
- How long are logs retained?
- Should customer/private info be redacted before the console displays it?

Permissions and safety:
- What are you allowed to read?
- What are you allowed to draft?
- What must always require human approval?
- Any folders, inboxes, files, or data you must never access?

Testing:
- Please provide one safe test task we can send you from the console.
- Please provide the expected response/status so we can verify the integration.

Preferred response format if possible:

```json
{
  "name": "",
  "openclaw_id": "",
  "task_endpoint": "",
  "status_endpoint": "",
  "cron_source": "",
  "activity_source": "",
  "auth_method": "",
  "example_task_payload": {},
  "example_status_response": {},
  "permission_notes": ""
}
```

Thank you. We are starting read-only/status-first and draft-only. No customer-facing sends, public website changes, finance actions, legal/HR actions, or vault writes will happen without human approval.

Karmel / BLP Agent Console Team
