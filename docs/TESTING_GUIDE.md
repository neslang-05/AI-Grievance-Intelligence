# Testing Guide - Image Upload Workflow

## Automated Testing Checklist

### Component Tests

#### ✅ ImageUploadZone
- [ ] File validation (JPEG, PNG, WebP)
- [ ] File size limits (max 10MB)
- [ ] Image count limits (max 5)
- [ ] Drag and drop functionality
- [ ] Image compression
- [ ] Preview generation
- [ ] Remove image functionality
- [ ] Error messages for invalid files

**Test Script:**
```typescript
// Test file validation
const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
// Should show error: "Invalid file type"

// Test size limit
const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
// Should show error: "File size exceeds maximum"

// Test drag and drop
// Drag 3 valid images
// Should show 3 previews with thumbnails
```

#### ✅ EdgeValidation
- [ ] Validation animation plays
- [ ] Valid state shows checkmark
- [ ] Invalid state shows X mark  
- [ ] Auto-proceeds after 1.5s on success
- [ ] Error message displays correctly
- [ ] Retry option on failure

**Test Script:**
```typescript
// Test with civic issue image (pothole)
// Should show: "Valid civic complaint image detected"
// Should auto-proceed to analysis

// Test with non-civic image (selfie)
// Should show: "This image does not appear to be related to a civic issue"
// Should remain on validation step
```

#### ✅ AnalysisLoader
- [ ] Progress bar animates
- [ ] Current image count updates
- [ ] Estimated time countdown
- [ ] Processing steps animate
- [ ] Pulse animations work

#### ✅ InteractiveMapWidget
- [ ] GPS detection works
- [ ] Address search returns results
- [ ] Map expands to modal
- [ ] Pin placement on click
- [ ] Reverse geocoding
- [ ] Location confirmation
- [ ] Landmark input saves

**Test Script:**
```typescript
// Click "Use GPS"
// Should detect current location
// Should show map with pin

// Enter address: "Connaught Place, New Delhi"
// Click search
// Should show location on map
// Should display address

// Click on map to move pin
// Should update coordinates and address

// Click expand icon
// Should show full-screen modal
// Modal should be draggable and closable
```

#### ✅ EditableComplaintForm
- [ ] All fields pre-filled from AI
- [ ] Fields are editable
- [ ] Edit tracking shows "(Edited)"
- [ ] Character count works (max 1000)
- [ ] Auto-save every 30 seconds
- [ ] Severity buttons toggle
- [ ] Validation on required fields
- [ ] Save draft functionality

**Test Script:**
```typescript
// Wait for AI analysis
// Verify all fields are pre-filled

// Edit description
// Should show "(Edited)" badge
// Character count should update

// Wait 30 seconds
// Should show "Last saved: [time]"

// Change severity from "Medium" to "High"
// Should highlight "High" button
// Should show "(Edited)" badge

// Click "Save Draft"
// Should show "Saving..." then "Last saved"
```

#### ✅ ComplaintPreviewNew
- [ ] All images display
- [ ] Image zoom works
- [ ] All complaint data shown
- [ ] Location map renders
- [ ] Department badge colored
- [ ] Severity badge colored
- [ ] Back button works
- [ ] Submit button works

**Test Script:**
```typescript
// Verify all 3 uploaded images shown
// Click image #2
// Should open zoom modal
// Click outside to close

// Verify description matches edited text
// Verify department shows selected value
// Verify severity badge shows correct color
// Verify location map shows pin at correct position

// Click "Back to Edit"
// Should return to edit form with data intact

// Click "Submit Complaint"
// Should show loading state
// Should proceed to completion
```

#### ✅ CompletionScreen
- [ ] Success animation plays
- [ ] Reference ID displays
- [ ] Copy to clipboard works
- [ ] Confetti animation plays
- [ ] Department and priority shown
- [ ] Download PDF works
- [ ] Track status link works
- [ ] Share button works
- [ ] Submit another works

**Test Script:**
```typescript
// Watch success animation
// Should see checkmark draw in
// Should see confetti particles

// Click copy icon next to reference ID
// Should copy "PW-7K2M9X" format
// Should show toast: "Reference ID copied"

// Click "Download Complaint Report (PDF)"
// Should download PDF file
// PDF should contain:
//   - Reference ID
//   - QR code
//   - Department, priority, severity
//   - Description
//   - Location

// Click "Track Status"
// Should navigate to /status?ref=PW-7K2M9X

// Click "Submit Another Complaint"
// Should reset to step 1
```

---

## Integration Tests

### End-to-End Workflow

**Complete Happy Path:**
```
1. Navigate to /new-submit
2. Upload 2 images (pothole photos)
3. Wait for validation (2s)
4. Wait for AI analysis (10s)
5. Use GPS for location
6. Confirm location
7. Continue to edit
8. Review AI-generated data
9. Edit description (add details)
10. Change severity to "High"
11. Continue to preview
12. Review all data
13. Submit complaint
14. Get reference ID
15. Download PDF
16. Verify PDF contents
```

**Expected Time:** < 30 seconds total

### API Tests

#### POST /api/validate-image
```bash
curl -X POST http://localhost:3000/api/validate-image \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'

# Expected: 200 OK
# Response: {"success": true, "isValid": true, "message": "..."}
```

#### POST /api/analyze-complaint
```bash
curl -X POST http://localhost:3000/api/analyze-complaint \
  -H "Content-Type: application/json" \
  -d '{"images": ["data:image/jpeg;base64,..."]}'

# Expected: 200 OK
# Response: {"success": true, "analysis": {...}}
```

#### POST /api/generate-report
```bash
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "referenceId": "PW7K2M9X",
    "summary": "Pothole on main road",
    "department": "Public Works Department",
    "priority": "High"
  }'

# Expected: 200 OK
# Response: {"success": true, "pdf": "data:application/pdf;base64,..."}
```

---

## Performance Tests

### Lighthouse Scores
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### Animation Frame Rate
- [ ] All animations at 60fps
- [ ] No dropped frames during transitions
- [ ] Smooth scroll behavior

**Test with Chrome DevTools:**
```
1. Open DevTools
2. Go to Performance tab
3. Start recording
4. Complete workflow
5. Stop recording
6. Check FPS chart (should be consistent 60fps)
```

### Network Performance
- [ ] Image compression reduces size by 60%+
- [ ] API calls < 500ms (excluding AI analysis)
- [ ] Total page weight < 2MB

**Test:**
```
1. Open Network tab
2. Upload 5 images (each 8MB)
3. Verify compressed images < 2MB each
4. Monitor API response times
```

---

## Error Handling Tests

### Network Errors
- [ ] Offline detection
- [ ] API timeout handling
- [ ] Retry mechanism (3 attempts)
- [ ] Fallback to manual entry

**Test:**
```
1. Disconnect internet
2. Try to upload image
3. Should show: "Network error. Please check your connection."
4. Click "Retry"
5. Reconnect internet
6. Should succeed
```

### Validation Errors
- [ ] Invalid file type error
- [ ] File size exceeded error
- [ ] Missing required fields
- [ ] Invalid location data

### API Errors
- [ ] Azure OpenAI quota exceeded
- [ ] Vision analysis failure
- [ ] Database connection error
- [ ] Storage upload failure

**Test:**
```
// Simulate API error by modifying .env
AZURE_OPENAI_API_KEY=invalid_key

// Try workflow
// Should show: "AI analysis failed. Please enter details manually."
// Should allow manual form entry
```

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter/Space to submit
- [ ] Escape to close modals
- [ ] Arrow keys in dropdowns

**Test:**
```
1. Start at step 1
2. Press Tab repeatedly
3. Should highlight: upload zone → continue button
4. Press Enter on upload zone
5. Should open file picker
6. Complete workflow using only keyboard
```

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels associated
- [ ] ARIA labels on interactive elements
- [ ] Status announcements
- [ ] Error announcements

**Test with NVDA/JAWS:**
```
1. Turn on screen reader
2. Navigate workflow
3. Verify all elements are announced
4. Verify state changes are announced ("Loading...", "Success", etc.)
```

### Color Contrast
- [ ] All text meets WCAG AA (4.5:1)
- [ ] Interactive elements visible
- [ ] Focus indicators clear

---

## Mobile Responsive Tests

### Breakpoints
- [ ] 320px (small mobile)
- [ ] 375px (iPhone)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1920px (large desktop)

### Touch Interactions
- [ ] Drag and drop works on mobile
- [ ] Touch to upload images
- [ ] Pinch to zoom on images
- [ ] Map pan and zoom
- [ ] Modal swipe to close

**Test:**
```
1. Open Chrome DevTools
2. Toggle device toolbar
3. Test each breakpoint
4. Verify layout doesn't break
5. Test touch interactions
```

---

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] Mobile Chrome
- [ ] Mobile Safari
- [ ] Samsung Internet

**Known Issues:**
- GPS requires HTTPS in production
- Service worker needs HTTPS
- Some animations may be reduced on low-end devices

---

## Database Integration Tests

### Supabase Storage
- [ ] Images upload successfully
- [ ] Public URLs generated
- [ ] File permissions correct

### Supabase Database
- [ ] Complaint records insert
- [ ] Reference IDs unique
- [ ] Foreign keys valid
- [ ] Timestamps correct

**Test:**
```
1. Submit complaint
2. Check Supabase dashboard
3. Verify record in `complaints` table
4. Verify images in `image-complaints` bucket
5. Check reference_id is unique
```

---

## Security Tests

### Input Validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] File upload validation
- [ ] Rate limiting works

**Test:**
```
// Try to upload 20 images in 1 minute
// Should hit rate limit after 10 requests
// Should show: "Rate limit exceeded"

// Try to upload .exe file
// Should reject: "Invalid file type"

// Try to inject SQL in description
// Should be sanitized/escaped
```

---

## Regression Tests

After any code changes, verify:
- [ ] Existing ComplaintForm.tsx still works
- [ ] Other pages not affected
- [ ] No console errors
- [ ] No broken styles
- [ ] API routes still respond

---

## Load Testing

### Concurrent Users
```bash
# Install Artillery
npm install -g artillery

# Create load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - flow:
      - get:
          url: '/new-submit'

# Run test
artillery run load-test.yml

# Expected: 95%+ success rate, < 500ms response time
```

---

## Bug Tracking

### Known Issues
1. **Image compression slow on low-end devices**
   - Mitigation: Show progress indicator
   - Future: Use web worker

2. **Map widget requires internet**
   - Mitigation: Show "Offline" message
   - Future: Cache map tiles

3. **AI analysis can timeout**
   - Mitigation: 30s timeout, retry option
   - Future: Queue system

### Fixed Issues
✅ Reference ID collision (added uniqueness check)
✅ PDF generation failed on special characters (added escaping)
✅ Map not loading in modal (fixed z-index)

---

## Pre-Production Checklist

Before deploying to production:
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Azure API quota sufficient
- [ ] Supabase storage limits checked
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] Analytics integrated
- [ ] Backup strategy in place
- [ ] Rollback plan ready

---

## Monitoring

### Metrics to Track
- Workflow completion rate
- Step dropout rate
- Average completion time
- API error rate
- Storage usage
- User feedback scores

### Error Logging
```typescript
// Add to production
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

---

**Testing Status:** ✅ Ready for QA
**Last Updated:** January 15, 2026
