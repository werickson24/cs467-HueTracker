# HueTracker

HueTracker is a web application built using Next.js with Prisma, Typescript, MaterialUI and NextAuth. It uses Neon Postgres as its database backend. It provides a streamlined way to manage and track a filament library in a simple web based app.

Created for SE467 - Business Software II.

## Features
- **Authentication**: Integrated WebAuthn passkey authentication system for secure logins.
- **Database Management**: Features for filament database creation, edits, and deletion.
- **Fuzzy Searching**: Extensive search system supporting categorization of results, color similarity, material types and all other data available to search. 

---

## Deployment Instructions

### Deploying to Vercel
1. Link your project with your Vercel account.
   - Use the Vercel command line or dashboard to link your GitHub repository.
2. Link Neon postgres to the project
3. Make sure to pull the latest env from Vercel for developing locally.
   ```
   vercel env pull .env.development.local
   ```
   - Ensure all the correct variables are defined, including `DATABASE_URL` and generating `AUTH_SECRET`; check Neon's setup instructions if database variables are missing.
3. Deploy the schema to Neon using Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. Run locally to test:
   ```bash
   npm run dev
   ```
5. Build locally before pushing to Vercel:
   ```bash
   npm run build
   ```