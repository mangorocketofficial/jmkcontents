# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JMK Contents is a web platform for promoting and managing Korean certification exam preparation iOS apps. The project is a Next.js 15 application deployed on Vercel.

- **Production URL**: https://jmkcontents.vercel.app
- **GitHub**: https://github.com/jmkcontents/jmkcontents
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase/Firebase, Vercel
- **Contact**: bombezzang2607@gmail.com

## Repository Structure

This is a monorepo with the Next.js application in the `jmk-contents-web` directory:

```
jmkcontents/
├── jmk-contents-web/          # Main Next.js 15 application
│   ├── app/                   # App Router (Next.js 15)
│   ├── components/            # React components
│   ├── lib/                   # Core libraries
│   │   ├── api/              # API functions (apps.ts, contact.ts)
│   │   ├── supabase/         # Supabase client setup
│   │   └── firebase/         # Firebase admin setup
│   └── supabase/migrations/  # Database migrations
├── CLAUDE.md                  # This file
├── DEPLOYMENT_GUIDE.md        # Operations and deployment guide
└── JMK_CONTENTS_DEVELOPMENT_PLAN.md  # Development roadmap
```

## Common Commands

All commands should be run from the `jmk-contents-web` directory:

```bash
# Development
cd jmk-contents-web
npm run dev              # Start development server at localhost:3000

# Build and Production
npm run build            # Production build (required to test SSG)
npm start               # Start production server after build

# Code Quality
npm run lint            # Run ESLint
npm run lint -- --fix   # Auto-fix linting issues

# Deployment
# Push to main branch triggers automatic Vercel deployment
git push origin main
```

## Architecture

### Database: Dual Backend Support

The project supports **both Supabase and Firebase**. This dual setup allows migration flexibility:

1. **Supabase** (Primary, currently active):
   - PostgreSQL database
   - Schema defined in [supabase/migrations/20260205_initial_schema.sql](jmk-contents-web/supabase/migrations/20260205_initial_schema.sql)
   - Client setup: [lib/supabase/](jmk-contents-web/lib/supabase/)
   - TypeScript types auto-generated: [lib/supabase/types.ts](jmk-contents-web/lib/supabase/types.ts)

2. **Firebase** (Alternative implementation):
   - Firestore database
   - Admin SDK setup: [lib/firebase/admin.ts](jmk-contents-web/lib/firebase/admin.ts)
   - Mirror API functions: [lib/firebase/apps.ts](jmk-contents-web/lib/firebase/apps.ts)

**Important**: Both implementations exist in parallel with identical function signatures. To switch between backends, update imports in page files from `@/lib/api/apps` (Supabase) to `@/lib/firebase/apps` (Firebase).

### Database Tables

Four main tables (Supabase) / collections (Firebase):

- **apps**: iOS app metadata (bundle_id, name, description, stats)
- **concepts**: Learning concepts/study materials linked to apps
- **lectures**: Audio lectures with transcripts
- **contact_submissions**: User contact form submissions

See [lib/supabase/types.ts](jmk-contents-web/lib/supabase/types.ts) for complete type definitions.

### Next.js Rendering Strategy

- **SSG (Static Site Generation)**: App detail pages pre-built at build time using `generateStaticParams()`
- **ISR (Incremental Static Regeneration)**: Homepage and app listing pages revalidate every 3600 seconds (1 hour)
- **App Router**: Using Next.js 15 App Router (not Pages Router)

Example from [app/page.tsx](jmk-contents-web/app/page.tsx):
```typescript
export const revalidate = 3600 // Revalidate every hour
```

### Component Architecture

- **UI Components**: shadcn/ui components in [components/ui/](jmk-contents-web/components/ui/)
- **Layout Components**: [Header.tsx](jmk-contents-web/components/Header.tsx), [Footer.tsx](jmk-contents-web/components/Footer.tsx)
- **Reusable Components**: [AppCard.tsx](jmk-contents-web/components/AppCard.tsx) for displaying app tiles
- **Styling**: Tailwind CSS 4 with custom configuration

### API Pattern

All data fetching functions follow a consistent pattern in [lib/api/apps.ts](jmk-contents-web/lib/api/apps.ts):

```typescript
// Server-side data fetching
import { createClient } from '@/lib/supabase/server'

export async function getApps(): Promise<App[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('status', 'published')
  // ...
}
```

These functions are called directly in Server Components.

## Development Guidelines

### Adding New Apps

Apps can be added via:
1. Supabase Dashboard (recommended): https://supabase.com/dashboard
2. SQL queries in Supabase SQL Editor
3. Future admin dashboard (Phase 4)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#새로운-앱-추가-방법) for detailed instructions.

### Adding New Pages

1. Create new route in `app/` directory (App Router)
2. Use Server Components by default for better performance
3. Add metadata export for SEO
4. Follow existing patterns in [app/apps/page.tsx](jmk-contents-web/app/apps/page.tsx)

Example:
```typescript
// app/new-page/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}

export default async function NewPage() {
  // Server Component - can directly await data
  const data = await fetchData()
  return <div>...</div>
}
```

### Environment Variables

Required for development and production:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://bzqifzrkikanhvylwfjv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...  # Server-only

# Firebase (if using Firebase backend)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Contact
CONTACT_EMAIL=bombezzang2607@gmail.com
```

Local development uses `.env.local`. Production variables are set in Vercel Dashboard.

### TypeScript

- Strict mode enabled
- Database types are auto-generated in [lib/supabase/types.ts](jmk-contents-web/lib/supabase/types.ts)
- Always use proper types from Database schema:
  ```typescript
  import type { Database } from '@/lib/supabase/types'
  type App = Database['public']['Tables']['apps']['Row']
  ```

### Testing Production Build

Always test production builds before deploying:

```bash
cd jmk-contents-web
npm run build    # Must succeed without errors
npm start        # Test the production server
```

## Deployment

### Automatic Deployment (Preferred)

Pushing to `main` branch triggers automatic Vercel deployment:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Vercel Configuration

- **Framework Preset**: Next.js
- **Root Directory**: `jmk-contents-web`
- All other settings use defaults
- Environment variables must be set in Vercel Dashboard

### Git Workflow

When committing CLAUDE.md updates, always create a commit:

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md - [describe change]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

## Current Status (2026-02-05)

### Completed (Phase 1-3)
- ✅ Next.js 15 setup with App Router
- ✅ Supabase/Firebase dual backend
- ✅ Homepage, app listing, and app detail pages
- ✅ SSG/ISR implementation
- ✅ shadcn/ui component library
- ✅ Responsive design
- ✅ Vercel production deployment
- ✅ Cloudflare DNS configuration

### In Progress (Phase 4)
- 🔄 App concepts/lectures pages
- 🔄 Image upload and Storage integration
- 🔄 Admin dashboard for content management
- 🔄 Contact form functionality
- 🔄 Google Analytics integration

## Troubleshooting

### Build Failures
1. Check Build Logs in Vercel Dashboard
2. Run `npm run build` locally to reproduce
3. Verify environment variables are set in Vercel

### Data Not Updating
- ISR revalidates every 1 hour
- For immediate updates, redeploy via `vercel --prod`
- Check Supabase RLS policies if data access fails

### TypeScript Errors
- Run `npm run lint` to check for issues
- Ensure imports use proper paths with `@/` alias
- Verify database types match schema in [lib/supabase/types.ts](jmk-contents-web/lib/supabase/types.ts)

## Additional Resources

- **Deployment Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for operations and maintenance
- **Development Plan**: See [JMK_CONTENTS_DEVELOPMENT_PLAN.md](JMK_CONTENTS_DEVELOPMENT_PLAN.md) for roadmap
- **Supabase Dashboard**: https://supabase.com/dashboard (Project: bzqifzrkikanhvylwfjv)
- **Vercel Dashboard**: https://vercel.com/dashboard
