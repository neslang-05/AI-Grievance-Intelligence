# Supervisor Dashboard Overhaul Plan

This document outlines the proposed changes to the Supervisor Officer Dashboard to transform it into an "Intelligence Portal" with advanced data visualization and spatial analysis.

## 1. Visual Identity & Atmosphere
- **Premium Aesthetics:** Move from a flat white background to a subtle #F8FAFC / #F1F5F9 gradient with "Glassmorphism" elements for cards.
- **Micro-interactions:** Add layout transitions using `framer-motion` when viewing specific complaint details.
- **Modern Typography:** Use `Inter` or `Outfit` with high contrast for quick data scanning.

## 2. Intelligence Layer (New Components)
### A. Geographical Heatmap (`ComplaintHeatmap.tsx`)
- **Library:** `react-leaflet` with `leaflet.heat`.
- **Function:** Visualize complaint hotspots across the city.
- **Interactivity:** Clicking a hotspot zooms to specific complaint markers.

### B. Analytical Charts (`DashboardAnalytics.tsx`)
- **Department Breakdown (Pie Chart):** Shows the distribution of issues across various city departments.
- **Priority Distribution (Bar Chart):** Visualizes the volume of High/Medium/Low priority tasks to help resource allocation.
- **Status Throughput (Progress Bars):** Visualizes the percentage of resolved vs. total complaints.

## 3. Layout Restructuring
### Current Layout:
- Stats Cards (Top)
- Tabs (Middle)
- List (Bottom)

### Proposed Layout:
1. **Header:** Dynamic summary stats with real-time counters.
2. **Main Grid:**
   - **Left Column (66%):** 
     - Interactive Heatmap (Top)
     - Analytical Insights Charts (Bottom-split)
   - **Right Column (33%):** 
     - Search & Advanced Filters
     - Real-time "Recent Activity" feed
3. **Management Section:** 
   - Expandable list of complaints with a "Command Center" feel.

## 4. Implementation Workflow

### Phase 1: Infrastructure & Dependencies
- [ ] Install `recharts` for visualization.
- [ ] Add `leaflet.heat` or similar for spatial analysis.
- [ ] Setup Framer Motion layout configurations.

### Phase 2: Core Analytics
- [ ] Develop `DashboardCharts.tsx` with Pie and Bar charts.
- [ ] Create `StatsRibbon.tsx` with premium glassmorphism styling.
- [ ] Implement data transformation logic to aggregate Supabase data for charts.

### Phase 3: Spatial Intelligence
- [ ] Integrate Leaflet-based Heatmap layer.
- [ ] Implement marker clusters for clear visualization in high-density areas.
- [ ] Link map markers to the complaint drawer.

### Phase 4: Modernization & Polish
- [ ] Update `OfficerDashboard.tsx` to the new grid layout.
- [ ] Add smooth entry animations for components.
- [ ] Implement skeleton loaders for a seamless data loading experience.

## 5. Future Considerations (Not in this phase)
- **AI Prediction:** Forecasting high-volume areas based on historical data.
- **Staff Workload Tracking:** Visualizing which officers (if multiple) are handling which zones.
- **Custom Reporting:** Exporting the intelligence dashboard as a PDF report.
