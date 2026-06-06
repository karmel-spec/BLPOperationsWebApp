# Chris Shop Manager Handoff

Source file: `BLP-Chris-App-for-Lindsay-2026-06-03.zip`  
Imported folder: `/Users/blpadmin/Desktop/BLP-Chris-App-for-Lindsay-2026-06-03`  
Role in mega-app: restoration shop, Piano Log, technician dashboards, floor-plan map, weekly planning, and shop operations.

## What Chris Sent

Chris packaged the live BLP Shop Manager app from Brigham's MacBook. The app is currently running on Brigham's MacBook via launchd on port `8901`.

The bundle includes:

- `server.py`: Python HTTP API with roughly 30+ endpoints
- `index.html`: standalone landing/preview page
- `skills-data.json`: technician skills matrix seed data
- `prs.json`: performance review notes data
- `start_chris_app.sh`: launch script
- `static/index.html`: main dashboard UI
- `static/app.js`: frontend logic
- `static/styles.css`: BLP-branded styling
- `static/tech-dashboard-enhancements.js`: extra tech dashboard features
- `static/maps/`: floor-plan section images and pointers

Excluded on purpose:

- QBO customer database with PII
- Cached sheet data
- Offline demo file
- Runtime logs

## Live Data Sources

| Source | ID / Address | Purpose |
|---|---|---|
| Piano Log | `1ZunbPKygpQlcXfTyPowDHdUE9spJ3uV1XA4iX1eoKRc` | Main Piano Log pipeline |
| Sequence by Tech | `1k9ToAeueEg5WOtaY91xXzL-a0l_AJsSZWw23tcAWECU` | Technician sequence/work history |
| Friday Reports | `11RoeVRETag5rZYX6_tEH-rf6x8JL0JeZU0P5AT0WI-I` | Weekly technician reports |
| Weekly Completion | `1PrD_X-Ktx7Uh-mCxciu9i_zPk4CdifKIhB7F8AEXxhI` | Weekly schedule completion |
| Refinishing List | `1bfF4pmuGv7TefVlDG4lo_04gRjiX9QYerK4o9qih6kc` | Refinishing queue |
| Moving Calendar | `pianomoving.blp@gmail.com` | Delivery/moving pulse |
| Tech Calendars | 13 individual `@blp` calendars | Technician capacity and conflict checks |

QC-approved technicians hardcoded in `server.py`:

- Curtis Biggs
- Jake Pulver
- McKinly Lopp

## Features

- Piano Log dashboard with pipeline filters, search, status badges, and stats
- 7-stage restoration pipeline: CAP, Soundboard/Bridge, Restringing, DHRT, Refinishing, Plating, QC
- Per-piano stage notes
- New Piano form
- QBO-backed customer search, with PII excluded from this bundle
- Shopping list and supply requests
- Technician dashboard with history, assignments, and performance notes
- Skills matrix
- Floor-plan map with clickable piano-location markers
- Weekly planning board
- Friday Report parser
- App request mailto flow
- Live Google Sheets sync through `gog`
- Health endpoint
- Technician calendar integration

## Roadmap Candidates

- Auto-populate stage data from Sequence by Tech and Friday Reports
- Historical hours per stage per technician
- Auto-generated skills matrix from completed work
- Suggested work assignment based on capacity and skill level
- Delivery pulse integration
- Monday admin email draft for Melissa
- Weekly Planning Wizard
- Showroom inspection packet
- Calendar conflict audit before publishing assignments
- Public read-only restoration customer status page

## Current Local Wiring Status

The app has been imported, but full live mode is not wired on this laptop yet.

Known status:

- Python syntax check passes.
- `gog` is not currently installed or not on `PATH` on this laptop.
- The connected Google Drive account can access these sheets:
  - Piano Log
  - Sequence by Piano technician
  - Friday report
  - Weekly schedule assignment completion form
- Refinishing List access still needs a retry after the temporary Sheets API rate limit clears.

## Required Permissions / Connections

To run Chris's app as-is:

1. Install or locate the `gog` CLI on this laptop.
2. Authenticate `gog` for `chris@brighamlarsonpianos.com`.
3. Confirm `chris@brighamlarsonpianos.com` has at least read access to the source sheets.
4. Confirm write access where the app writes:
   - adding pianos
   - updating stages
   - saving stage notes
   - shopping list updates
   - PR/performance notes
5. Share the Moving Calendar and 13 technician calendars with `chris@brighamlarsonpianos.com`.

## Mega-App Merge Notes

Chris's app should become the `Shop Manager / Restoration Console` module in the BLP Operating System.

Recommended merge approach:

1. Keep Chris's folder intact as a reference implementation.
2. Define a shared data adapter for Google Sheets and calendars.
3. Replace direct `gog` subprocess calls with the shared data adapter.
4. Move the shop dashboard into the unified shell behind role-based permissions.
5. Preserve technician dashboard access rules:
   - Brigham: full
   - Karmel: full/executive
   - Chris: shop admin
   - Technicians: own dashboard plus read-only Piano Log
   - Ivory: CRM cross-link
   - Melody: front-desk read

