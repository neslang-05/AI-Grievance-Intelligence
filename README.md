# AI Grievance Platform for Manipur

An AI-powered civic complaint platform that enables citizens to report issues using text, voice, or images, with intelligent routing and prioritization.

## Features

- **Multi-Modal Input**: Submit complaints via text, voice recording, or images
- **AI-Powered Processing**:
  - Automatic validation of civic issues
  - Intelligent department routing
  - Priority scoring
  - Citizen-friendly summaries
- **Location Tracking**: GPS or manual location input
- **Officer Dashboard**: Real-time complaint management
- **Transparent**: Citizens receive clear feedback

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL + Storage)
- **AI Services**:
  - Azure OpenAI (GPT-4 Vision for image analysis & NLP)
  - Azure Speech Services (Speech-to-Text)
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Azure AI Foundry (OpenAI) account
- Azure Speech Services account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd AI-Grievance-Platform
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

Then edit `.env` with your actual credentials:

- Azure OpenAI endpoint, key, and deployment name
- Azure Speech key and region
- Supabase URL and keys

4. Set up Supabase database:

- Create a new Supabase project
- Run the migrations in `supabase/migrations/` folder
- Create storage buckets: `image-complaints` and `voice-complaints`

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
src/
├── app/
│ ├── actions/ # Server actions
│ ├── dashboard/ # Officer dashboard page
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Home page (citizen submission)
│ └── globals.css # Global styles
├── components/
│ ├── complaint/ # Complaint submission components
│ ├── dashboard/ # Dashboard components
│ └── ui/ # Shadcn UI components
├── lib/
│ ├── ai/ # AI processing modules
│ ├── azure/ # Azure service integrations
│ ├── supabase/ # Supabase client
│ └── utils.ts # Utility functions
└── types/ # TypeScript types
\`\`\`

## AI Processing Pipeline

1. **Input Normalization**: Convert voice/images to text
2. **Validation**: Check if it's a genuine civic issue
3. **Understanding**: Extract core issue and context
4. **Classification**: Map to appropriate department
5. **Scoring**: Determine priority (high/medium/low)
6. **Summarization**: Create citizen-friendly summary

## Departments Supported

- Municipal Corporation
- Public Works Department
- Water Resources
- Electricity Department
- Police Department
- Health Department
- Transport Department
- Urban Development
- Forest Department
- District Administration

## Usage

### For Citizens

1. Visit the homepage
2. Submit complaint using:
   - Text description
   - Voice recording (English/Hindi)
   - Images of the issue
3. Add location (GPS or manual)
4. Review AI-generated summary
5. Submit and receive confirmation

### For Officers

1. Visit `/dashboard`
2. View all complaints with filters
3. See AI-assigned department and priority
4. Update complaint status
5. Track resolution progress

## Security Notes

For production deployment:

- Enable Supabase RLS (Row Level Security) with proper policies
- Add authentication (Supabase Auth)
- Restrict API access
- Add rate limiting
- Validate all inputs server-side

## License

This project is created for civic use in Manipur, India.

## Support

For issues and questions, please contact the development team.
