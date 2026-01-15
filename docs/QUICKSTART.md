# AI Grievance Platform - Quick Start

This guide will get you running in 5 minutes!

## Quick Setup (Local Development)

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Services

You need three services:

**Option A: Use Test/Mock Mode (Coming Soon)**

- Skip Azure setup for now
- Use mock AI responses
- Set `USE_MOCK_AI=true` in .env

**Option B: Full Setup (Recommended)**

Create `.env` file:
\`\`\`bash
cp .env.example .env
\`\`\`

Get your keys:

1. **Azure OpenAI**: https://portal.azure.com → Create AI resource
2. **Azure Speech**: https://portal.azure.com → Create Speech resource
3. **Supabase**: https://supabase.com → New project

### 3. Setup Database

Run in Supabase SQL Editor:

1. Copy `supabase/migrations/001_create_complaints_table.sql`
2. Execute in Supabase SQL Editor
3. Create storage buckets: `image-complaints`, `voice-complaints`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000

## Project Features

✅ **Citizen Portal** (/)

- Submit complaints via text, voice, or images
- Auto-detect location
- AI processes and categorizes

✅ **Officer Dashboard** (/dashboard)

- View all complaints
- Filter by status/priority
- Update complaint status

## File Structure Overview

\`\`\`
src/
├── app/
│ ├── actions/ # Server actions (API logic)
│ ├── page.tsx # Home page (citizen submission)
│ └── dashboard/ # Officer dashboard
├── components/
│ ├── complaint/ # Complaint form
│ └── dashboard/ # Dashboard UI
├── lib/
│ ├── ai/ # AI processing pipeline
│ │ ├── orchestrator.ts # Main AI coordinator
│ │ ├── validation.ts # Validate complaints
│ │ ├── understanding.ts # Extract issues
│ │ ├── classification.ts # Department routing
│ │ ├── scoring.ts # Priority scoring
│ │ └── summarization.ts # Citizen summaries
│ ├── azure/ # Azure service clients
│ └── supabase/ # Database client
└── types/ # TypeScript definitions
\`\`\`

## Key Concepts

### AI Processing Pipeline

1. **Normalize**: Convert voice/images to text
2. **Validate**: Is this a civic issue?
3. **Understand**: Extract core problem
4. **Classify**: Route to department
5. **Score**: Determine priority
6. **Summarize**: Create citizen-friendly summary

### Citizen-First Design

- Accept ANY input type (text/voice/image)
- AI fills in missing information
- Clear feedback at every step
- No technical jargon
- Edit AI-generated summaries

## Testing

### Test Citizen Flow

1. Go to http://localhost:3000
2. Write: "Big pothole near City Hospital"
3. Click location button
4. Submit
5. See AI-generated summary

### Test Officer Flow

1. Go to http://localhost:3000/dashboard
2. See all complaints
3. Click "Start Working"
4. Mark as "Resolved"

## Common Issues

**Voice not recording**

- Allow microphone permission
- Use HTTPS or localhost

**Images not uploading**

- Check Supabase storage buckets exist
- Verify buckets are public

**AI not working**

- Verify Azure keys in .env
- Check Azure OpenAI deployment is active

**Database errors**

- Run migrations in Supabase
- Check connection strings

## What's Next?

1. Test with real data
2. Customize departments for your region
3. Add authentication (Supabase Auth)
4. Deploy to Vercel
5. Add analytics

## Architecture

\`\`\`
Citizen Input → Normalization → AI Pipeline → Database → Officer Dashboard
↓
Validation
Understanding  
 Classification
Scoring
Summarization
\`\`\`

## MVP Scope

✅ Included:

- Multi-modal input
- AI processing
- Officer dashboard
- Basic status tracking

❌ Not Included (Future):

- Authentication
- Chatbot conversations
- Multi-department workflows
- Historical analytics
- Mobile app

## Need Help?

Read SETUP.md for detailed instructions!
