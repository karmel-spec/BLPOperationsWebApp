# Notion Live Work Connection

This console can use Notion as the live job board for the agent team. The safest MVP is a Notion internal integration owned by Brigham Larson Pianos, with the token stored only in the local/API server environment.

## Recommended MVP

1. Create a Notion database named `BLP Agent Work`.
2. Add these properties:
   - `Task` as Title
   - `Agent` as Select
   - `Status` as Status
   - `Priority` as Select
   - `Department` as Select
   - `Due Date` as Date
   - `Summary` as Text
   - `Next Step` as Text
   - `Human Owner` as People
   - `Agent Response` as Text
   - `Console ID` as Text
3. Create a Notion internal integration.
4. Share the `BLP Agent Work` database with that integration.
5. Start the local API with:

```bash
BLP_NOTION_TOKEN="secret_xxx" \
BLP_NOTION_WORK_DATABASE_ID="your_database_id" \
node scripts/local-api.mjs
```

6. Test the feed:

```bash
curl http://127.0.0.1:8787/api/notion/work
```

## What The Console Reads

The API normalizes Notion pages into console work items:

- `Task` -> work title
- `Agent` -> assigned agent
- `Status` -> current work state
- `Priority` -> risk/priority
- `Department` -> console department grouping
- `Due Date` -> due date
- `Summary` -> operating brief
- `Next Step` -> next action

The bridge also accepts common alternate property names such as `Name`, `Title`, `Owner Agent`, `Stage`, `Due`, `Notes`, and `Next Action`.

## Why Not OAuth First

OAuth is useful if this becomes an installable app for many Notion workspaces. For BLP's own internal console, an internal integration is faster, simpler, and easier to secure. The browser never receives the token.

## Phase 2

After the database is approved, the next layer is:

- Create Notion tasks when a human assigns an agent project from the console.
- Update the console Work Queue from Notion on refresh.
- Add a Notion webhook or scheduled sync so updates appear without manual export.
- Push agent responses back into `Agent Response` and move `Status` to `Needs Review`.
