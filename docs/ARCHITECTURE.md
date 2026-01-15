# Architecture Documentation

## System Overview

The AI Grievance Platform is a full-stack Next.js application that processes civic complaints through an AI pipeline for intelligent routing and prioritization.

## Architecture Layers

### 1. Presentation Layer (Frontend)

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn UI + Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Animations**: Framer Motion

### 2. Application Layer (Server Actions)

- **Location**: `src/app/actions/complaint.actions.ts`
- **Responsibilities**:
  - Handle form submissions
  - Coordinate AI processing
  - Manage file uploads
  - Database operations

### 3. Intelligence Layer (AI Services)

- **Location**: `src/lib/ai/`
- **Components**:
  - **Orchestrator**: Main coordinator
  - **Validation**: Civic issue verification
  - **Understanding**: Issue extraction
  - **Classification**: Department mapping
  - **Scoring**: Priority determination
  - **Summarization**: Citizen-friendly output

### 4. Integration Layer (External Services)

- **Azure OpenAI**: Vision + NLP processing
- **Azure Speech**: Voice-to-text transcription
- **Supabase**: Database + file storage

### 5. Data Layer

- **Database**: PostgreSQL (via Supabase)
- **Storage**: Object storage for media files
- **Schema**: See `supabase/migrations/`

## Data Flow

### Complaint Submission Flow

\`\`\`

1. Citizen Input
   ├─ Text description
   ├─ Voice recording (webm)
   ├─ Images (jpg/png)
   └─ Location (GPS/manual)
2. Input Normalization
   ├─ Voice → Azure Speech → Text
   ├─ Images → Azure Vision → Descriptions
   └─ Combine into NormalizedInput
3. AI Processing Pipeline
   ├─ Validation (is civic issue?)
   ├─ Understanding (extract problem)
   ├─ Classification (route to dept)
   ├─ Scoring (determine priority)
   └─ Summarization (citizen summary)
4. Media Upload
   ├─ Voice → Supabase Storage
   └─ Images → Supabase Storage
5. Database Persistence
   └─ Save complaint record
6. Response to Citizen
   └─ Show summary + confirmation
   \`\`\`

### Dashboard View Flow

\`\`\`

1. Load Complaints
   └─ Query Supabase with filters
2. Display Data
   ├─ Group by status
   ├─ Show priority badges
   └─ Render media previews
3. Status Updates
   ├─ Officer action
   ├─ Update database
   └─ Refresh view
   \`\`\`

## Component Architecture

### Frontend Components

\`\`\`
ComplaintForm (src/components/complaint/ComplaintForm.tsx)
├─ TextInput (Textarea)
├─ VoiceRecorder (MediaRecorder API)
├─ ImageUploader (File input)
├─ LocationCapture (Geolocation API)
└─ SubmitButton (with loading state)

OfficerDashboard (src/components/dashboard/OfficerDashboard.tsx)
├─ StatsCards (complaint counts)
├─ FilterTabs (status filters)
└─ ComplaintCard[] (individual complaints)
├─ ComplaintDetails
├─ MediaGallery
└─ StatusActions
\`\`\`

### AI Pipeline Modules

\`\`\`
processComplaint() [orchestrator.ts]
├─ validateComplaint() [validation.ts]
│ └─ generateStructuredCompletion()
├─ understandComplaint() [understanding.ts]
│ └─ generateStructuredCompletion()
├─ classifyComplaint() [classification.ts]
│ └─ generateStructuredCompletion()
├─ scoreComplaint() [scoring.ts]
│ └─ generateStructuredCompletion()
└─ summarizeComplaint() [summarization.ts]
└─ generateCompletion()
\`\`\`

## Database Schema

### Complaints Table

| Column                  | Type      | Description                           |
| ----------------------- | --------- | ------------------------------------- |
| id                      | UUID      | Primary key                           |
| created_at              | TIMESTAMP | Creation time                         |
| updated_at              | TIMESTAMP | Last update                           |
| citizen_text            | TEXT      | Original text input                   |
| citizen_voice_url       | TEXT      | Voice file URL                        |
| citizen_image_urls      | TEXT[]    | Image URLs array                      |
| location_lat            | DOUBLE    | GPS latitude                          |
| location_lng            | DOUBLE    | GPS longitude                         |
| location_manual         | TEXT      | Manual location                       |
| location_ward           | TEXT      | Ward information                      |
| ai_summary              | TEXT      | AI-generated summary                  |
| ai_department           | TEXT      | Assigned department                   |
| ai_issue_type           | TEXT      | Issue classification                  |
| ai_priority             | ENUM      | high/medium/low                       |
| ai_priority_explanation | TEXT      | Priority reason                       |
| ai_confidence           | DOUBLE    | AI confidence (0-1)                   |
| status                  | ENUM      | pending/in_progress/resolved/rejected |
| rejection_reason        | TEXT      | If rejected, why                      |
| is_valid                | BOOLEAN   | Validation result                     |
| validation_message      | TEXT      | Validation feedback                   |

### Indexes

- status (for filtering)
- department (for routing)
- priority (for sorting)
- created_at (for chronological order)
- location_ward (for geographical analysis)

## Security Architecture

### Current (MVP) Security

- Public access (no authentication)
- Server-side validation
- File type restrictions
- Size limits on uploads

### Production Security Requirements

1. **Authentication**: Supabase Auth
2. **Authorization**: Row-level security (RLS)
3. **Rate Limiting**: API throttling
4. **Input Validation**: Sanitize all inputs
5. **File Security**: Virus scanning
6. **CORS**: Restrict origins
7. **HTTPS Only**: SSL/TLS
8. **API Keys**: Environment variables only

## Performance Considerations

### Optimization Strategies

1. **Image Compression**: Client-side before upload
2. **Lazy Loading**: Dashboard pagination
3. **Caching**: Static assets
4. **Database Indexes**: Query optimization
5. **CDN**: Media file delivery

### Scalability

- **Horizontal Scaling**: Stateless server actions
- **Database**: Supabase auto-scales
- **Storage**: Unlimited object storage
- **AI Services**: Auto-scaling APIs

## Error Handling

### Client-Side

- User-friendly error messages
- Retry mechanisms
- Graceful degradation

### Server-Side

- Try-catch blocks
- Logging (console.error)
- Fallback responses
- Transaction rollbacks

### AI Pipeline

- Default to valid if AI fails (citizen-first)
- Confidence scores
- Manual review flags

## Deployment Architecture

### Development

\`\`\`
localhost:3000 → Next.js Dev Server
↓
Azure Services (dev keys)
↓
Supabase (dev project)
\`\`\`

### Production

\`\`\`
Domain → Vercel CDN → Next.js App
↓
Azure Services (prod keys)
↓
Supabase (prod project)
\`\`\`

## Monitoring & Observability

### Metrics to Track

- Complaint submission rate
- AI processing time
- Error rates
- Department distribution
- Priority distribution
- Resolution time

### Logging

- Server action execution
- AI pipeline stages
- Error details
- Performance metrics

## Future Architecture Considerations

### Phase 2 Enhancements

1. **Real-time Updates**: WebSocket/Supabase Realtime
2. **Mobile App**: React Native
3. **Analytics Dashboard**: Data visualization
4. **Multi-language**: i18n support
5. **SMS Notifications**: Twilio integration
6. **Chatbot**: Conversational interface

### Microservices Migration (Optional)

\`\`\`
Current: Monolithic Next.js App

Future:
├─ Frontend Service (Next.js)
├─ AI Service (FastAPI/Python)
├─ Media Service (dedicated storage)
└─ Analytics Service (data processing)
\`\`\`

## Technology Decisions

### Why Next.js?

- Full-stack in one codebase
- Server Actions for seamless API
- Great developer experience
- Easy deployment

### Why Supabase?

- PostgreSQL reliability
- Built-in storage
- Real-time capabilities
- Generous free tier

### Why Azure AI?

- GPT-4 Vision for images
- Speech Services for voice
- Government-ready compliance
- Regional availability

### Why Shadcn UI?

- Accessible components
- Customizable
- No runtime overhead
- Professional design

## Cost Estimation (Monthly)

### Low Traffic (100 complaints/month)

- Azure OpenAI: ~$10
- Azure Speech: ~$2
- Supabase: Free
- Vercel: Free
  **Total: ~$12/month**

### Medium Traffic (1000 complaints/month)

- Azure OpenAI: ~$100
- Azure Speech: ~$20
- Supabase: $25
- Vercel: Free
  **Total: ~$145/month**

### High Traffic (10,000 complaints/month)

- Azure OpenAI: ~$1,000
- Azure Speech: ~$200
- Supabase: $100
- Vercel: $20
  **Total: ~$1,320/month**

## Maintenance Requirements

### Regular Tasks

- Monitor API costs
- Review AI accuracy
- Update department mappings
- Database backups
- Security updates

### Quarterly Reviews

- AI prompt optimization
- Performance analysis
- User feedback integration
- Feature prioritization
