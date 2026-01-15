---
description: Supervisor Dashboard Overhaul Workflow
---

# Supervisor Dashboard Overhaul

This workflow describes the steps to transform the basic complaint list into a premium Intelligence Dashboard for officers.

## Steps

### 1. Dependency Setup
// turbo
1. Install visualization libraries:
   `npm install recharts`

### 2. Analytics Components
1. Create `src/components/dashboard/AnalyticsCharts.tsx`:
   - Implement `DepartmentDistribution` (Pie Chart)
   - Implement `PriorityVolume` (Bar Chart)
2. Create `src/components/dashboard/SpatialHeatmap.tsx`:
   - Implement `HeatmapLayer` using Leaflet data.

### 3. Layout Integration
1. Update `src/components/dashboard/OfficerDashboard.tsx`:
   - Replace the single-column list with a CSS Grid layout.
   - Integrate the `AnalyticsCharts` in the secondary column.
   - Add the `SpatialHeatmap` at the top of the management view.

### 4. UI/UX Polishing
1. Wrap components in `framer-motion` `AnimatePresence`.
2. Apply `backdrop-blur-md` and `bg-white/70` for glass effects.
3. Replace standard buttons with more premium variants with micro-interactions.
