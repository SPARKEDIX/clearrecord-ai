# ClearRecord AI

Pre-employment social media privacy audit tool for job seekers.

Users upload their official social media data archives, AI scans all content
against 13 employer screening risk categories (workplace hostility, aggressive
debates, profanity, substance references, etc.), each item is categorized as
High / Medium / Safe risk. Includes a quantifiable Digital Hygiene Score
(0-100) and a downloadable PDF report.

## Stack

- **Frontend:** Next.js (React 18+, App Router)
- **Backend:** Firebase (Auth, Cloud Functions, Storage)
- **Database:** Firebase Firestore (NoSQL)
- **Styling:** Tailwind CSS, Lexend font, Spotify Dark palette

## Docs

PRD source files live in [`docs/prd/`](./docs/prd/):

- `1_product_overview.md` — problem, solution, audience, value prop, success goals
- `2_features_requirements.md` — MoSCoW features + data model
- `3_ui_ux_requirements.md` — color tokens, design guidance, core screens
- `4_technical_requirements.md` — stack, architecture, folder structure, data flow, checklist

## Quickstart (planned)

```bash
npm install
npm run dev   # http://localhost:3000
```
