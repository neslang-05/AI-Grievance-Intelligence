# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account
- Azure account (with AI services)
- Supabase account

## Step 1: Prepare Repository

1. Initialize git (if not already):
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit: AI Grievance Platform"
   \`\`\`

2. Push to GitHub:
   \`\`\`bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-grievance-platform.git
   git push -u origin main
   \`\`\`

## Step 2: Production Database Setup

### Supabase Production Project

1. Create new Supabase project (production)
2. Run migrations:
   - Go to SQL Editor
   - Execute `supabase/migrations/001_create_complaints_table.sql`
3. Create storage buckets:
   - `image-complaints` (public)
   - `voice-complaints` (public)
4. Configure RLS policies (important for production):

\`\`\`sql
-- Enable RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for citizen submissions)
CREATE POLICY "Allow anonymous inserts" ON complaints
FOR INSERT TO anon
WITH CHECK (true);

-- Allow public reads
CREATE POLICY "Allow public reads" ON complaints
FOR SELECT TO public
USING (true);

-- Restrict updates to authenticated users only
CREATE POLICY "Allow authenticated updates" ON complaints
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);
\`\`\`

5. Get production credentials:
   - Project URL
   - Anon Key
   - Service Role Key

## Step 3: Azure Services Setup

### Production Azure Resources

1. **Create Resource Group**:

   - Name: `rg-grievance-platform-prod`
   - Region: Southeast Asia

2. **Azure OpenAI**:

   - Create production resource
   - Deploy GPT-4 Vision model
   - Note endpoint and key

3. **Azure Speech Services**:
   - Create production resource
   - Choose same region
   - Note key and region

## Step 4: Deploy to Vercel

### Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Set Environment Variables

Add all variables from `.env`:

\`\`\`
AZURE_OPENAI_ENDPOINT=your_production_endpoint
AZURE_OPENAI_API_KEY=your_production_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-vision

AZURE_SPEECH_KEY=your_production_speech_key
AZURE_SPEECH_REGION=southeastasia

NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
\`\`\`

### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your production URL

## Step 5: Custom Domain (Optional)

1. In Vercel project settings
2. Go to "Domains"
3. Add custom domain
4. Follow DNS configuration instructions

## Step 6: Production Testing

### Test Checklist

\`\`\`bash

# Test citizen flow

✓ Submit text complaint
✓ Submit voice complaint  
✓ Submit image complaint
✓ Test GPS location
✓ Verify AI processing
✓ Check database entry

# Test officer dashboard

✓ View complaints
✓ Filter by status
✓ Update complaint status
✓ View media files

# Test error handling

✓ Invalid inputs
✓ Network errors
✓ Large file uploads
\`\`\`

## Step 7: Monitoring Setup

### Vercel Analytics

1. Enable Analytics in Vercel dashboard
2. Monitor:
   - Request volume
   - Response times
   - Error rates

### Azure Monitoring

1. Enable Application Insights
2. Set up cost alerts:
   - OpenAI usage
   - Speech Services usage

### Supabase Monitoring

1. Check dashboard for:
   - Database size
   - API requests
   - Storage usage

## Step 8: Security Hardening

### Production Security Checklist

\`\`\`bash
✓ Enable HTTPS only
✓ Configure CORS properly
✓ Add rate limiting
✓ Enable Supabase RLS
✓ Restrict API keys
✓ Add input validation
✓ Enable file scanning
✓ Set up monitoring
✓ Configure backups
✓ Add error tracking (Sentry)
\`\`\`

### Rate Limiting (add to middleware)

Create `src/middleware.ts`:
\`\`\`typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple rate limiting (use Redis in production)
const requestCounts = new Map<string, number>()

export function middleware(request: NextRequest) {
const ip = request.ip || 'unknown'
const count = requestCounts.get(ip) || 0

if (count > 10) { // 10 requests per minute
return new NextResponse('Too many requests', { status: 429 })
}

requestCounts.set(ip, count + 1)
setTimeout(() => requestCounts.delete(ip), 60000)

return NextResponse.next()
}
\`\`\`

## Step 9: Backup Strategy

### Database Backups

- Supabase: Automatic daily backups (Pro plan)
- Manual exports: Weekly via Supabase dashboard

### Storage Backups

- Enable versioning in Supabase storage
- Periodic exports to Azure Blob Storage

## Step 10: CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
\`\`\`yaml
name: Deploy to Production

on:
push:
branches: [main]

jobs:
deploy:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v3 - uses: actions/setup-node@v3
with:
node-version: '18' - run: npm ci - run: npm run build - run: npm test # if you have tests
\`\`\`

## Troubleshooting

### Build Fails

- Check environment variables are set
- Verify all dependencies in package.json
- Check Next.js version compatibility

### Runtime Errors

- Check Vercel logs
- Verify API keys are correct
- Test Azure services separately

### Database Issues

- Verify Supabase project is active
- Check RLS policies
- Review connection strings

### High Costs

- Set Azure budget alerts
- Monitor OpenAI token usage
- Optimize prompts
- Add caching

## Post-Deployment

### Day 1

- Monitor error rates
- Check all features working
- Test from different devices

### Week 1

- Analyze user feedback
- Review AI accuracy
- Optimize performance
- Adjust rate limits

### Month 1

- Cost analysis
- Feature usage stats
- Performance review
- Plan next iteration

## Rollback Procedure

If issues occur:

1. In Vercel dashboard:

   - Go to Deployments
   - Find last working deployment
   - Click "Promote to Production"

2. Or via CLI:
   \`\`\`bash
   vercel --prod

# Select previous deployment

\`\`\`

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Azure Support**: Azure Portal → Support

## Production URLs

Document your production URLs:

- **Application**: https://your-app.vercel.app
- **Supabase**: https://your-project.supabase.co
- **Azure Portal**: https://portal.azure.com

## Maintenance Schedule

- **Daily**: Monitor error logs
- **Weekly**: Review costs and usage
- **Monthly**: Security updates
- **Quarterly**: Feature reviews
