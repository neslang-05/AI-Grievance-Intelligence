# GitHub Copilot Custom Instructions - UI Redesign

## Context

You are refactoring a civic grievance management system to implement a **camera-first home page** experience. The goal is to make complaint submission faster and more intuitive by capturing images upfront, then moving users to a simplified submission form.

---

## Core Changes Required

### 1. **New Home Page** (`/app/page.tsx`)

**Purpose**: Camera-first interface for immediate image capture/upload

**Design Requirements**:

- **Dark gradient background**: `from-[#0B3C5D] via-[#1A5F7A] to-[#0F4C81]`
- **Glassmorphism card**: White/transparent with backdrop blur
- **Large camera circle**: Prominent tap target (200px+ diameter)
- **Two upload methods**:
  1. Primary: "Tap to Open Camera" button (opens device camera)
  2. Secondary: "Choose from Gallery" button (file picker)
- **Image preview**: Show captured/selected images with count (0/5 images)
- **Proceed button**: Navigate to `/citizen/submit` after capturing 1-5 images

**Key Features**:

```typescript
// Store images in sessionStorage for the submit page
sessionStorage.setItem('complaint-images-data', JSON.stringify(base64Images))

// Camera API usage
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })

// Gallery upload
<input type="file" accept="image/*" multiple max={5} />
```

**Header**:

- Logo + "CivicEye" branding on left
- "About Us" link on right (navigates to `/about`)
- Sticky, white background with shadow

**Visual Style** (match reference image):

- Central circular camera icon with dashed border
- "Verify Seed Quality" → Replace with "Report Your Complaint"
- "AI-powered analysis to detect fake or damaged seeds" → Replace with "AI-powered analysis to detect and classify civic issues"
- Green theme → Use blue theme from design system
- Upload counter at bottom: "0 / 5 images"

---

### 2. **New About Us Page** (`/app/about/page.tsx`)

**Purpose**: Move existing home page content here

**Content to Include**:

- System overview and mission statement
- How the AI classification works
- Department categories (PWD, Municipal, Police, etc.)
- Benefits for citizens and officers
- Contact information
- FAQ section (optional)

**Design Requirements**:

- Same header as home page
- Professional layout with sections
- Use cards and proper spacing
- Include illustrations or icons
- Call-to-action button: "Report a Complaint" → Links to home page

**Template Structure**:

```tsx
<div className="min-h-screen bg-[#F8FAFC]">
  <Header /> {/* Reuse from home */}
  <main className="max-w-4xl mx-auto px-4 py-12">
    <section className="mb-16">
      <h1>About CivicEye</h1>
      <p>Your existing home page content...</p>
    </section>

    <section className="mb-16">
      <h2>How It Works</h2>
      {/* Process steps */}
    </section>

    <section>
      <h2>Our Mission</h2>
      {/* Mission statement */}
    </section>
  </main>
</div>
```

---

### 3. **Modified Submit Page** (`/app/(citizen)/submit/page.tsx`)

**Purpose**: Simplified form WITHOUT image upload section

**Changes Required**:

1. **REMOVE**: All image upload UI components
2. **REMOVE**: ImageUploader component
3. **REMOVE**: Drag-drop zones, file input elements
4. **ADD**: Image preview gallery (read-only) at top showing images from sessionStorage
5. **KEEP**: Text description input, voice recorder, location picker, AI preview card

**New Flow**:

```typescript
'use client'

import { useEffect, useState } from 'react'

export default function SubmitPage() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    // Load images from sessionStorage (set by home page)
    const storedImages = sessionStorage.getItem('complaint-images-data')
    if (storedImages) {
      setImages(JSON.parse(storedImages))
    } else {
      // Redirect back to home if no images
      router.push('/')
    }
  }, [])

  return (
    <div>
      {/* READ-ONLY Image Gallery */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Uploaded Images</h3>
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <img key={i} src={img} className="rounded-lg w-full h-24 object-cover" />
          ))}
        </div>
      </div>

      {/* Rest of the form (description, voice, location) */}
      <textarea placeholder="Describe the issue..." />
      <VoiceRecorder />
      <LocationPicker />
      <AIPreviewCard />

      <button type="submit">Submit Complaint</button>
    </div>
  )
}
```

**UI Requirements**:

- Clean, minimal form layout
- Focus on text description quality
- Show image thumbnails as confirmation only
- No option to add/remove images (go back to home for that)
- Prominent submit button at bottom

---

## Component Refactoring Guide

### Components to Create/Modify

#### 1. **Shared Header Component**

**File**: `/components/shared/Header.tsx`

```typescript
import Link from 'next/link'
import { Camera, Info } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F4C81] rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3C5D]">CivicEye</h1>
            <p className="text-xs text-gray-600">Manipur Grievance System</p>
          </div>
        </Link>
        <Link
          href="/about"
          className="flex items-center gap-2 text-[#0F4C81] hover:text-[#0B3C5D] transition-colors"
        >
          <Info className="w-5 h-5" />
          <span className="font-medium">About Us</span>
        </Link>
      </div>
    </header>
  )
}
```

#### 2. **Camera Capture Component**

**File**: `/components/citizen/CameraCapture.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'

interface Props {
  onImagesChange: (images: File[]) => void
  maxImages?: number
}

export default function CameraCapture({ onImagesChange, maxImages = 5 }: Props) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      // Camera capture logic here
      // Convert to File and add to images array
    } catch (error) {
      alert('Camera access denied')
    }
  }

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = [...images, ...files].slice(0, maxImages)

    // Generate previews
    const newPreviews = newImages.map((file) => URL.createObjectURL(file))

    setImages(newImages)
    setPreviews(newPreviews)
    onImagesChange(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)

    setImages(newImages)
    setPreviews(newPreviews)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Camera Circle */}
      {previews.length === 0 && (
        <div className="w-48 h-48 mx-auto bg-white/10 rounded-full flex items-center justify-center border-4 border-dashed border-white/30">
          <Camera className="w-20 h-20 text-white/70" />
        </div>
      )}

      {/* Image Grid Preview */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative">
              <img src={preview} className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <button
        onClick={handleCamera}
        className="w-full bg-white text-[#0F4C81] py-4 rounded-xl font-bold"
        disabled={images.length >= maxImages}
      >
        <Camera className="inline mr-2" />
        Tap to Open Camera
      </button>

      <label className="block w-full">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGallery}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        <div className="w-full border-2 border-white/30 text-white py-3 rounded-xl text-center cursor-pointer hover:bg-white/5">
          <Upload className="inline mr-2" />
          Choose from Gallery
        </div>
      </label>

      <p className="text-center text-white/70 text-sm">
        {images.length} / {maxImages} images
      </p>
    </div>
  )
}
```

---

## Routing & Navigation Flow

```
User Journey:

1. Land on Home Page (/)
   ↓
2. Capture/Upload 1-5 Images
   ↓
3. Click "Proceed" → Navigate to /citizen/submit
   ↓
4. Fill additional details (text, voice, location)
   ↓
5. Review AI-generated summary
   ↓
6. Submit complaint
   ↓
7. Success page with tracking ID

Alternative Flow:
- User clicks "About Us" → View /about page
- User can return to home from anywhere via header logo
```

---

## Data Flow & State Management

### Home Page → Submit Page Communication

```typescript
// HOME PAGE: Store captured images
const handleProceed = async () => {
  // Convert images to base64
  const base64Images = await Promise.all(images.map((img) => convertToBase64(img)))

  // Store in sessionStorage
  sessionStorage.setItem('complaint-images-data', JSON.stringify(base64Images))

  // Navigate
  router.push('/citizen/submit')
}

// SUBMIT PAGE: Retrieve images
useEffect(() => {
  const storedImages = sessionStorage.getItem('complaint-images-data')

  if (!storedImages) {
    // Redirect back if no images found
    router.push('/')
    return
  }

  setImages(JSON.parse(storedImages))
}, [])
```

### Form Submission to Backend

```typescript
// SUBMIT PAGE: Final submission
const handleSubmit = async (formData: FormData) => {
  // Retrieve images from state
  const imageData = images // Already loaded from sessionStorage

  // Combine all data
  const complaintData = {
    images: imageData,
    description: formData.get('description'),
    audio: formData.get('audio'),
    location: formData.get('location'),
    // ...
  }

  // Send to Supabase
  const result = await submitComplaint(complaintData)

  if (result.success) {
    // Clear sessionStorage
    sessionStorage.removeItem('complaint-images-data')
    router.push(`/citizen/status?id=${result.data.id}`)
  }
}
```

---

## Styling Guidelines

### Color Palette (Consistent Across All Pages)

```css
/* Primary Blue */
--primary-blue: #0f4c81;
--primary-blue-dark: #0b3c5d;
--primary-blue-light: #1a5f7a;

/* Accents */
--accent: #2b8fbd;
--background: #f8fafc;
--text-dark: #1e293b;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Common Patterns

```tsx
// Glassmorphism Card (Home Page)
<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 shadow-2xl">

// Standard Card (About Page, Submit Page)
<div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">

// Primary Button
<button className="bg-[#0F4C81] text-white px-6 py-4 rounded-xl hover:bg-[#0B3C5D] transition-all">

// Secondary Button (Outline)
<button className="border-2 border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/5">

// Input Field
<input className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100">
```

---

## Mobile-First Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints to use
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Small desktops
xl: 1280px  // Large desktops
```

### Layout Rules

```tsx
// Container widths
<div className="max-w-md mx-auto px-4">  {/* Home page */}
<div className="max-w-2xl mx-auto px-4">  {/* Submit page */}
<div className="max-w-4xl mx-auto px-4">  {/* About page */}

// Responsive padding
<div className="px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Accessibility Requirements

### ARIA Labels

```tsx
// Camera button
<button
  aria-label="Open device camera to capture complaint image"
  onClick={handleCamera}
>

// Gallery upload
<input
  type="file"
  aria-label="Choose images from gallery"
  accept="image/*"
/>

// Image preview
<img
  src={preview}
  alt={`Complaint evidence image ${index + 1}`}
/>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Add `tabIndex={0}` to custom clickable elements
- Show focus states: `focus:ring-2 focus:ring-[#0F4C81] focus:outline-none`

### Screen Reader Support

- Use semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`)
- Include descriptive alt text for all images
- Add `aria-live="polite"` for dynamic content updates

---

## Error Handling

### Camera Access Denied

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  // Success
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('Camera access denied. Please enable camera permissions or use gallery upload.')
  } else if (error.name === 'NotFoundError') {
    alert('No camera found on this device. Please use gallery upload.')
  }
}
```

### No Images on Submit Page

```typescript
useEffect(() => {
  const images = sessionStorage.getItem('complaint-images-data')

  if (!images || JSON.parse(images).length === 0) {
    router.push('/')
    toast.error('Please capture at least one image first')
  }
}, [])
```

### Image Size Validation

```typescript
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const validateImages = (files: File[]) => {
  const oversized = files.filter((f) => f.size > MAX_IMAGE_SIZE)

  if (oversized.length > 0) {
    alert(`${oversized.length} image(s) exceed 5MB limit`)
    return false
  }

  return true
}
```

---

## Testing Checklist

### Home Page

- [ ] Camera opens on mobile and desktop
- [ ] Gallery upload works with multiple files
- [ ] Image preview shows correctly
- [ ] Counter updates (0/5 → 3/5)
- [ ] Proceed button disabled when no images
- [ ] SessionStorage stores images correctly
- [ ] Navigation to About Us works

### About Page

- [ ] All content displays correctly
- [ ] Links and buttons work
- [ ] Responsive on mobile
- [ ] Header logo returns to home

### Submit Page

- [ ] Redirects to home if no images in sessionStorage
- [ ] Image gallery displays stored images
- [ ] Cannot add/remove images
- [ ] Text input, voice, location work
- [ ] AI preview card shows summary
- [ ] Submit creates complaint in Supabase
- [ ] SessionStorage clears after successful submit

---

## Performance Optimization

### Image Compression

```typescript
import imageCompression from 'browser-image-compression'

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  return await imageCompression(file, options)
}
```

### Lazy Loading

```tsx
import dynamic from 'next/dynamic'

// Load heavy components only when needed
const VoiceRecorder = dynamic(() => import('@/components/citizen/VoiceRecorder'), {
  loading: () => <p>Loading recorder...</p>,
})
```

### Progressive Image Loading

```tsx
import Image from 'next/image'

;<Image
  src={preview}
  alt="Complaint image"
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

---

## Quick Implementation Steps

1. **Create `/app/page.tsx`** with camera-first UI
2. **Create `/app/about/page.tsx`** and move old home content
3. **Create `/components/shared/Header.tsx`** for reusable header
4. **Modify `/app/(citizen)/submit/page.tsx`**:
   - Remove `<ImageUploader />` component
   - Add `useEffect` to load from sessionStorage
   - Add read-only image preview gallery
5. **Update routing** in all navigation links
6. **Test flow**: Home → Capture → Submit → Success

---

## Code Comments Convention

Use these comment styles for clarity:

```typescript
// 🎯 MAIN FEATURE: Camera capture logic
// 📝 NOTE: This uses MediaDevices API
// ⚠️ WARNING: Requires HTTPS in production
// 🐛 BUG FIX: Handle iOS Safari camera permissions
// 🚀 TODO: Add image compression before upload
```

---

## Git Commit Strategy

```bash
# Atomic commits for each major change
git commit -m "feat: add camera-first home page"
git commit -m "feat: create About Us page with old home content"
git commit -m "refactor: remove image upload from submit page"
git commit -m "feat: add sessionStorage image transfer"
git commit -m "fix: handle missing images on submit page"
```

---

## Environment Variables (No Changes Needed)

Existing variables remain the same:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_SPEECH_KEY=...
```

---

## Final Deliverables

### Required Files to Create/Modify:

1. ✅ `/app/page.tsx` (NEW - Camera home page)
2. ✅ `/app/about/page.tsx` (NEW - About us page)
3. ✅ `/components/shared/Header.tsx` (NEW - Shared header)
4. ✅ `/components/citizen/CameraCapture.tsx` (NEW - Camera component)
5. ✅ `/app/(citizen)/submit/page.tsx` (MODIFY - Remove image upload)
6. ✅ `/components/citizen/ImageUploader.tsx` (DELETE or deprecate)

### UI/UX Validation:

- Matches reference image design
- Professional blue theme throughout
- Smooth navigation flow
- Clear visual hierarchy
- Mobile-responsive on all pages

---

## Support & Troubleshooting

### Common Issues:

**Camera not working in browser**

- Requires HTTPS (localhost works for dev)
- Check browser permissions
- Fallback to gallery upload

**SessionStorage not persisting**

- Data clears on browser close (expected)
- Use localStorage if persistence needed
- Check JSON serialization errors

**Images not showing on submit page**

- Verify sessionStorage key matches
- Check base64 encoding is correct
- Add error boundary for debugging

**Routing issues**

- Ensure App Router is being used (Next.js 13+)
- Check `layout.tsx` files exist
- Verify middleware.ts isn't blocking routes

---

## Demo Script for Hackathon

### 30-Second Demo Flow:

1. "Open home page - see camera-first interface"
2. "Tap to capture complaint image from phone camera"
3. "Upload shows 1/5 images - can add more from gallery"
4. "Click proceed - automatically routes to submission form"
5. "Notice images are already there - just add description"
6. "AI generates summary automatically"
7. "Submit - complaint routed to correct department"

### Key Talking Points:

- ✅ Citizen-first design - camera upfront
- ✅ Zero friction image capture
- ✅ AI does the classification work
- ✅ Clean separation: capture → describe → submit

---

**🎯 PRIMARY GOAL**: Make complaint submission feel as easy as taking a photo and adding a quick note. Remove all friction from the citizen experience.
