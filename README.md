# LeetCode Tracker - Serverless Version

A serverless LeetCode practice tracker built with Next.js and deployed on Vercel.

## Features

- Fetches recent LeetCode submissions
- Randomly selects questions for review
- Sends email reminders via EmailJS
- Tracks revision counts
- Automated daily updates via Vercel Cron Jobs

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your database credentials (Vercel Postgres, Neon, or Supabase)
   - Add your EmailJS credentials
   - Generate secure tokens for `SECRET_TOKEN` and `CRON_SECRET`

3. Create the database table:
   ```sql
   CREATE TABLE questions (
     id SERIAL PRIMARY KEY,
     url VARCHAR(255) UNIQUE NOT NULL,
     numberofrevision INTEGER DEFAULT 0,
     last_sent_date TIMESTAMP
   );
   ```

## Deploy to Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Cron Job Configuration

The daily update runs automatically at 9:00 AM UTC. To change the schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-update",
      "schedule": "0 9 * * *"  // Cron expression
    }
  ]
}
```

## API Endpoints

- `GET /api/hit-main?token=YOUR_TOKEN` - Fetch questions and send email
- `GET /api/commit-question?token=YOUR_TOKEN&id1=X&id2=Y` - Update revision count
- `GET /api/cron/daily-update` - Automated endpoint (called by Vercel Cron)

## Database Options

### Vercel Postgres (Recommended)
- Automatic connection pooling
- Built-in with Vercel
- Use `@vercel/postgres` package

### Neon or Supabase
- Update `lib/db.ts` to use their connection strings
- Both support serverless environments

## Migration from Flask

1. Database remains the same (PostgreSQL)
2. Endpoints map directly:
   - `/HitMain` → `/api/hit-main`
   - `/CommitQuestion` → `/api/commit-question`
3. Cron job replaces manual scheduling
4. Environment variables stay similar