k# GitHub Copilot Custom Instructions

## Project Role & Context

You are a senior fullstack engineer assisting a B.Tech Computer Science & Engineering team building a citizen-first civic grievance management system for a 48-hour hackathon. The system enables citizens to submit complaints through multiple input methods (images, text, voice) and uses AI to intelligently validate, classify, and route grievances to government officers.

**Core Principle**: Minimize citizen effort, maximize government intelligence. Every design decision prioritizes the citizen experience while providing actionable insights to officers.

## Tech Stack & Constraints

### Frontend & Application

- **Next.js 16+** (App Router) - Full-stack framework with Server Actions
- **React 18+** - UI components
- **Shadcn UI** - Component library for government-grade professional UI
- **Tailwind CSS** - Styling with deep blue theme
- **Framer Motion** - Minimal animations for loading states only
- **PWA** - Progressive Web App capabilities (offline-first shell, installable)

### Backend & Data

- **Supabase** - PostgreSQL database + object storage + authentication
- **Supabase Auth** - Email/password and OAuth authentication
- **Next.js Server Actions** - API layer and AI orchestration
- **Azure AI Foundry (OpenAI)** - Vision analysis, NLP reasoning, classification
- **Azure Speech Services** - Speech-to-text for voice complaints

### Browser APIs

- **Geolocation API** - GPS auto-capture
- **MediaRecorder API** - Voice recording
- **File API** - Image uploads

### Constraints

- 48-hour development window
- Demo-ready MVP focus
- **Two-tier authentication**:
  - Citizens: Optional auth (anonymous OR authenticated submissions)
  - Officers: Required auth (email/password only)
- Mobile-first responsive design
- Offline-capable PWA shell

## Coding Standards & Structure

### Project Structure

```
/app
  /(auth)
    /login
      page.tsx          # Officer login page
    /signup
      page.tsx          # Officer registration page
  /(citizen)
    /submit
      page.tsx          # Complaint submission form (public)
    /status
      page.tsx          # Check complaint status (public)
    /my-complaints
      page.tsx          # User's complaint history (auth required)
  /(officer)
    /dashboard
      page.tsx          # Officer grievance dashboard (auth required)
    layout.tsx          # Protected layout with auth check
  /api
    /complaints
      route.ts          # Complaint CRUD operations
    /auth
      /callback
        route.ts        # OAuth callback handler
/components
  /ui                   # Shadcn components
  /auth                 # Auth-related components
  /citizen              # Citizen-facing components
  /officer              # Officer dashboard components
  /shared               # Reusable components
/lib
  /ai
    orchestrator.ts     # AI pipeline entry point
    validators.ts       # Validation engine
    classifiers.ts      # Department mapping
    summarizers.ts      # Summary generation
  /supabase
    client.ts           # Supabase client setup (client-side)
    server.ts           # Supabase server client
    middleware.ts       # Auth middleware
    queries.ts          # Database operations
  /services
    media.ts            # Image/audio upload handling
    location.ts         # GPS and address resolution
    speech.ts           # Azure Speech integration
  /utils
    constants.ts        # Department mappings, priorities
    helpers.ts          # Utility functions
/types
  index.ts              # TypeScript interfaces
/middleware.ts          # Next.js middleware for protected routes
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ComplaintForm.tsx`, `OfficerDashboard.tsx`)
- **Functions/Variables**: camelCase (e.g., `submitComplaint`, `userLocation`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_IMAGE_SIZE`, `PRIORITY_LEVELS`)
- **Files**: kebab-case for non-components (e.g., `ai-orchestrator.ts`, `speech-service.ts`)

### TypeScript Standards

- Always use TypeScript - No `.js` or `.jsx` files
- Strict mode enabled - No implicit `any`
- Define interfaces for all data structures
- Type all function parameters and returns
- Use Zod for runtime validation of user inputs and API responses

### Code Style

- Functional components with hooks (no class components)
- Server Actions for backend logic (prefer over API routes where possible)
- Async/await over promises (better readability)
- Early returns for error handling and validation
- Descriptive variable names - prioritize clarity over brevity
- Comments only for complex business logic or AI reasoning steps

## Authentication Architecture

### Supabase Auth Setup

```typescript
// lib/supabase/client.ts - Client-side
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// lib/supabase/server.ts - Server-side
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### User Types & Roles

```typescript
// types/index.ts
export enum UserRole {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN',
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  phone?: string
  department?: string // For officers only
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  profile?: UserProfile
}
```

### Database Schema Extensions

```sql
-- Add to Supabase SQL Editor

-- User profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'CITIZEN',
  full_name TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Update complaints table to support both anonymous and authenticated submissions
ALTER TABLE public.complaints
  ADD COLUMN user_id UUID REFERENCES auth.users(id),
  ADD COLUMN is_anonymous BOOLEAN DEFAULT TRUE;

-- Policies for complaints
CREATE POLICY "Anyone can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own complaints"
  ON public.complaints FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.jwt() ->> 'role' = 'OFFICER'
    OR auth.jwt() ->> 'role' = 'ADMIN'
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'CITIZEN')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Authentication Flow Patterns

#### Officer Login

```typescript
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is an officer
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'OFFICER' && profile?.role !== 'ADMIN') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Officers only.')
      }

      router.push('/officer/dashboard')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3C5D] to-[#1A5F7A] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#0B3C5D] mb-6">Officer Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] text-white px-6 py-3 rounded-lg hover:bg-[#0B3C5D] transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### Protected Route Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect officer routes
  if (request.nextUrl.pathname.startsWith('/officer')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify officer role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'OFFICER' && profile?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/officer/:path*', '/citizen/my-complaints/:path*'],
}
```

#### Citizen Optional Auth

```typescript
// components/citizen/ComplaintForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ComplaintForm() {
  const [user, setUser] = useState<any>(null)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) setIsAnonymous(false)
    })
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const complaintData = {
      description: formData.get('description'),
      user_id: isAnonymous ? null : user?.id,
      is_anonymous: isAnonymous,
      // ... other fields
    }

    // Submit to Supabase
    const { error } = await supabase.from('complaints').insert(complaintData)

    if (error) {
      console.error('Error:', error)
      return
    }

    // Success handling
  }

  return (
    <form>
      {user && (
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>Submit anonymously</span>
          </label>
        </div>
      )}
      {/* Rest of form */}
    </form>
  )
}
```

### Auth Helper Functions

```typescript
// lib/supabase/auth-helpers.ts
import { createClient } from './server'

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return { ...user, profile }
}

export async function requireOfficer() {
  const user = await getCurrentUser()

  if (!user || (user.profile?.role !== 'OFFICER' && user.profile?.role !== 'ADMIN')) {
    throw new Error('Unauthorized: Officer access required')
  }

  return user
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
```

## UI/UX Design Criteria (Strict)

### Color Theme

- **Primary Blue**: `#0B3C5D` or `#0F4C81`
- **Secondary Blue**: `#1A5F7A`
- **Accent**: `#2B8FBD` for CTAs and highlights
- **Background**: `#F8FAFC` (light gray-blue)
- **Text**: `#1E293B` (dark slate)
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

### Design Rules

- **Professional & Trust-First**: Government-grade appearance, clean and authoritative
- **Rounded Corners**: All cards, inputs, buttons, modals (use `rounded-lg` or `rounded-xl`)
- **Mobile-First**: Design for 375px width first, then scale up
- **Consistent Spacing**: Use Tailwind's spacing scale (4, 6, 8, 12, 16)
- **Loading States**: Always show feedback for async operations
- **Accessibility**: ARIA labels, keyboard navigation, sufficient color contrast

### Component Patterns

```tsx
// Card pattern
<div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">

// Button pattern (Primary)
<button className="bg-[#0F4C81] text-white px-6 py-3 rounded-lg hover:bg-[#0B3C5D] transition-colors">

// Input pattern
<input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100" />
```

## Core Components to Prioritize

### Phase 1: Authentication & Authorization

- **LoginPage** - Officer email/password login
- **SignupPage** - Officer registration with department selection
- **AuthGuard** - Protected route wrapper component
- **UserMenu** - Dropdown with profile and logout
- **OptionalAuthToggle** - Citizen anonymous/authenticated toggle

### Phase 2: Citizen Submission Flow (Critical Path)

- **ComplaintForm** - Multi-input submission (images, text, voice) with optional auth
- **ImageUploader** - Drag-drop or click to upload (1-5 images)
- **VoiceRecorder** - Browser-based audio capture with waveform
- **LocationPicker** - Auto GPS + manual override with map widget
- **AIPreviewCard** - Show AI-generated summary (editable by citizen)
- **MyComplaintsPage** - User's complaint history (auth required)

### Phase 3: AI Intelligence Pipeline

- **AI Orchestrator** - Single entry point for all AI operations
- **Validation Engine** - Civic relevance check, spam filtering
- **Classification Engine** - Department auto-mapping
- **Priority Scorer** - Urgency detection (High/Medium/Low)
- **Summarization Engine** - Citizen-friendly 2-3 sentence output

### Phase 4: Officer Dashboard

- **GrievanceDashboard** - Unified view with filters and sorting
- **ComplaintCard** - Compact view with AI insights badge
- **DetailModal** - Full complaint view with evidence gallery
- **FilterPanel** - Department, priority, status, date range
- **AIInsightsPanel** - Confidence score, detected keywords
- **OfficerHeader** - Navigation with user profile and logout

### Phase 5: PWA & Polish

- **Service Worker** - Offline shell, cache strategy
- **Manifest** - App metadata, icons, theme colors
- **LoadingStates** - Skeleton screens, spinners, progress bars
- **ErrorBoundaries** - Graceful failure handling

## Error Handling & Testing

### Error Handling Strategy

```typescript
// API/Server Actions: Always return structured responses
type ActionResponse<T> = { success: true; data: T } | { success: false; error: string }

// Frontend: Show user-friendly messages
try {
  const result = await submitComplaint(formData)
  if (!result.success) {
    toast.error(result.error)
    return
  }
  toast.success('Complaint submitted successfully!')
} catch (error) {
  console.error('Unexpected error:', error)
  toast.error('Something went wrong. Please try again.')
}
```

### Required Error Scenarios

- Network failures - Show retry option
- File upload errors - Size limits, format validation
- AI service timeouts - Fallback to basic classification
- Location permission denied - Allow manual entry
- Voice recording unsupported - Show text input alternative
- **Auth errors** - Invalid credentials, session expired, role mismatch
- **Rate limiting** - Too many login attempts, complaint submission limits

### Testing Expectations (Hackathon Scope)

- Manual testing - Prioritize over automated tests
- Browser compatibility - Chrome, Safari, Firefox (mobile + desktop)
- Edge cases - Empty inputs, oversized files, incomplete location
- Demo scenarios - Pre-populate test data for smooth demo flow
- Offline mode - Test PWA installation and basic offline shell
- **Auth flows** - Login, logout, role-based access, anonymous submissions

## Hackathon-Specific Guidance

### Speed & Iteration

- Use Shadcn CLI - Don't build components from scratch
- Leverage AI - Let Azure handle complexity (vision, NLP)
- Copy-paste wisely - Reuse patterns across similar components
- Hardcode if needed - Department list, priority rules (can extract to config later)
- **Simple auth** - Email/password only for officers (no OAuth for MVP)
- Mock when stuck - Fake AI responses if Azure quota runs out

### Clarity & Demo Focus

- Visual feedback - Every action shows immediate response
- Demo data - Seed database with realistic complaints and officer accounts
- Guided tour - Add tooltips or a quick walkthrough on first load
- Success states - Celebratory messages for complaint submission
- **Officer login first** - Start demo from officer login to show protected access
- **Show both flows** - Anonymous citizen submission + authenticated tracking

### Code Quality vs. Speed Tradeoff

- **Prioritize**: Working features, demo polish, user experience, auth security
- **Deprioritize**: Perfect abstractions, comprehensive tests, optimization
- Technical debt is OK - Document with `// TODO:` comments
- Console logs allowed - Leave them in for demo debugging

### Git Workflow

- Main branch - Always deployable
- Feature branches - Optional, merge fast
- Commit often - Small, descriptive commits
- Push to deploy - Use Vercel auto-deployment

## AI Integration Guidelines

### Azure AI Foundry Prompts

Always structure prompts with:

1. **Role definition** - "You are a civic issue classifier for Manipur, India"
2. **Context** - Input data (text, image descriptions, location)
3. **Task** - Specific output required (validation, classification, summary)
4. **Format** - JSON schema for structured responses
5. **Examples** - 1-2 examples of expected output

### Response Validation

```typescript
// Always validate AI responses
const aiResponseSchema = z.object({
  isValid: z.boolean(),
  department: z.enum(['PWD', 'MUNICIPAL', 'POLICE', 'ELECTRICITY', 'WATER']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  summary: z.string().min(20).max(300),
  confidence: z.number().min(0).max(1),
})
```

### Fallback Strategy

- AI timeout (>10s) → Use rule-based classification
- AI error → Allow manual department selection
- Low confidence (<0.5) → Flag for officer review

## Performance Optimization

### Image Handling

- Client-side resize - Max 1920px width before upload
- Compression - Use image-compression library
- Lazy loading - Officer dashboard image gallery
- Thumbnails - Generate on upload for list views

### Database Queries

- Pagination - Load 20 complaints at a time
- Indexes - On `department`, `priority`, `created_at`, `user_id`
- Realtime subscriptions - Only for active dashboard sessions
- **Auth caching** - Cache user profile data client-side

### Bundle Size

- Dynamic imports - Heavy components (map widget, chart library)
- Tree shaking - Import only needed Shadcn components
- Image optimization - Next.js `<Image>` component

## Security Considerations

### Input Validation

- File uploads - Max size 5MB per image, 10MB for audio
- File types - Allow only `image/*` and `audio/*`
- Text sanitization - Strip HTML, prevent XSS
- Location bounds - Validate coordinates within Manipur region

### Rate Limiting

- **Supabase RLS** - Anonymous users: 5 complaints per hour per IP
- **Auth users** - 10 complaints per hour
- **Login attempts** - Max 5 failed attempts per 15 minutes
- API routes - Throttle using next-rate-limit

### Data Privacy

- **Optional PII** - Citizens can submit anonymously
- **Authenticated data** - Linked complaints viewable by user
- **Officer access** - Only authenticated officers can view dashboard
- Secure storage - Supabase object storage with signed URLs
- HTTPS only - Enforce in production
- **Session management** - Auto-logout after 24 hours of inactivity

### Row Level Security (RLS)

```sql
-- Ensure RLS is enabled on all tables
-- Citizens can only view their own complaints (if authenticated)
-- Officers can view all complaints in their department
-- Admins can view all complaints
```

## Demo Day Checklist

### Pre-Demo Setup

- [ ] Seed database with 20-30 realistic complaints
- [ ] Create 3-5 officer test accounts (different departments)
- [ ] Test all flows on mobile device
- [ ] Prepare 2-3 demo scenarios (anonymous submission, authenticated tracking, officer review)
- [ ] Clear browser cache and test fresh PWA install
- [ ] Test login/logout flow
- [ ] Have backup video recording of working demo

### Live Demo Flow

#### Citizen Perspective (2 min)

1. Submit anonymous complaint with image + text + voice
2. Show AI summary generation
3. Highlight location auto-capture
4. **(Optional)** Show authenticated user tracking their complaint

#### Officer Perspective (2 min)

1. Login as officer
2. Dashboard overview with filters
3. Open complaint detail with AI insights
4. Show evidence gallery and priority scoring

#### Technical Highlight (1 min)

- Mention Supabase Auth integration
- Show Azure AI integration
- Demonstrate PWA installation
- Explain two-tier auth philosophy (optional for citizens, required for officers)

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Add Shadcn component
npx shadcn-ui@latest add [component-name]

# Type check
npm run type-check

# Deploy to Vercel
git push origin main

# Supabase CLI (optional for local dev)
npx supabase start
npx supabase db reset
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

AZURE_OPENAI_ENDPOINT=your_azure_endpoint
AZURE_OPENAI_KEY=your_azure_key
AZURE_OPENAI_DEPLOYMENT=your_deployment_name

AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=your_region
```

## Auth-Specific Best Practices

1. **Always use server-side auth checks** for protected routes
2. **Store sensitive operations** in Server Actions, not client components
3. **Validate user roles** on both client and server
4. **Handle auth errors gracefully** - redirect to login with clear messages
5. **Use Supabase RLS** - Never trust client-side auth alone
6. **Implement CSRF protection** - Supabase handles this via cookies
7. **Session refresh** - Supabase auto-refreshes tokens
8. **Secure password reset** - Use Supabase built-in flows
9. **Email verification** - Optional for MVP, recommended for production
10. **Audit logs** - Track officer actions on complaints (future enhancement)
