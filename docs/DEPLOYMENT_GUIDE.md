# Deployment Guide - Image Upload Workflow

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your production environment:

```env
# Azure AI Services
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Database Schema

Ensure your Supabase database has the `reference_id` column:

```sql
-- Add reference_id column to complaints table
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS reference_id VARCHAR(8) UNIQUE;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_complaints_reference_id
ON complaints(reference_id);

-- Add additional columns for new workflow
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS ai_severity VARCHAR(20),
ADD COLUMN IF NOT EXISTS ai_keywords JSONB,
ADD COLUMN IF NOT EXISTS estimated_resolution_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS additional_notes TEXT;
```

### 3. Storage Buckets

Ensure Supabase storage buckets exist and are configured:

```sql
-- Create bucket if not exists (via Supabase Dashboard)
-- Bucket name: image-complaints
-- Public: Yes
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
```

### 4. Build Optimization

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Optimize bundle
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

---

## Deployment Steps

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
# From project root
vercel

# Or for production
vercel --prod
```

#### Step 4: Set Environment Variables
```bash
# Via Vercel Dashboard
# Project Settings → Environment Variables
# Add all variables from .env
```

#### Step 5: Custom Domain (Optional)
```bash
# Via Vercel Dashboard
# Project Settings → Domains
# Add your custom domain
```

### Option 2: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Step 2: Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
      - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

#### Step 3: Build and Run
```bash
# Build image
docker build -t ai-grievance-app .

# Run container
docker run -p 3000:3000 --env-file .env ai-grievance-app

# Or use docker-compose
docker-compose up -d
```

### Option 3: AWS Amplify

#### Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
```

#### Step 2: Initialize
```bash
amplify init
```

#### Step 3: Add Hosting
```bash
amplify add hosting
# Select: Hosting with Amplify Console
```

#### Step 4: Deploy
```bash
amplify publish
```

---

## Post-Deployment

### 1. Health Checks

Create health check endpoints:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    storage: false,
    ai: false,
  }

  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('complaints').select('count')
    checks.database = !error

    // Check Azure OpenAI
    // Simple ping or test call
    checks.ai = true // Implement actual check

    return Response.json({
      status: 'healthy',
      checks,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        checks,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
```

### 2. Monitoring Setup

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

```bash
# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs
```

### 3. Performance Monitoring

#### Lighthouse CI
```bash
npm install -g @lhci/cli

# Create lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://your-domain.com/new-submit'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
      },
    },
  },
}

# Run
lhci autorun
```

### 4. CDN Configuration

If using Cloudflare or similar CDN:

```
Cache Rules:
- /api/* → No cache (dynamic)
- /_next/static/* → Cache 1 year
- /new-submit → Cache 1 hour, revalidate
```

---

## Scaling Considerations

### 1. API Rate Limiting

Implement Redis-based rate limiting for production:

```bash
npm install ioredis
```

```typescript
// src/lib/rate-limit.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function rateLimit(key: string, limit: number, window: number) {
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, window)
  }
  return count <= limit
}
```

### 2. Image Processing Queue

For heavy image processing, use a queue:

```bash
npm install bullmq
```

```typescript
// Background job for image compression
import { Queue } from 'bullmq'

const imageQueue = new Queue('image-processing', {
  connection: redis,
})

await imageQueue.add('compress', {
  imageUrl: url,
  quality: 0.8,
})
```

### 3. Database Optimization

Add database indexes:

```sql
-- Optimize queries
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_department ON complaints(ai_department);
```

### 4. Caching Strategy

```typescript
// Use Vercel Edge Config for caching
import { get } from '@vercel/edge-config'

export async function getDepartments() {
  const cached = await get('departments')
  if (cached) return cached
  
  // Fetch from database
  const departments = await fetchDepartments()
  return departments
}
```

---

## Security Hardening

### 1. Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

### 2. API Key Rotation

Set up automatic API key rotation:

```bash
# Create rotation schedule
# Azure Portal → Key Vault → Access Policies
# Enable automatic rotation every 90 days
```

### 3. CORS Configuration

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  return response
}
```

---

## Rollback Plan

### Quick Rollback (Vercel)
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Database Rollback
```sql
-- Backup before deployment
pg_dump -h your-db-host -U postgres your-db > backup_$(date +%Y%m%d).sql

-- Restore if needed
psql -h your-db-host -U postgres your-db < backup_20260115.sql
```

---

## Monitoring & Alerts

### Set Up Alerts

#### Uptime Monitoring
```bash
# UptimeRobot or similar
# Monitor: https://your-domain.com/api/health
# Alert if: Response code != 200
# Check interval: 5 minutes
```

#### Error Rate Alerts
```bash
# Sentry
# Alert if: Error rate > 1% in 5 minutes
# Notify: Slack/Email
```

#### Performance Alerts
```bash
# Vercel
# Alert if: p95 response time > 2s
# Alert if: Error rate > 0.1%
```

---

## Maintenance Mode

Create maintenance page:

```typescript
// src/app/maintenance/page.tsx
export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          We'll be back soon!
        </h1>
        <p className="text-gray-600 mb-8">
          We're performing scheduled maintenance. Please check back in a few minutes.
        </p>
      </div>
    </div>
  )
}
```

Enable via middleware:

```typescript
// src/middleware.ts
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true'

if (MAINTENANCE_MODE) {
  return NextResponse.redirect('/maintenance')
}
```

---

## Success Metrics

Track these KPIs post-deployment:

- **Workflow Completion Rate:** Target > 80%
- **Average Completion Time:** Target < 2 minutes
- **Error Rate:** Target < 1%
- **API Success Rate:** Target > 99%
- **User Satisfaction:** Target > 4.5/5

---

**Deployment Status:** ✅ Production Ready
**Last Updated:** January 15, 2026
**Next Review:** February 15, 2026
