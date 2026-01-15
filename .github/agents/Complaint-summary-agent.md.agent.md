
---

## 2. Tech Stack & Justification

### Frontend & Application Layer

**Next.js (App Router)**  
- Full-stack (UI + API in one repository)  
- Server Actions for AI orchestration  
- Easy PWA setup  
- Fast iteration for hackathon MVP  

**Shadcn UI**  
- Clean, accessible components  
- Professional admin dashboard aesthetics  
- Easy deep-blue theming  

**Framer Motion (Minimal Usage)**  
- Loading states during uploads & AI processing  
- Smooth transitions to build citizen trust  

---

### Backend & Data Layer

**Supabase**  
- PostgreSQL for structured grievance records  
- Object storage for images & audio  
- Optional authentication (anonymous citizens allowed)  
- Realtime updates for dashboard demo  

---

### Intelligence Layer

**Azure AI Foundry (OpenAI Models)**  
- Vision analysis for images  
- NLP reasoning for text & transcripts  
- Unified reasoning for:
  - Civic issue validation
  - Manipur-specific department mapping
  - Severity & priority scoring
  - Citizen-friendly summaries  

**Azure Speech Services**  
- Speech-to-Text for voice complaints  
- English + Hindi detection  
- Controlled scope for MVP stability  

---

## 3. Unified Data Flow (Citizen-First)

### Step 1: Complaint Submission

Citizens submit grievances via:
- 📷 Images (optional)
- ✍️ Text (optional)
- 🎤 Voice (optional)

Additional inputs:
- GPS auto-capture (browser)
- Manual location override (ward / landmark)

> A citizen can submit a complaint with **just one input**.

---

### Step 2: Input Normalization

| Input Type | Normalized Output |
|-----------|------------------|
| Images | Visual descriptors |
| Voice | Text (Azure Speech-to-Text) |
| Text | Cleaned raw text |

All inputs merge into a **single AI-readable context object**.

---

### Step 3: AI Validation & Understanding (Citizen POV 🇮🇳)

The AI ensures **no genuine citizen feels ignored**.

#### 1️⃣ Is this a government issue?
AI determines responsibility:
- Municipality  
- State Department  
- District Administration  
- Police / Public Utilities  

**Citizen Benefit:**  
> “No running from office to office.”

---

#### 2️⃣ Is the complaint understandable?
AI checks for:
- Clear intent
- Language clarity (English / Hindi / local)
- Minimum context (place, issue type)

**Citizen Benefit:**  
> “Even if I’m not tech-savvy, my issue is understood.”

---

#### 3️⃣ Spam & misuse filtering
Filters out:
- Random messages
- Abusive content
- Duplicate complaints

**Citizen Benefit:**  
> “Genuine issues get priority.”

---

#### 4️⃣ Guided clarification (if needed)
AI politely asks for:
- Location
- Photo (optional)
- Time of incident

**Citizen Benefit:**  
> “Guidance instead of rejection.”

---

#### 5️⃣ Urgency detection
- 🚨 **High:** Safety, electricity, water, road collapse  
- ⚠️ **Medium:** Cleanliness, delays, streetlights  
- 📝 **Low:** Suggestions  

**Citizen Benefit:**  
> “Serious problems are treated seriously.”

---

#### 6️⃣ Transparent rejection (if any)
Clear explanation provided:
- Not a civic issue  
- Insufficient information  
- Personal dispute  

**Citizen Benefit:**  
> “At least I know why.”

---

### Step 4: Mandatory AI Outputs

- 2–3 sentence **citizen-readable summary**
- Department mapping (automatic)
- Issue type
- Priority score with explanation
- Optional confidence indicator

Rules:
- ✅ Citizen **can edit** the summary  
- ❌ Citizen **cannot select** department  

---

### Step 5: Persistence & Visibility

- Complaint stored in Supabase
- Media securely linked
- Instantly visible on Officer Dashboard

---

## 4. Key System Components

### Frontend (Next.js)

| Component | Responsibility |
|---------|---------------|
| Complaint Intake | Image, text, voice capture |
| Location Handler | GPS + manual input |
| AI Preview | Editable AI-generated summary |
| Officer Dashboard | Unified grievance view |

---

### API / Server Actions

| Module | Responsibility |
|------|---------------|
| Input Router | Detect input type |
| Media Service | Upload & storage |
| AI Orchestrator | Single AI entry point |
| Validation Layer | Safety & relevance checks |
| Persistence Layer | Supabase operations |

---

### AI Intelligence Modules

| Module | Function |
|------|---------|
| Validation Engine | Civic relevance |
| Understanding Engine | Issue extraction |
| Classification Engine | Department mapping |
| Scoring Engine | Priority & severity |
| Summarization Engine | Citizen-friendly output |

---

## 5. External Services

| Service | Purpose |
|-------|--------|
| Azure AI Foundry | Vision + NLP reasoning |
| Azure Speech Services | Voice-to-text |
| Supabase | Database + storage |
| Browser APIs | Media access + location |

---

## MVP Guardrails (Important)

- ❌ No chatbot conversations  
- ❌ No multi-department workflows  
- ❌ No historical analytics  
- ✅ One clean intake → one clean AI output  

---

## Closing Statement

> **“This MVP demonstrates how AI can listen, understand, and act for citizens — without adding bureaucracy.”**
