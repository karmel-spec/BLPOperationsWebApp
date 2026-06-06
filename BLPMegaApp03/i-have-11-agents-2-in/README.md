# BLP Agent Console Prototype

Static prototype for the Brigham Larson Pianos agent operations console.

## Local Preview

```sh
python3 -m http.server 4173
```

Open:

```txt
http://localhost:4173/index.html
```

## Local Live Data API

For the first live beta layer, run the local API in a second terminal:

```sh
node scripts/local-api.mjs
```

It writes console actions to:

```txt
data/work-queue.json
data/audit-log.jsonl
```

The app still works as a static prototype if this API is not running, but Message / Assign / Request actions only become persistent when the local API is running at:

```txt
http://127.0.0.1:8787
```

### Lindsay / Hermes MVP Bridge

The local API can also send Lindsay a simple fire-and-forget Hermes message through Telegram when explicitly enabled:

```sh
BLP_HERMES_SEND_ENABLED=true node scripts/local-api.mjs
```

Default Hermes path:

```txt
/Users/blpadmin/.hermes/hermes-agent/venv/bin/hermes
```

This uses:

```sh
hermes send --to telegram "<message>"
```

The bridge is intentionally disabled unless `BLP_HERMES_SEND_ENABLED=true` is set. Phase 2 should upgrade this to the Hermes webhook subscription system for structured callbacks.

## Agent Roster Data

The roster source of truth is:

```txt
data/agents.json
```

After editing that file, regenerate the browser-loadable roster:

```sh
node scripts/build-agent-data.mjs
```

This updates:

```txt
data/agents-data.js
```

## Demo Flow

1. Use **Command** to type a request and click **Route**.
2. Click a recommended agent to open the quick drawer.
3. Open **Agent Desk** for the full agent dashboard.
4. Use **Training** to show the on-deck activation pipeline.
5. Use **Feedback** to capture Brigham's review notes during the demo.

## Fast Deployment Options

### Netlify

1. Create a new Netlify site.
2. Drag this folder into Netlify Drop, or connect a Git repo.
3. Build command: none.
4. Publish directory: `.`

### Vercel

1. Import the folder/repo as a new project.
2. Framework preset: Other.
3. Build command: none.
4. Output directory: `.`

### GitHub Pages

1. Push these files to a GitHub repo.
2. Enable Pages from the repo settings.
3. Publish from the root folder.

## Future Live App Direction

The production app should move to a real application stack with authentication, a database, an API layer for Hermes/OpenClaw, audit logs, agent permissions, cron job history, and review gates for customer-facing work.



## Live Integration Plan

The new **Integrations** screen shows the recommended bridge from prototype to private beta:

1. Start with read-only connectors: Google Drive, email summaries, agent registry, and cron inventory.
2. Move to draft-only workflows: customer replies, website copy, data summaries, and task creation.
3. Add controlled actions only after permissions, audit logs, and human approval gates are in place.

Recommended first live connector: **agent email**, because it gives the human team visible agent communication without granting broad system permissions.


The Integrations screen now includes:

- Setup checklists for each connector.
- A connector permission matrix.
- A recommended first connector: Agent Email in read-only/draft-only mode.
- A guarded path for high-risk systems such as Shopify and finance-adjacent workflows.


## Knowledge Vault

The Training Vault button now opens a Knowledge Vault workup. The recommended production architecture is:

1. Humans edit the BLP Knowledge Vault in Obsidian.
2. The vault is synced to Google Drive.
3. The console indexes the Google Drive synced folder read-only.
4. Libby reviews changed notes before they become agent training material.
5. Agent dashboards show source-backed knowledge, training examples, and review status.


Knowledge Vault Google Drive folder:

https://drive.google.com/drive/folders/1Ni-gYNo0X5TwhEjqBOzNunGCP3-y3-O5?usp=sharing


## Agent Health

The console includes an Agent Health screen for private-beta operations. It tracks active agent readiness, workload, blockers, automation status, and health score. The intent is to make agent capacity visible before assigning more work or enabling live actions.


## Approval Workbench

Approvals now behave like a review desk. Each approval packet includes risk level, source, owner, before/after context, approval rule, and actions for approve, revise, train, or inspect the audit log.


## Work Queue

The Shop Work Queue button opens a shared operations board. It shows agent work across Intake, In Progress, Needs Approval, Blocked, and Done. The request router can add demo tasks into the board, so the prototype now shows the lifecycle from request to routed work.


## Visual Org Page

The Org page now uses avatar-based cards grouped by department. Each card shows the agent photo, name, title, active/on-deck status, and system, and can open the agent quick drawer.


Agent Health now includes trends, last action, last correction, check-in freshness, and stronger health alerts so the page behaves more like an operational monitor.


## Org Operating Map

The Org page has been upgraded into an operating map with leadership routing, view tabs, department intelligence, lead/supporting agent hierarchy, active/on-deck counts, connector recommendations, and a launch-plan view.


## Simple Org Page

The Org page has been simplified into an executive overview: leadership at the top, department bands below, and compact avatar rows with only name, title, status, and system.


## Morning Handoff

See `MORNING_HANDOFF.md` for the current list of items needed from the BLP team to finish the private beta and connect live systems.


## Data File Refactor

Prototype data now lives in `app-data.js`. Edit that file to update agents, active/on-deck status, org metadata, work queue cards, health signals, approval packets, log entries, integrations, launch phases, and Knowledge Vault settings. `app.js` now focuses on rendering and interaction behavior.


## Real Data Layer

Real source metadata is generated into `real-data.js` from `data/source-config.json`.

To refresh:

```sh
node scripts/build-real-data.mjs
```

Current supported read-only sources:

- Avatar folder inventory
- Google Drive Knowledge Vault URL and optional local sync path
- Obsidian vault name/path placeholder
- Org chart PDF file inventory

When the exact local Knowledge Vault path is known, add it to `data/source-config.json` under `googleDriveKnowledgeVault.localPath`, then rerun the build script.
