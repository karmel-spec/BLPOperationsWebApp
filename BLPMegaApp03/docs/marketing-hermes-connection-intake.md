# Marketing Hermes Connection Intake

Purpose: collect the exact information needed to connect the marketing agent team on the other Hermes laptop to the BLP Team Operating System, Agent Operations Console, Marketing Command Center, Design Center, and VideoFlow.

## Recommended Connection Path

Use Hermes webhook subscriptions exposed through a secure HTTPS bridge.

Because the marketing agents are on a different laptop, a local URL such as `http://127.0.0.1:8644/...` only works from that laptop itself. The BLP web app and Netlify need a reachable endpoint. Good bridge options:

- Tailscale Funnel or Tailscale private network
- Cloudflare Tunnel
- ngrok
- A small hosted gateway that forwards signed requests to the Hermes laptop

The app should send signed JSON task payloads to the marketing Hermes gateway. Hermes should return status through a callback URL, Notion/Sheet task state, or an agent activity log.

## Minimum Data Needed From The Other Hermes Laptop

### Laptop / Gateway

- Machine name and owner
- Whether the laptop can stay awake and online during business hours
- Hermes binary path
- Hermes profile name used by the marketing team
- Hermes gateway status command output
- Webhook platform enabled: yes/no
- Local webhook host and port
- Public HTTPS bridge URL, if already created
- Preferred bridge method: Tailscale, Cloudflare Tunnel, ngrok, hosted gateway, or other
- HMAC/signature method Hermes expects
- HMAC header name, for example `X-Hermes-Signature`
- Whether CORS/origin restrictions are required
- Where Hermes should send results: callback URL, Telegram, Discord, email, Notion, Google Sheet, or agent log

### Agent Route Map

Please provide one row for every active marketing agent.

| Agent | Module | Role | Hermes profile | Webhook route/path | Email | Channels | Drive backup folder | Status source | Response destination |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Marcus | Marketing Command Center / Agent Console | Marketing lead |  |  | marcus@brighamlarsonpianos.com |  |  |  |  |
| Desie | Design Center / Agent Console | Design |  |  | desie@brighamlarsonpianos.com |  |  |  |  |
| Ed | VideoFlow / Agent Console | Video editor |  |  | ed@brighamlarsonpianos.com |  |  |  |  |
| Yolanda | VideoFlow / Marketing Command Center | YouTube |  |  | yolanda@brighamlarsonpianos.com |  |  |  |  |
| Sharie | VideoFlow / Marketing Command Center | Social media |  |  | sharie@brighamlarsonpianos.com |  |  |  |  |
| Brandy | Marketing Command Center / Agent Console | Branding |  |  | brandy@brighamlarsonpianos.com |  |  |  |  |
| Addie | Marketing Command Center / Agent Console | Advertising |  |  | addie@brighamlarsonpianos.com |  |  |  |  |
| Lee | Marketing Command Center / Agent Console | Lead gen |  |  | lee@brighamlarsonpianos.com |  |  |  |  |
| Rajeesh | Marketing Command Center / Agent Console | Website |  |  | rajeesh@brighamlarsonpianos.com |  |  |  |  |
| Collin | Marketing Command Center / Agent Console | Competitor research |  |  | collin@brighamlarsonpianos.com |  |  |  |  |

## Per-Agent Details Needed

For each agent, please collect:

- Active or on-deck status
- Exact Hermes route name
- Webhook URL or route path
- HMAC secret name, not the secret value in plain text
- Accepted task types
- Prompt template used by the webhook subscription
- Skills/toolsets enabled
- Files or folders the agent can read
- Files or folders the agent can write
- Whether the agent can send external messages or only draft them
- Human approval rules
- Cron jobs and recurring jobs
- Last-run and next-run status source
- Backup folder link
- Daily source files available, such as `agent.md`, `identity.md`, `soul.md`, `skill.md`, `safetyrules.md`, and `status.md`
- How the agent reports completion
- How the app should display blocker, current load, last action, and health

## Module-Specific Wiring

### Marketing Command Center

Needed:

- Campaign/task categories the marketing team should accept
- Which agent owns SEO, website, ads, brand, YouTube, social, lead gen, and research
- Google Analytics/Search Console access plan
- Social/YouTube/newsletter source folders or reporting docs
- Marketing task database or Notion board URL, if this becomes the live work source
- Approval rules before public posts, emails, ads, or web updates

### Design Center / Desie

Needed:

- Desie webhook route
- Design request types Desie can accept
- Design assets Drive folder
- Final files Drive folder
- Brand/logo/template folder
- Vendor/print handoff folder
- Approval owner for public-facing design
- Whether Desie drafts only or can create/update files

### VideoFlow / Ed

Needed:

- Ed webhook route
- Raw upload Drive folder
- Editor queue destination
- YouTube channel/OAuth setup owner
- Social package folder
- Publishing approval owner
- Whether Ed can edit files, draft metadata, schedule, publish, or only prepare packages
- VideoFlow source app environment needs: Supabase URL/key, Google OAuth client, raw upload folder ID, YouTube callback URL

## Netlify / App Environment Variables

When the endpoints are ready, the app should store secrets in environment variables, not in browser code.

Suggested variables:

```text
HERMES_MARKETING_BASE_URL=
HERMES_MARKETING_CALLBACK_SECRET=
HERMES_AGENT_MARCUS_SECRET=
HERMES_AGENT_DESIE_SECRET=
HERMES_AGENT_ED_SECRET=
HERMES_AGENT_YOLANDA_SECRET=
HERMES_AGENT_SHARIE_SECRET=
HERMES_AGENT_BRANDY_SECRET=
HERMES_AGENT_ADDIE_SECRET=
HERMES_AGENT_LEE_SECRET=
HERMES_AGENT_RAJEESH_SECRET=
HERMES_AGENT_COLLIN_SECRET=
```

## Test Plan

Each agent is considered connected only after all tests pass:

1. Health check from the app to the Hermes bridge succeeds.
2. Signed sample task reaches the correct agent.
3. Agent confirms receipt in the expected channel or callback.
4. Agent status appears in Agent Console.
5. A task routed from the related module appears in the module queue.
6. Completion or blocked status returns to the app.
7. The action is recorded in the Agent Log.

## First Build Recommendation

Start with three live routes:

- `Marcus` to Marketing Command Center and Agent Console
- `Desie` to Design Center and Agent Console
- `Ed` to VideoFlow and Agent Console

After those three are proven, add the rest of the marketing agents in batches.
