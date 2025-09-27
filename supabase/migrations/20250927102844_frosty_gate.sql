/*
  # Add Sample Users for Testing

  1. New Users
    - 5 additional sample users with different roles
    - Realistic names and email addresses
    - Proper business assignments
    - Default permissions for each role

  2. Security
    - All users follow existing RLS policies
    - Proper role assignments
    - Active status and email verification
*/

-- Add 5 sample users for testing
INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
(
  '550e8400-e29b-41d4-a716-446655440010',
  'sarah.johnson@blindstech.com',
  'Sarah Johnson',
  'business',
  '550e8400-e29b-41d4-a716-446655440001',
  ARRAY['manage_employees', 'view_dashboard', 'create_jobs', 'manage_customers', 'view_calendar'],
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  'mike.davis@blindstech.com',
  'Mike Davis',
  'employee',
  '550e8400-e29b-41d4-a716-446655440001',
  ARRAY['create_jobs', 'manage_tasks', 'capture_signatures', 'view_dashboard', 'view_calendar', 'ar_camera_access'],
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  'lisa.wilson@premiumwindows.com',
  'Lisa Wilson',
  'business',
  '550e8400-e29b-41d4-a716-446655440002',
  ARRAY['manage_employees', 'view_dashboard', 'create_jobs', 'manage_customers'],
  true,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  'james.brown@premiumwindows.com',
  'James Brown',
  'employee',
  '550e8400-e29b-41d4-a716-446655440002',
  ARRAY['create_jobs', 'manage_tasks', 'view_dashboard', 'view_calendar'],
  true,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440014',
  'emma.taylor@blindstech.com',
  'Emma Taylor',
  'employee',
  '550e8400-e29b-41d4-a716-446655440001',
  ARRAY['create_jobs', 'manage_tasks', 'capture_signatures', 'view_dashboard', 'ar_camera_access'],
  true,
  true
);

-- Add a second business for testing
INSERT INTO businesses (id, name, address, phone, email, admin_id, features, subscription) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Premium Window Solutions Ltd.',
  '789 Business Park, Enterprise District, London, UK',
  '+44 20 7123 4567',
  'contact@premiumwindows.com',
  '550e8400-e29b-41d4-a716-446655440012',
  ARRAY['job_management', 'calendar', 'reports', 'customer_management'],
  'basic'
) ON CONFLICT (id) DO NOTHING;

-- Add some customers for the new business
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
(
  '550e8400-e29b-41d4-a716-446655440015',
  'Corporate Towers Ltd.',
  'facilities@corporatetowers.com',
  '+44 20 8555 1234',
  '+44 7700 123456',
  '100 Corporate Plaza, Financial District, London',
  'EC1A 1BB',
  '550e8400-e29b-41d4-a716-446655440002'
),
(
  '550e8400-e29b-41d4-a716-446655440016',
  'Residential Complex Management',
  'manager@residentialcomplex.com',
  '+44 20 8555 5678',
  '+44 7700 654321',
  '250 Residential Gardens, Housing Estate, Manchester',
  'M1 2AB',
  '550e8400-e29b-41d4-a716-446655440002'
) ON CONFLICT (id) DO NOTHING;

-- Add some jobs for testing
INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, quotation, checklist) VALUES
(
  'JOB-003',
  'Smart Blinds Installation - Corporate Towers',
  'Install motorized smart blinds in executive offices with app integration',
  'pending',
  '550e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440002',
  '2024-01-20T09:00:00Z',
  2500,
  '[
    {"id": "1", "text": "Site survey and measurements", "completed": false},
    {"id": "2", "text": "Smart blinds delivery", "completed": false},
    {"id": "3", "text": "Installation and setup", "completed": false},
    {"id": "4", "text": "App configuration and testing", "completed": false}
  ]'::jsonb
),
(
  'JOB-004',
  'Venetian Blinds Replacement',
  'Replace old venetian blinds in residential complex common areas',
  'in-progress',
  '550e8400-e29b-41d4-a716-446655440016',
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440001',
  '2024-01-19T14:00:00Z',
  1800,
  '[
    {"id": "1", "text": "Remove old blinds", "completed": true},
    {"id": "2", "text": "Clean window frames", "completed": true},
    {"id": "3", "text": "Install new venetian blinds", "completed": false},
    {"id": "4", "text": "Quality check and handover", "completed": false}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Add notifications for the new users
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
(
  '550e8400-e29b-41d4-a716-446655440017',
  '550e8400-e29b-41d4-a716-446655440011',
  'New Job Assignment',
  'You have been assigned to JOB-004: Venetian Blinds Replacement',
  'job',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440018',
  '550e8400-e29b-41d4-a716-446655440013',
  'Upcoming Installation',
  'Smart Blinds Installation scheduled for tomorrow at Corporate Towers',
  'reminder',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440019',
  '550e8400-e29b-41d4-a716-446655440012',
  'Welcome to BlindsCloud',
  'Your business account has been set up successfully. You can now manage your team and projects.',
  'system',
  false
) ON CONFLICT (id) DO NOTHING;

-- Grant AR camera access to some employees
INSERT INTO module_access (user_id, module_name, can_access, can_grant_access, granted_by) VALUES
(
  '550e8400-e29b-41d4-a716-446655440011',
  'ar-camera',
  true,
  false,
  '550e8400-e29b-41d4-a716-446655440003'
),
(
  '550e8400-e29b-41d4-a716-446655440014',
  'ar-camera',
  true,
  false,
  '550e8400-e29b-41d4-a716-446655440003'
) ON CONFLICT (user_id, module_name) DO NOTHING;

-- Grant 3D model access to businesses
INSERT INTO model_permissions (business_id, can_view_3d_models, can_use_in_ar, granted_by) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  true,
  '550e8400-e29b-41d4-a716-446655440003'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  true,
  false,
  '550e8400-e29b-41d4-a716-446655440003'
) ON CONFLICT (business_id) DO NOTHING;