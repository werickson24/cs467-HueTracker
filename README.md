# HueTracker

HueTracker is a web application built using Next.js with Prisma for database management and NextAuth for authentication. It provides a streamlined way to manage and track a filament library.

## Features
- **Authentication**: Integrated WebAuthn passkey authentication system for secure logins.
- **Database Management**: Features for filament database creation, edits, and deletion.

---

## Deployment Instructions

### Deploying to Vercel
1. Link your project with your Vercel account.
   - Use the Vercel command line or dashboard to link your GitHub repository.
2. Set up environment variables:
   - Define `DATABASE_URL` for Prisma and Neon.
3. Build the application:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

### Connecting Neon Database
1. Use the Neon dashboard to create an initial database.

2. Make sure to pull the latest env from Vercel when developing locally.
   ```
   vercel env pull .env.development.local
   ```

4. Push Prisma schema changes:
   ```
   npx prisma migrate deploy
   ```

