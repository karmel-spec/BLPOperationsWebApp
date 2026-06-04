# BLP Operating System

Brigham Larson Pianos internal operating-system prototype.

This repository packages the current BLP mega-app modules so Codex, Hermes, and the agent team can collaborate from one shared GitHub project.

## Current Modules

| Module | Folder | Local preview |
|---|---|---|
| BLP Operating System shell | `modules/BLP Operating System` | `http://127.0.0.1:4172/index.html` |
| Agent Operations Console | `modules/Agent Operations Console` | `http://127.0.0.1:4175/index.html` |
| Marketing Command Center | `modules/BLP Marketing WebApp` | `http://127.0.0.1:4173/index.html` |
| Tuning CRM / Online Scheduling | `modules/BLP Tuning CRM WebApp` | `http://127.0.0.1:8900` |
| Onboarding Portal | `modules/BLP-Onboarding-WebApp` | `http://127.0.0.1:5276` |
| Chris Shop Manager / Restoration | `modules/BLP-Chris-App-for-Lindsay-2026-06-03` | `http://127.0.0.1:8901` |

## Current Design Direction

The shared BLP look blends:

- bright executive showroom feel
- ivory/paper backgrounds
- real Brigham Larson Pianos logo and showroom imagery
- oxblood red action buttons
- black/ink typography
- Georgia serif headings
- restrained operational dashboard layouts

## Important Live-Data Notes

Do not commit real credentials, OAuth files, API keys, Google tokens, Notion secrets, or private customer data.

Known live-data blockers as of June 3, 2026:

- Chris Shop Manager expects the `gog` CLI and currently fails sheet/calendar endpoints without it.
- Tuning CRM expects `crm_lib` and Google CLI/API access.
- Browser login to a Google account is not enough for backend Python scripts. The backend needs command-line/API credentials.

## Google Source IDs Already Captured

- Piano Log and Inventory: `1ZunbPKygpQlcXfTyPowDHdUE9spJ3uV1XA4iX1eoKRc`
- Tuning CRM: `1cd6Pgm2rFyQvGiQTbRd87sNKohGtRWjY`
- Sequence by Tech: `1k9ToAeueEg5WOtaY91xXzL-a0l_AJsSZWw23tcAWECU`
- Friday Reports: `11RoeVRETag5rZYX6_tEH-rf6x8JL0JeZU0P5AT0WI-I`
- Weekly Completion: `1PrD_X-Ktx7Uh-mCxciu9i_zPk4CdifKIhB7F8AEXxhI`
- Refinishing List: `1bfF4pmuGv7TefVlDG4lo_04gRjiX9QYerK4o9qih6kc`

## Recommended Hermes Workflow

Hermes should work on a branch, not directly on `main`.

Example:

```bash
git clone <github-repo-url>
cd BLP-Operating-System
git checkout -b hermes/knowledge-vault
```

After making changes:

```bash
git status
git add .
git commit -m "Improve Knowledge Vault connection flow"
git push origin hermes/knowledge-vault
```

Then Codex or a human reviewer can review and merge the branch.

## Suggested Next Branches

- `hermes/knowledge-vault`: connect Obsidian/Google Drive vault indexing and source links.
- `hermes/live-google-bridge`: replace or configure `gog`/Google API adapters.
- `hermes/agent-routing`: connect Agent Console requests to Lindsay/Hermes message intake.
- `hermes/module-frame-polish`: refine iframe previews, mobile toggles, and module navigation.
- `hermes/notion-work-sync`: connect Notion tasks to live agent work queues.

## Local Preview Commands

Static modules can usually be served with:

```bash
python3 -m http.server <port> --bind 127.0.0.1
```

Backend modules:

```bash
cd "modules/BLP Tuning CRM WebApp"
python3 api_server.py
```

```bash
cd "modules/BLP-Chris-App-for-Lindsay-2026-06-03"
python3 server.py
```

## Production Direction

The long-term target is one authenticated BLP platform with:

- role-based access
- unified navigation shell
- embedded module workspace
- shared Google/Notion/agent data adapters
- agent dashboards
- human review queues
- live operational logs
- division dashboards for marketing, tuning, shop, inventory, CRM, onboarding, and media

