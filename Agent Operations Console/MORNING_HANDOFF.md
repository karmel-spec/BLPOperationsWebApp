# Morning Handoff: BLP Agent Operations Console

## What I Built While You Were Away

- Continued refining the Desktop prototype at `/Users/blpadmin/Desktop/i-have-11-agents-2-in`.
- Added a live-beta **Needed From Team** panel inside the Integrations screen.
- Kept the current app structure focused around Command, Work Queue, Roster, Agent Desk, Health, Integrations, Agent Log, Org, Approvals, Training, and Knowledge Vault.
- Preserved the static Netlify-ready structure.

## What I Need From You To Finish Things Off

1. **Exact Obsidian vault name**
   So the `obsidian://` link opens the correct local BLP Knowledge Vault.

2. **Exact Google Drive local sync path**
   The shared Drive folder link is wired, but the app will eventually need the local synced folder path if we index files from this computer.

3. **Hermes connection method**
   Tell me whether Hermes exposes Lindsay/Cody through API, webhook, email, local files, database, or another handoff.

4. **OpenClaw connection method**
   Same question for Walter, Dawn, Marcus, Monte, Sally, Libby, Ivory, Melody, and Chris.

5. **Agent mailbox rules**
   Which mailboxes can be read, which can draft replies, and who approves outbound sends.

6. **Discord and Telegram map**
   Channel names, bot/webhook info, handles, and who should receive alerts.

7. **Human team roles**
   Who can approve customer messages, website edits, finance summaries, training changes, permissions, and live actions.

8. **Real cron/automation inventory**
   Current recurring jobs by agent, schedule, owner, output, and failure behavior.

9. **Brigham's product feedback**
   Screens he loves, screens to simplify, wording changes, and what he wants first in the live beta.

10. **Deployment preference**
   Netlify, Vercel, GitHub Pages, or eventual subdomain such as `agents.brighamlarsonpianos.com`.

## Recommended Next Build Order

1. Lock the copy/design of the prototype.
2. Deploy a shareable static demo.
3. Convert static data to JSON files or a tiny backend.
4. Add login and human roles.
5. Connect Google Drive/Knowledge Vault read-only.
6. Connect agent email in read-only/draft-only mode.
7. Add Hermes/OpenClaw task/status adapters.
8. Add real audit log storage.
9. Enable approval-gated outbound actions.

## My Recommendation

First live connector should be **Knowledge Vault + Agent Email** in read-only/draft-only mode. That gives the team real value quickly while keeping risk low.
