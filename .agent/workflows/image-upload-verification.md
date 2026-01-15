---
description: User image upload and AI-powered complaint verification workflow
---

# Image Upload and Verification Workflow

This workflow describes the complete process for uploading and verifying civic complaint images with AI analysis.

## Step 1: Initial Image Selection
User selects/uploads an image through the UI.

**Requirements:**
- File input component with image preview
- Supported formats: JPEG, PNG, WebP
- Client-side file size validation (max 10MB)
- Immediate visual feedback on selection

## Step 2: Edge-Based Initial Validation
Before upload, perform client-side analysis to determine if the image is related to a public civic issue.

**Implementation:**
- Use browser-based vision API or lightweight ML model (TensorFlow.js)
- Check for common civic issues: potholes, garbage, broken infrastructure, etc.
- Display loading animation during analysis (0.5-2 seconds)

**Validation Result:**
- **Valid**: Show success message "Valid civic complaint image detected" + proceed animation
- **Invalid**: Show error message "This image does not appear to be related to a civic issue. Please try another image."

## Step 3: Upload to Azure OpenAI Vision Service
If validation passes, upload the image to Azure OpenAI for detailed analysis.

**Animation:**
- Show uploading progress bar (0-100%)
- Display animated spinner with message "Analyzing your complaint..."
- Pulse effect on image thumbnail

**API Call:**
```typescript
// POST to Azure OpenAI Vision API
const response = await analyzeComplaintImage(imageFile);
```

**Expected Response:**
```json
{
  "type_of_complaint": "Infrastructure Damage",
  "brief_description": "Large pothole on main road causing traffic disruption",
  "govt_dept_of_concern": "Public Works Department",
  "severity": "High",
  "confidence_score": 0.92,
  "suggested_priority": "Urgent",
  "estimated_resolution_time": "3-5 days",
  "keywords": ["pothole", "road damage", "infrastructure"],
  "detected_objects": ["road", "crack", "vehicle"]
}
```

## Step 4: Interactive Location Selection (Parallel Process)
While image analysis is in progress, allow user to add location data.

**UI Components:**
- Interactive map widget (Google Maps/Mapbox/Azure Maps)
- Default: Small widget (400x300px) in bottom corner
- Expandable: Click to enlarge to full modal (800x600px or fullscreen)
- Features:
  - GPS auto-detection button
  - Search address bar
  - Pin drag-and-drop
  - Zoom controls
  - Current location indicator

**Data Captured:**
```typescript
{
  latitude: number,
  longitude: number,
  address: string,
  landmark: string (optional),
  pinned_manually: boolean
}
```

**Animation:**
- Fade-in map widget after 2 seconds of analysis
- Pulse animation on GPS button
- Smooth expand/collapse transitions (300ms ease-in-out)

## Step 5: AI Analysis Results Display
Present the AI-analyzed data in an editable form.

**UI Layout:**
- Title: "AI Analysis Results - Please Review & Edit"
- Form fields with pre-filled AI data:
  1. **Complaint Type** (dropdown - editable)
  2. **Description** (textarea - editable, character count)
  3. **Department** (dropdown - editable)
  4. **Severity** (radio buttons: Low/Medium/High/Critical - editable)
  5. **Priority** (auto-calculated, can override)
  6. **Additional Notes** (optional textarea)

**Animation:**
- Slide-in from right when results ready
- Each field appears with stagger animation (100ms delay between)
- Highlight editable fields on hover
- Success checkmark animation on field validation

**User Actions:**
- Click any field to edit
- Show visual indicator for edited vs AI-generated fields
- Real-time character count for description
- Save draft button (auto-save every 30 seconds)

## Step 6: Preview Window
Show a comprehensive preview of the complaint before submission.

**Preview Components:**
1. **Image Preview** (with zoom capability)
2. **Location Map** (embedded, non-editable, showing pin)
3. **Complaint Details Card:**
   - Type
   - Description
   - Department
   - Severity badge
   - Date & Time (auto-generated)
4. **Action Buttons:**
   - Edit (go back to Step 5)
   - Cancel (confirm dialog)
   - Submit Complaint (primary CTA)

**Animation:**
- Fade-out edit form, fade-in preview (400ms)
- Preview cards animate in with scale effect
- Severity badge pulses if "Critical" or "High"
- Submit button hover: scale + color shift

## Step 7: Submission & Completion Screen
Process the complaint and show success confirmation.

**Submission Process:**
1. Show loading overlay with message "Submitting your complaint..."
2. Upload image to Azure Blob Storage
3. Save complaint data to database
4. Generate 8-character alphanumeric reference ID
5. Send confirmation (optional: email/SMS)

**Reference ID Generation:**
```typescript
// Format: 2 letters (dept code) + 6 alphanumeric
// Example: PW7K2M9X, TR3N8Q5L
const generateReferenceId = () => {
  const deptCode = getDepartmentCode(complaint.dept);
  const randomPart = generateAlphanumeric(6);
  return `${deptCode}${randomPart}`;
};
```

**Completion Screen:**
- Large success checkmark animation (Lottie/SVG)
- Display reference ID prominently (large, copyable)
- Summary of complaint
- Estimated resolution timeline
- Action buttons:
  1. **Download Complaint Report** (PDF with QR code)
  2. **Track Complaint** (redirect to tracking page)
  3. **Submit Another Complaint** (reset form)
  4. **Share** (social media share options)

**Animation:**
- Success checkmark draws in (1 second)
- Reference ID fades in with scale effect
- Confetti animation (subtle)
- Buttons slide up from bottom (stagger)

## Technical Implementation Notes

### State Management
```typescript
interface ComplaintWorkflowState {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  image: File | null;
  imageUrl: string | null;
  isValid: boolean | null;
  aiAnalysis: AIAnalysisResult | null;
  location: LocationData | null;
  editedData: ComplaintData | null;
  referenceId: string | null;
  isLoading: boolean;
  error: string | null;
}
```

### Animation Libraries
- **Framer Motion**: Page transitions, component animations
- **Lottie**: Success/loading animations
- **CSS transitions**: Micro-interactions

### Error Handling
- Network errors: Show retry button with exponential backoff
- API failures: Fallback to manual form entry
- Invalid image: Clear error message + suggested actions
- Timeout: After 30 seconds, offer manual entry option

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes
- High contrast mode support
- Focus indicators on all form fields

### Performance Optimization
- Lazy load map widget
- Image compression before upload
- Debounce auto-save
- Optimize animation frame rates
- Cache API responses (with expiration)

## Testing Checklist

- [ ] Image validation works with various image types
- [ ] AI analysis returns properly formatted JSON
- [ ] Map widget expands/collapses smoothly
- [ ] GPS location detection works
- [ ] All fields are editable
- [ ] Preview shows correct data
- [ ] Reference ID is unique and properly formatted
- [ ] PDF download generates correctly
- [ ] Animations perform at 60fps
- [ ] Error states display properly
- [ ] Mobile responsive on all screen sizes
- [ ] Works offline (with degraded functionality)

## API Endpoints Required

1. `POST /api/validate-image` - Edge validation
2. `POST /api/analyze-complaint` - Azure OpenAI analysis
3. `POST /api/complaints` - Submit complaint
4. `GET /api/complaints/:referenceId` - Retrieve complaint
5. `POST /api/generate-report` - Generate PDF report

## Files to Create/Modify

### New Components
- `src/components/complaint/ImageUploadZone.tsx`
- `src/components/complaint/ValidationAnimation.tsx`
- `src/components/complaint/AnalysisLoader.tsx`
- `src/components/complaint/InteractiveMapWidget.tsx`
- `src/components/complaint/EditableComplaintForm.tsx`
- `src/components/complaint/ComplaintPreview.tsx`
- `src/components/complaint/CompletionScreen.tsx`

### New Actions
- `src/app/actions/image-validation.actions.ts`
- `src/app/actions/complaint-submission.actions.ts`

### New Utils
- `src/lib/utils/reference-id-generator.ts`
- `src/lib/utils/pdf-generator.ts`
- `src/lib/utils/image-compression.ts`

### Azure Integration
- `src/lib/azure/vision-analysis.ts`
- `src/lib/azure/blob-storage.ts`

### API Routes
- `src/app/api/validate-image/route.ts`
- `src/app/api/analyze-complaint/route.ts`
- `src/app/api/generate-report/route.ts`
