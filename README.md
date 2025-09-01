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

## EmailJS Template
Use the following variables in your EmailJS template:

```json
<div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #2d3748; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb; line-height: 1.6;">
<!-- Header -->
<div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
<h2 style="margin: 0; font-size: 22px; color: #1a202c;">Daily LeetCode Revision</h2>
</div>

<!-- Body -->
<div style="padding: 20px 0;">
<p style="margin: 0 0 12px;">Hello Leetcoder,</p>
<p style="margin: 0 0 20px;">Here are your two questions to review today:</p>

<ol style="padding-left: 20px; margin: 0 0 20px;">
<li style="margin-bottom: 12px;">
<strong>Question {{first_question_id}}</strong><br>
<a href="{{first_question_url}}" target="_blank" style="color: #3182ce; text-decoration: none;">{{first_question_url}}</a>
</li>
<li>
<strong>Question {{second_question_id}}</strong><br>
<a href="{{second_question_url}}" target="_blank" style="color: #3182ce; text-decoration: none;">{{second_question_url}}</a>
</li>
</ol>

<p style="margin: 20px 0;">Keep practicing daily — steady progress builds mastery.</p>
</div>

<!-- Footer -->
<div style="font-size: 12px; color: #718096; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px;">
<p style="margin: 4px 0;">Made with ❤️ by contributors</p>
<p style="margin: 4px 0;">
<a href="https://github.com/bismansahni/Leetcode-Tracker-Reminder" target="_blank" style="color: #3182ce; text-decoration: none;">
View on GitHub
</a>
</p>
</div>
</div>

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