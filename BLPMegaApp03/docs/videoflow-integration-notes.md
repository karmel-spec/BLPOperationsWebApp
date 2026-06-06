# BLP VideoFlow Integration Notes

Source handoff folder:
https://drive.google.com/drive/folders/1-rpmGm4U7ulChmA5j2ad_cBDMegjPOrj

Source code folder:
https://drive.google.com/drive/folders/1oqOXYfpBI4blFXNk88wXvPjC3zxd3-cd

Primary source entry points:
- `components/video-flow-app.tsx`
- `app/page.tsx`
- `app/globals.css`
- `app/api/projects/route.ts`
- `app/api/google/drive/raw-uploads/route.ts`
- `app/api/youtube/auth/route.ts`
- `app/api/youtube/callback/route.ts`
- `app/api/youtube/channel/route.ts`
- `services/youtube/live.ts`
- `services/google/drive.ts`
- `db/supabase-video-projects.sql`
- `.env.example`

Current module status:
- Next.js 16 / TypeScript / Tailwind v4 app.
- Handoff is accessible in Google Drive.
- Source code is available but not yet reconstructed as a local runnable folder.
- Secrets are intentionally excluded from the handoff.
- Google Drive, YouTube OAuth, and Supabase wiring are started, but require fresh `.env.local`.
- Agent outputs for Ed, Yolanda, and Sharie are first-pass draft/mock outputs.

Local run target from handoff:
```sh
npm install
npm_config_cache=./work/.npm-cache npx next dev -H 127.0.0.1 -p 3005
```

Required next setup inputs:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_DRIVE_RAW_UPLOAD_FOLDER_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase SQL run from `db/supabase-video-projects.sql`
- Google OAuth redirect URI: `http://127.0.0.1:3005/api/youtube/callback`

Design integration notes:
- Apply the shared BLP Operating System shell: ivory background, BLP logo, Georgia headings, oxblood primary actions, champagne accents, soft cards, and 8px radii.
- Preserve live/mock labels, but restyle them into the shared status-pill system.
- Keep the 8-column workflow board, agent queues, approval gates, and settings status views.
- Add a top-level launcher card from the BLP Operating System once the local module runs on port `3005`.

Observed current design from Drive source:
- `app/globals.css` currently uses `--background: #f7f7f8`, `--card: #ffffff`, `--accent: #b42318`, `--gold: #c8a45d`, and Assistant/Inter.
- `components/video-flow-app.tsx` currently references remote BLP logo and showroom image URLs.
- Current agent color set includes Marcus, Ed, Yolanda, and Sharie with individual colors.
- Main UI already contains `Dashboard`, `Project`, `Agent Queues`, `Calendar`, `Analytics`, and `Settings`.

Recommended first design patch after local reconstruction:
- Change global tokens to match the mega app shell:
  - `--background: #f8f5ee`
  - `--foreground: #161514`
  - `--card: #fffdf8`
  - `--muted: #746d64`
  - `--line: #d9d2c5`
  - `--accent: #a71920`
  - `--accent-soft: rgba(167, 25, 32, 0.12)`
  - `--gold: #d7bf86`
- Replace remote logo/showroom constants with local assets in `public/brand/blp-logo.png` and `public/brand/showroom.jpg`.
- Update page/card heading classes to use Georgia where the component currently uses only utility font weights.
- Restyle live/mock badges so they match the shared module status pills while keeping the important distinction between real and placeholder output.
