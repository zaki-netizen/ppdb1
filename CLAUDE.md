# CLAUDE.md - PPDB Portal Development Guide

## Project Overview

**PPDB Portal** adalah Sistem Penerimaan Peserta Didik Baru berbasis web yang transparan, aman, dan efisien.

## Quick Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run seed             # Load demo data

# Deployment
vercel deploy            # Deploy to Vercel
vercel --prod            # Deploy to production
```

## Environment Variables Required

```env
# Database (required for production)
DATABASE_URL=postgresql://user:password@host:5432/ppdb_db

# NextAuth (required)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional: Resend for email notifications
RESEND_API_KEY=
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn/UI
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** NextAuth.js v5
- **Deployment:** Vercel

## Important Files

- `src/app/` - Next.js App Router pages
- `src/app/api/` - API routes
- `src/components/` - UI components
- `drizzle/schema.ts` - Database schema
- `.env.local` - Local environment variables

## MCP Servers Available

This project is configured with MCP servers for enhanced development:

- **Vercel** - Deploy and manage Vercel projects
- **GitHub** - GitHub operations (PRs, issues, repos)
- **Paper** - Design system sync

## Database

Uses PostgreSQL with Drizzle ORM. Run `npm run db:push` after schema changes.

## Demo Accounts

- Admin: `admin@ppdb.test` / `admin123`
- Student: `ahmad@student.test` / `password123`
