-- Signature Properties CRM - Sample Data
-- This file contains sample data for development and testing

-- Clear existing data
TRUNCATE TABLE interactions, site_visits, opportunities, leads, projects, users RESTART IDENTITY CASCADE;

-- Insert sample users (passwords are hashed for 'admin123', 'manager123', 'sales123')
INSERT INTO users (name, email, password_hash, role, project_ids, active, created_at) VALUES
('Admin User', 'admin@signatureproperties.com', '$2a$12$LQv3c1yqBTVHdcrd1YWb3eI9GctHjCy3V/HGdl9JoZGM8MEWBk6v6', 'Admin', ARRAY[1,2,3,4], true, NOW()),
('Project Manager', 'manager@signatureproperties.com', '$2a$12$LQv3c1yqBTVHdcrd1YWb3eI9GctHjCy3V/HGdl9JoZGM8MEWBk6v6', 'Project Manager', ARRAY[1,2], true, NOW()),
('Sales Executive', 'sales@signatureproperties.com', '$2a$12$LQv3c1yqBTVHdcrd1YWb3eI9GctHjCy3V/HGdl9JoZGM8MEWBk6v6', 'Sales Executive', ARRAY[1,2,3], true, NOW()),
('Telecaller One', 'telecaller1@signatureproperties.com', '$2a$12$LQv3c1yqBTVHdcrd1YWb3eI9GctHjCy3V/HGdl9JoZGM8MEWBk6v6', 'Telecaller', ARRAY[1], true, NOW()),
('Sales Manager', 'salesmanager@signatureproperties.com', '$2a$12$LQv3c1yqBTVHdcrd1YWb3eI9GctHjCy3V/HGdl9JoZGM8MEWBk6v6', 'Project Manager', ARRAY[3,4], true, NOW());

-- Insert sample projects
INSERT INTO projects (name, location, description, status, total_units, available_units, price_range_min, price_range_max, created_by, created_at) VALUES
('Skyline Residences', 'Whitefield, Bangalore', 'Premium residential apartments with modern amenities and excellent connectivity', 'Active', 120, 45, 25000000, 35000000, 1, NOW()),
('Green Valley Apartments', 'Electronic City, Bangalore', 'Eco-friendly apartments with solar power and rainwater harvesting', 'Active', 80, 32, 18000000, 28000000, 1, NOW()),
('Premium Villas', 'Sarjapur Road, Bangalore', 'Luxury independent villas with private gardens and club facilities', 'Active', 24, 8, 60000000, 85000000, 1, NOW()),
('Commercial Complex', 'MG Road, Bangalore', 'Prime commercial spaces for offices and retail outlets', 'Active', 50, 15, 40000000, 120000000, 1, NOW()),
('Riverside Homes', 'Hebbal, Bangalore', 'Waterfront apartments with lake view and premium facilities', 'Pre-Launch', 96, 96, 30000000, 45000000, 1, NOW());

-- Insert sample leads
INSERT INTO leads (name, phone, email, source, project_id, status, priority, budget_min, budget_max, requirements, notes, next_follow_up, assigned_to, created_by, created_at) VALUES
('Raj Patel', '+91 9876543210', 'raj.patel@email.com', 'Website', 1, 'New', 'High', 25000000, 30000000, '3BHK, East facing', 'First-time buyer, very interested', NOW() + INTERVAL '2 days', 3, 1, NOW() - INTERVAL '1 day'),
('Anita Gupta', '+91 9876543211', 'anita.gupta@email.com', 'Facebook', 1, 'Contacted', 'Medium', 20000000, 25000000, '2BHK, Investment property', 'Looking for rental income', NOW() + INTERVAL '1 day', 3, 1, NOW() - INTERVAL '2 days'),
('Vikram Singh', '+91 9876543212', 'vikram.singh@email.com', 'Referral', 2, 'Qualified', 'High', 18000000, 22000000, '2BHK, Ready to move', 'Urgent requirement, can close fast', NOW() + INTERVAL '3 days', 4, 1, NOW() - INTERVAL '3 days'),
('Priya Sharma', '+91 9876543213', 'priya.sharma@email.com', 'WhatsApp', 3, 'New', 'Low', 60000000, 70000000, '4BHK Villa, North facing', 'Budget might be flexible', NOW() + INTERVAL '5 days', 3, 1, NOW() - INTERVAL '1 hour'),
('Arjun Reddy', '+91 9876543214', 'arjun.reddy@email.com', 'Google Ads', 2, 'Contacted', 'Medium', 19000000, 24000000, '3BHK, Good ventilation', 'Young couple, first home', NOW() + INTERVAL '4 days', 4, 1, NOW() - INTERVAL '4 hours'),
('Meera Krishnan', '+91 9876543215', 'meera.k@email.com', 'Walk-in', 4, 'New', 'High', 50000000, 80000000, 'Commercial space, Ground floor', 'Running a retail business', NOW() + INTERVAL '1 day', 5, 1, NOW() - INTERVAL '6 hours'),
('Suresh Kumar', '+91 9876543216', 'suresh.kumar@email.com', 'Referral', 1, 'Qualified', 'High', 28000000, 33000000, '3BHK, Top floor preferred', 'Senior citizen, needs elevator access', NOW() + INTERVAL '2 days', 3, 1, NOW() - INTERVAL '5 days'),
('Deepa Nair', '+91 9876543217', 'deepa.nair@email.com', 'Website', 5, 'New', 'Medium', 32000000, 40000000, '3BHK, Lake view', 'Waiting for project launch', NOW() + INTERVAL '7 days', 3, 1, NOW() - INTERVAL '2 hours'),
('Rahul Joshi', '+91 9876543218', 'rahul.joshi@email.com', 'Social Media', 2, 'Contacted', 'Low', 17000000, 20000000, '2BHK, Budget friendly', 'Student, parents buying', NOW() + INTERVAL '6 days', 4, 1, NOW() - INTERVAL '8 hours'),
('Kavya Iyer', '+91 9876543219', 'kavya.iyer@email.com', 'Advertisement', 3, 'New', 'High', 75000000, 85000000, '5BHK Villa, Swimming pool', 'Looking for luxury amenities', NOW() + INTERVAL '3 days', 3, 1, NOW() - INTERVAL '30 minutes');

-- Insert sample opportunities
INSERT INTO opportunities (lead_id, project_id, stage, value, probability, visit_date, expected_close_date, notes, assigned_to, created_by, created_at) VALUES
(3, 2, 'Visit Done', 20000000, 75, NOW() + INTERVAL '1 day', NOW() + INTERVAL '30 days', 'Very interested after site visit, discussing loan options', 4, 1, NOW() - INTERVAL '2 days'),
(2, 1, 'Negotiation', 23000000, 85, NOW() + INTERVAL '2 days', NOW() + INTERVAL '20 days', 'Ready to book if 5% discount available', 3, 1, NOW() - INTERVAL '1 day'),
(7, 1, 'Scheduled', 30000000, 60, NOW() + INTERVAL '3 days', NOW() + INTERVAL '45 days', 'Site visit scheduled for this weekend', 3, 1, NOW() - INTERVAL '3 days'),
(6, 4, 'Visit Done', 65000000, 70, NOW() + INTERVAL '4 days', NOW() + INTERVAL '60 days', 'Impressed with location, checking finances', 5, 1, NOW() - INTERVAL '1 day'),
(10, 3, 'Scheduled', 80000000, 50, NOW() + INTERVAL '5 days', NOW() + INTERVAL '90 days', 'High-value prospect, needs customization', 3, 1, NOW() - INTERVAL '6 hours');

-- Insert sample site visits
INSERT INTO site_visits (lead_id, opportunity_id, project_id, visit_date, status, notes, feedback, assigned_to, created_by, created_at) VALUES
(3, 1, 2, NOW() + INTERVAL '1 day', 'Scheduled', 'First site visit for qualified lead', NULL, 4, 1, NOW() - INTERVAL '2 days'),
(2, 2, 1, NOW() + INTERVAL '2 days', 'Scheduled', 'Follow-up visit to finalize unit selection', NULL, 3, 1, NOW() - INTERVAL '1 day'),
(7, 3, 1, NOW() + INTERVAL '3 days', 'Scheduled', 'Weekend visit as per customer preference', NULL, 3, 1, NOW() - INTERVAL '3 days'),
(1, NULL, 1, NOW() - INTERVAL '1 day', 'Completed', 'Initial site visit for new lead', 'Customer liked the amenities and location', 3, 1, NOW() - INTERVAL '3 days'),
(6, 4, 4, NOW() + INTERVAL '4 days', 'Scheduled', 'Commercial space viewing appointment', NULL, 5, 1, NOW() - INTERVAL '1 day'),
(5, NULL, 2, NOW() - INTERVAL '2 days', 'Completed', 'Young couple visit', 'Loved the eco-friendly features', 4, 1, NOW() - INTERVAL '4 days'),
(10, 5, 3, NOW() + INTERVAL '5 days', 'Scheduled', 'Luxury villa showcase', NULL, 3, 1, NOW() - INTERVAL '6 hours'),
(4, NULL, 3, NOW() - INTERVAL '3 days', 'Cancelled', 'Customer cancelled due to budget constraints', 'Will contact when budget increases', 3, 1, NOW() - INTERVAL '5 days');

-- Insert sample interactions
INSERT INTO interactions (lead_id, opportunity_id, type, direction, outcome, notes, duration, created_by, created_at) VALUES
(1, NULL, 'call', 'outbound', 'Interested', 'Initial qualifying call, customer showed interest', '15 minutes', 3, NOW() - INTERVAL '1 day'),
(2, 2, 'whatsapp', 'inbound', 'Query answered', 'Customer asked about payment plans', NULL, 3, NOW() - INTERVAL '6 hours'),
(3, 1, 'meeting', 'outbound', 'Positive', 'Site visit conducted, customer very impressed', '2 hours', 4, NOW() - INTERVAL '1 day'),
(1, NULL, 'email', 'outbound', 'Sent brochure', 'Sent detailed project brochure and floor plans', NULL, 3, NOW() - INTERVAL '8 hours'),
(7, 3, 'call', 'inbound', 'Scheduled visit', 'Customer called to confirm weekend visit', '8 minutes', 3, NOW() - INTERVAL '2 days'),
(6, 4, 'whatsapp', 'outbound', 'Appointment set', 'Shared location and confirmed visit time', NULL, 5, NOW() - INTERVAL '12 hours'),
(2, 2, 'call', 'outbound', 'Negotiation', 'Discussed pricing and discount options', '25 minutes', 3, NOW() - INTERVAL '4 hours'),
(10, 5, 'email', 'outbound', 'Information sent', 'Sent customization options and premium features list', NULL, 3, NOW() - INTERVAL '3 hours'),
(5, NULL, 'call', 'outbound', 'Follow-up', 'Post-visit follow-up, customer needs time to decide', '12 minutes', 4, NOW() - INTERVAL '1 day'),
(4, NULL, 'whatsapp', 'inbound', 'Budget issue', 'Customer mentioned budget constraints', NULL, 3, NOW() - INTERVAL '2 days');

-- Update sequences to current max values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('leads_id_seq', (SELECT MAX(id) FROM leads));
SELECT setval('opportunities_id_seq', (SELECT MAX(id) FROM opportunities));
SELECT setval('site_visits_id_seq', (SELECT MAX(id) FROM site_visits));
SELECT setval('interactions_id_seq', (SELECT MAX(id) FROM interactions));

-- Create some statistics views for reporting
CREATE OR REPLACE VIEW daily_lead_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'New') as new_leads,
    COUNT(*) FILTER (WHERE status = 'Qualified') as qualified_leads,
    COUNT(*) FILTER (WHERE priority = 'High') as high_priority_leads
FROM leads 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW project_performance AS
SELECT 
    p.id,
    p.name,
    p.location,
    COUNT(l.id) as total_leads,
    COUNT(o.id) as total_opportunities,
    SUM(o.value) as total_pipeline_value,
    COUNT(*) FILTER (WHERE o.stage = 'Booking') as closed_deals,
    SUM(o.value) FILTER (WHERE o.stage = 'Booking') as closed_value
FROM projects p
LEFT JOIN leads l ON p.id = l.project_id
LEFT JOIN opportunities o ON p.id = o.project_id
GROUP BY p.id, p.name, p.location
ORDER BY total_pipeline_value DESC NULLS LAST;

-- Display summary of inserted data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Leads' as table_name, COUNT(*) as count FROM leads
UNION ALL
SELECT 'Opportunities' as table_name, COUNT(*) as count FROM opportunities
UNION ALL
SELECT 'Site Visits' as table_name, COUNT(*) as count FROM site_visits
UNION ALL
SELECT 'Interactions' as table_name, COUNT(*) as count FROM interactions;