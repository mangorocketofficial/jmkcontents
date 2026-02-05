# JMK Contents - Development Plan

## Project Overview

**JMK Contents** is a comprehensive web platform for managing and showcasing Korean certification exam preparation mobile apps. The platform serves as a central hub for app metadata, study resources, and user support.

- **Domain**: `jmkcontents.com` (Cloudflare)
- **Target**: 30+ iOS exam prep apps
- **Users**: Korean certification exam candidates

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Component library)

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Next.js API Routes** (Server actions)
- **Edge Runtime** (Vercel)

### Infrastructure
- **Vercel** (Hosting + CDN + Edge Functions)
- **Cloudflare** (DNS + DDoS protection)
- **Supabase** (Database + File storage)

### Analytics (Optional)
- **Vercel Analytics**
- **Google Analytics 4**

---

## Core Features

### 1. App Directory
- List of all published apps
- App metadata (name, description, icon, categories)
- Download links (App Store)
- App-specific landing pages

### 2. Legal Pages (Required for App Store)
- **Privacy Policy** (`/privacy`) - Common for all apps
- **Support** (`/support`) - FAQ + Contact form
- **Terms of Service** (`/terms`)

### 3. App-Specific Pages
- **Marketing Page** (`/apps/{app_id}`)
  - App screenshots
  - Feature highlights
  - Download button
  - User reviews (optional)

### 4. Study Resources (Future)
- **Concepts** (`/apps/{app_id}/concepts`)
  - Core concepts for each exam category
  - Extracted from database
- **Lectures** (`/apps/{app_id}/lectures`)
  - Audio lecture transcripts
  - Podcast-style content
- **Statistics** (`/apps/{app_id}/stats`)
  - Question difficulty distribution
  - Popular topics

### 5. Admin Dashboard (Phase 2)
- Add/Edit apps
- Update study resources
- View analytics

---

## Database Schema (Supabase)

### Tables

#### `apps`
```sql
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id TEXT UNIQUE NOT NULL,           -- e.g., 'indsafety_prod'
  app_name TEXT NOT NULL,                   -- e.g., '산업안전산업기사'
  app_name_full TEXT,                       -- e.g., '산업안전산업기사-기출문제,음성듣기'
  description TEXT,
  keywords TEXT[],
  icon_url TEXT,                            -- App icon stored in Supabase Storage
  app_store_url TEXT,                       -- Apple App Store link
  status TEXT DEFAULT 'draft',              -- 'draft' | 'published' | 'archived'
  categories TEXT[],                        -- ['EDUCATION', 'REFERENCE']

  -- Metadata
  privacy_url TEXT DEFAULT '/privacy',      -- Can override if app-specific
  support_url TEXT DEFAULT '/support',
  marketing_url TEXT,                       -- Generated as /apps/{bundle_id}

  -- Stats
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_apps_bundle_id ON apps(bundle_id);
CREATE INDEX idx_apps_status ON apps(status);
```

#### `concepts`
```sql
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  category TEXT NOT NULL,                   -- e.g., '산업안전관리론'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  importance TEXT,                          -- 'high' | 'medium' | 'low'
  related_questions INTEGER[],              -- Question IDs

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_concepts_app_id ON concepts(app_id);
CREATE INDEX idx_concepts_category ON concepts(category);
```

#### `lectures`
```sql
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  audio_url TEXT,                           -- Stored in Supabase Storage
  transcript TEXT,
  duration INTEGER,                         -- seconds

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lectures_app_id ON lectures(app_id);
```

#### `contact_submissions`
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id),          -- Optional: which app
  name TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',                -- 'new' | 'replied' | 'closed'

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## URL Structure

### Public Routes

```
/                                    # Home (App directory)
/apps                                # All apps list
/apps/{bundle_id}                    # App landing page
/apps/{bundle_id}/concepts           # Concept library
/apps/{bundle_id}/lectures           # Audio lectures
/apps/{bundle_id}/stats              # Study statistics

/privacy                             # Privacy Policy (Common)
/support                             # Support & FAQ (Common)
/terms                               # Terms of Service
/contact                             # Contact form

/about                               # About JMK Contents
```

### API Routes

```
/api/apps                            # GET: List all apps
/api/apps/{bundle_id}                # GET: Single app details
/api/apps/{bundle_id}/concepts       # GET: Concepts for app
/api/apps/{bundle_id}/lectures       # GET: Lectures for app
/api/contact                         # POST: Submit contact form
```

### Admin Routes (Phase 2)

```
/admin/login
/admin/dashboard
/admin/apps
/admin/apps/new
/admin/apps/{bundle_id}/edit
/admin/concepts
/admin/lectures
```

---

## File Structure

```
jmk-contents-web/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   ├── apps/
│   │   ├── page.tsx                 # Apps directory
│   │   └── [bundle_id]/
│   │       ├── page.tsx             # App landing page
│   │       ├── concepts/
│   │       │   └── page.tsx
│   │       ├── lectures/
│   │       │   └── page.tsx
│   │       └── stats/
│   │           └── page.tsx
│   ├── privacy/
│   │   └── page.tsx                 # Privacy Policy
│   ├── support/
│   │   └── page.tsx                 # Support page
│   ├── terms/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── api/
│       ├── apps/
│       │   └── route.ts
│       └── contact/
│           └── route.ts
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── AppCard.tsx
│   ├── ConceptCard.tsx
│   ├── LecturePlayer.tsx
│   ├── ContactForm.tsx
│   └── Header.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client
│   │   └── server.ts                # Server-side client
│   └── utils.ts
├── public/
│   ├── icons/                       # App icons
│   └── images/
├── styles/
│   └── globals.css
├── .env.local
├── next.config.js
└── package.json
```

---

## Key Pages Design

### 1. Home Page (`/`)

**Components:**
- Hero section with company branding
- Featured apps (3-4 cards)
- App categories filter
- All apps grid
- Footer with legal links

**Content:**
```tsx
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedApps />
      <AppGrid />
      <Footer />
    </>
  );
}
```

---

### 2. App Landing Page (`/apps/{bundle_id}`)

**Sections:**
- App icon + name + download button
- Screenshots carousel
- Feature highlights
- Study statistics
- Related resources (concepts, lectures)
- Reviews (optional)

**Dynamic Data from Supabase:**
```tsx
export default async function AppPage({ params }) {
  const { bundle_id } = params;
  const app = await getApp(bundle_id);

  return (
    <>
      <AppHeader app={app} />
      <Screenshots app={app} />
      <Features app={app} />
      <Resources bundle_id={bundle_id} />
    </>
  );
}
```

---

### 3. Privacy Policy (`/privacy`)

**Content:**
```markdown
# Privacy Policy - JMK Contents

## Information We Collect
- Device information (Ad ID)
- App usage statistics
- No personal identification

## How We Use Information
- Personalized advertising (Google AdMob)
- Service improvement
- Analytics (Firebase)

## Third-Party Services
- Google AdMob
- Firebase Analytics
- Affiliate advertising platforms

## Contact
- Email: bombezzang100@gmail.com
- Company: JMK Contents
```

---

### 4. Support Page (`/support`)

**Sections:**
- FAQ accordion
- Contact form
- Email: bombezzang100@gmail.com
- Response time: Mon-Fri 9AM-6PM KST

**Features:**
- App-specific FAQ filtering
- Search functionality
- Contact form with email notification

---

### 5. Concepts Page (`/apps/{bundle_id}/concepts`)

**Layout:**
- Category tabs (e.g., 산업안전관리론, 기계위험방지기술)
- Concept cards grid
- Importance badges (high/medium/low)
- Related questions link

**Data Source:**
- Fetch from Supabase `concepts` table
- Filter by app_id and category

---

### 6. Lectures Page (`/apps/{bundle_id}/lectures`)

**Layout:**
- Audio player for each lecture
- Transcript toggle
- Duration display
- Download button (optional)

**Data Source:**
- Fetch from Supabase `lectures` table
- Audio files stored in Supabase Storage

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Optional - for contact form)
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL=bombezzang100@gmail.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Deployment

### 1. Vercel Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

### 2. Cloudflare DNS Configuration

**Add CNAME record:**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: Enabled (Orange cloud)
```

**Add www subdomain:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: Enabled
```

### 3. Vercel Domain Setup

1. Go to Vercel Project Settings → Domains
2. Add `jmkcontents.com`
3. Add `www.jmkcontents.com`
4. Vercel will provide DNS records
5. Update Cloudflare with Vercel's records

---

## Data Migration Strategy

### From SQLite to Supabase

**Step 1: Export app data from app_config.json**
```python
# migration/export_apps.py
import json
import sqlite3

def export_app_data(bundle_id):
    # Read app_config.json
    config_path = f"output/{bundle_id}/ios/app_config.json"
    with open(config_path) as f:
        config = json.load(f)

    # Read questions.db for categories
    db_path = f"output/{bundle_id}/assets/database/questions.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT Category FROM questions")
    categories = [row[0] for row in cursor.fetchall()]

    return {
        "bundle_id": bundle_id,
        "app_name": config["app_name"],
        "keywords": config["keywords"],
        "categories": categories,
        ...
    }
```

**Step 2: Import to Supabase**
```typescript
// migration/import_to_supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

async function importApps(apps) {
  const { data, error } = await supabase
    .from('apps')
    .insert(apps)

  if (error) throw error
  console.log('Imported:', data.length, 'apps')
}
```

---

## Integration with 12_deliver.py

**Auto-generate URLs based on jmkcontents.com:**

```python
# 12_deliver.py - Updated

def get_default_urls(bundle_id):
    """기본 URL 반환 (jmkcontents.com 기반)"""
    base = "https://jmkcontents.com"
    return {
        "privacy_url": f"{base}/privacy",
        "support_url": f"{base}/support",
        "marketing_url": f"{base}/apps/{bundle_id}"
    }

def generate_metadata(project_root_folder, bundle_id):
    # ... existing code ...

    # URL 처리 (자동 생성)
    default_urls = get_default_urls(bundle_id)

    privacy_url = metadata_dict.get("privacy_url") or config.get("privacy_url") or default_urls["privacy_url"]
    support_url = metadata_dict.get("support_url", default_urls["support_url"])
    marketing_url = metadata_dict.get("marketing_url", default_urls["marketing_url"])

    # 메타데이터 파일 생성
    with open(os.path.join(metadata_ko, "privacy_url.txt"), "w") as f:
        f.write(privacy_url)
    with open(os.path.join(metadata_ko, "support_url.txt"), "w") as f:
        f.write(support_url)
    with open(os.path.join(metadata_ko, "marketing_url.txt"), "w") as f:
        f.write(marketing_url)

    update_progress(f"✅ URL 자동 생성 완료: {marketing_url}")
```

---

## Development Timeline

### Phase 1: MVP (Week 1-2)
- [x] Next.js project setup
- [x] Supabase client configuration
- [x] Basic pages (Home, Privacy, Support, Terms, Contact, About, Apps)
- [x] App card component
- [x] Header and Footer components
- [ ] Supabase database schema (tables creation)
- [ ] App landing page template (dynamic route)
- [ ] Vercel deployment
- [ ] Cloudflare DNS configuration

### Phase 2: Content (Week 3-4)
- [ ] Import existing apps to Supabase
- [ ] Concept pages
- [ ] Lecture pages
- [ ] Contact form
- [ ] App Store links

### Phase 3: Enhancement (Week 5-6)
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Performance optimization

### Phase 4: Maintenance (Ongoing)
- [ ] Add new apps
- [ ] Update content
- [ ] Monitor analytics
- [ ] User feedback

---

## Quick Start Commands

```bash
# Create Next.js project
npx create-next-app@latest jmk-contents-web --typescript --tailwind --app

# Install dependencies
cd jmk-contents-web
npm install @supabase/supabase-js
npm install @supabase/ssr
npm install lucide-react
npm install clsx tailwind-merge

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input textarea

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Success Metrics

### Technical
- Page load time < 2s
- Lighthouse score > 90
- 99.9% uptime (Vercel SLA)

### Business
- All 30 apps migrated within 1 month
- < 5 support requests per week
- App Store approval rate: 100%

### User
- Bounce rate < 40%
- Avg session duration > 2 min
- Contact form conversion > 5%

---

## Security Considerations

1. **API Routes**: Rate limiting with Vercel Edge
2. **Database**: Row Level Security (RLS) in Supabase
3. **File Upload**: Max size limits, virus scanning
4. **Contact Form**: reCAPTCHA, input sanitization
5. **Environment Variables**: Never expose service role key

---

## Backup & Recovery

- **Database**: Supabase automatic daily backups
- **Files**: Supabase Storage replication
- **Code**: Git version control
- **Vercel**: Automatic deployment rollback

---

## Support & Maintenance

- **Monitoring**: Vercel Analytics + Supabase Dashboard
- **Logging**: Vercel Logs + Supabase Logs
- **Alerts**: Email notifications for errors
- **Updates**: Monthly dependency updates

---

## Contact

- **Developer**: Jongmin Kim
- **Email**: bombezzang100@gmail.com
- **Domain**: jmkcontents.com
- **Repository**: [GitHub URL]

---

**Last Updated**: 2026-02-05
**Version**: 1.1
**Status**: Development Phase (MVP in progress)
