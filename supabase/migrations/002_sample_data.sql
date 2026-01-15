-- Sample data for testing (optional)

-- Insert some sample complaints for testing the dashboard
INSERT INTO complaints (
  citizen_text,
  location_manual,
  location_ward,
  ai_summary,
  ai_department,
  ai_issue_type,
  ai_priority,
  ai_priority_explanation,
  ai_confidence,
  status
) VALUES 
(
  'There is a big pothole on the main road near City Hospital. It is very dangerous for two-wheelers.',
  'Near City Hospital, Main Road',
  'Ward 5',
  'Large pothole on main road near City Hospital poses danger to two-wheeler riders and requires immediate repair.',
  'Public Works Department',
  'Road Damage - Pothole',
  'high',
  'Safety hazard for vehicles, especially two-wheelers. High traffic area near hospital.',
  0.92,
  'pending'
),
(
  'Garbage has not been collected from our street for the past 3 days. It is creating a bad smell.',
  'Thangal Bazar Street',
  'Ward 12',
  'Garbage collection missed for 3 consecutive days in Thangal Bazar area causing sanitation issues.',
  'Municipal Corporation',
  'Waste Management - Collection Delay',
  'medium',
  'Sanitation issue affecting public health. Needs prompt attention but not immediately dangerous.',
  0.88,
  'pending'
),
(
  'Street light not working near the park for more than a week now.',
  'Near Public Park, Kangla Road',
  'Ward 8',
  'Non-functional street light near public park on Kangla Road affecting evening safety.',
  'Municipal Corporation',
  'Street Lighting',
  'medium',
  'Safety concern during night hours. Affects public movement after dark.',
  0.85,
  'in_progress'
),
(
  'Water supply has been completely stopped since yesterday morning.',
  'Paona Bazar Area',
  'Ward 3',
  'Complete water supply disruption in Paona Bazar area since yesterday morning.',
  'Water Resources Department',
  'Water Supply - Complete Outage',
  'high',
  'Essential service outage affecting daily life. Immediate restoration required.',
  0.95,
  'in_progress'
),
(
  'The public toilet near the market is very dirty and needs cleaning.',
  'Near Khwairamband Bazaar',
  'Ward 7',
  'Public toilet facility near Khwairamband Bazaar requires cleaning and maintenance.',
  'Municipal Corporation',
  'Sanitation - Public Facility',
  'low',
  'Maintenance issue. Important for public hygiene but not an emergency.',
  0.78,
  'resolved'
);
