# Setup Guide - AI Grievance Platform

## Step-by-Step Setup Instructions

### 1. Azure Services Setup

#### Azure OpenAI (AI Foundry)

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Azure OpenAI** resource
3. Deploy a **GPT-4 Vision** model
4. Note down:
   - Endpoint URL (e.g., `https://your-resource.openai.azure.com/`)
   - API Key
   - Deployment Name

#### Azure Speech Services

1. In Azure Portal, create a **Speech Service** resource
2. Choose region (recommend: `southeastasia` for Manipur)
3. Note down:
   - Speech Key
   - Region

### 2. Supabase Setup

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for database to initialize

#### Run Database Migrations

- Go to SQL Editor in Supabase Dashboard
- Copy and run `supabase/migrations/001_create_complaints_table.sql`
- Optionally run `supabase/migrations/002_sample_data.sql` for test data

#### Create Storage Buckets

In Supabase Dashboard:

1. Go to Storage
2. Create bucket named `image-complaints` (make public)
3. Create bucket named `voice-complaints` (make public)

#### Get API Keys

- Go to Settings > API
- Copy:
  - Project URL (NEXT_PUBLIC_SUPABASE_URL)
  - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - Service Role Key (SUPABASE_SERVICE_ROLE_KEY) - Keep secret!

### 3. Environment Variables

Create `.env` file in project root:

\`\`\`env

# Azure AI Foundry (OpenAI)

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_actual_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-vision

# Azure Speech Services

AZURE_SPEECH_KEY=your_actual_speech_key
AZURE_SPEECH_REGION=southeastasia

# Supabase

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit: http://localhost:3000

### 6. Test the Application

#### Test Citizen Submission

1. Go to http://localhost:3000
2. Try submitting a complaint with:
   - Text only
   - Voice recording
   - Image upload
   - Or combination of all

#### Test Officer Dashboard

1. Go to http://localhost:3000/dashboard
2. View submitted complaints
3. Change status of complaints
4. Filter by status/priority

### 7. Troubleshooting

#### Voice recording not working

- Ensure HTTPS or localhost
- Grant microphone permissions in browser

#### Image upload fails

- Check Supabase storage buckets are public
- Verify storage policies are set correctly

#### AI processing errors

- Verify Azure OpenAI deployment is active
- Check API keys are correct
- Ensure you have quota/credits in Azure

#### Database errors

- Verify migrations ran successfully
- Check Supabase project is active
- Review RLS policies

### 8. Production Deployment

#### Deploy to Vercel

\`\`\`bash
npm run build

# Deploy to Vercel

\`\`\`

#### Environment Variables for Production

- Add all `.env` variables to Vercel environment settings
- Use production URLs
- Enable proper security measures

#### Security Checklist

- [ ] Enable Supabase RLS with proper policies
- [ ] Add authentication
- [ ] Rate limit API endpoints
- [ ] Validate all file uploads
- [ ] Sanitize user inputs
- [ ] Use HTTPS only
- [ ] Restrict CORS if needed

### 9. Cost Considerations

**Azure OpenAI**: Pay per token usage

- Estimate: ~$0.01 - $0.10 per complaint (depends on images/complexity)

**Azure Speech**: Pay per hour of audio

- Estimate: ~$1 per hour of audio transcribed

**Supabase**: Free tier available

- Free: 500MB database, 1GB file storage
- Paid: Starting at $25/month for more

### 10. MVP Testing Checklist

- [ ] Submit text-only complaint
- [ ] Submit voice-only complaint
- [ ] Submit image-only complaint
- [ ] Submit complaint with all inputs
- [ ] Test GPS location capture
- [ ] Test manual location input
- [ ] View complaint in dashboard
- [ ] Update complaint status
- [ ] Filter complaints by status
- [ ] Verify AI summary is accurate
- [ ] Check department assignment
- [ ] Validate priority scoring

## Need Help?

- Check Azure OpenAI documentation
- Review Supabase guides
- Test with sample data first
- Monitor browser console for errors
- Check server logs for API issues
