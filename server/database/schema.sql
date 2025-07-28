-- Signature Properties CRM Database Schema
-- PostgreSQL Database Schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS site_visits CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Project Manager', 'Sales Executive', 'Telecaller')),
    project_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    avatar TEXT,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    total_units INTEGER,
    available_units INTEGER,
    price_range_min DECIMAL(15,2),
    price_range_max DECIMAL(15,2),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100) NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Unqualified')),
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    requirements TEXT,
    notes TEXT,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on phone to prevent duplicate leads
    CONSTRAINT unique_phone_lead UNIQUE(phone)
);

-- Create opportunities table
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage VARCHAR(50) DEFAULT 'Scheduled' CHECK (stage IN ('Scheduled', 'Visit Done', 'Negotiation', 'Booking', 'Lost')),
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    visit_date TIMESTAMP WITH TIME ZONE,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one opportunity per lead
    CONSTRAINT unique_lead_opportunity UNIQUE(lead_id)
);

-- Create site_visits table
CREATE TABLE site_visits (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
    notes TEXT,
    feedback TEXT,
    assigned_to INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure at least one of lead_id or opportunity_id is not null
    CONSTRAINT check_lead_or_opportunity CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL)
);

-- Create interactions table for tracking communications
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'sms')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    outcome VARCHAR(100),
    notes TEXT,
    duration VARCHAR(20),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure at least one of lead_id or opportunity_id is not null
    CONSTRAINT check_interaction_reference CHECK (lead_id IS NOT NULL OR opportunity_id IS NOT NULL)
);

-- Create indexes for better performance
CREATE INDEX idx_leads_project_id ON leads(project_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_phone ON leads(phone);

CREATE INDEX idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX idx_opportunities_project_id ON opportunities(project_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);

CREATE INDEX idx_site_visits_lead_id ON site_visits(lead_id);
CREATE INDEX idx_site_visits_opportunity_id ON site_visits(opportunity_id);
CREATE INDEX idx_site_visits_project_id ON site_visits(project_id);
CREATE INDEX idx_site_visits_visit_date ON site_visits(visit_date);
CREATE INDEX idx_site_visits_status ON site_visits(status);

CREATE INDEX idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX idx_interactions_opportunity_id ON interactions(opportunity_id);
CREATE INDEX idx_interactions_type ON interactions(type);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_name ON projects(name);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_visits_updated_at BEFORE UPDATE ON site_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW leads_with_details AS
SELECT 
    l.*,
    p.name as project_name,
    p.location as project_location,
    u.name as assigned_to_name
FROM leads l
LEFT JOIN projects p ON l.project_id = p.id
LEFT JOIN users u ON l.assigned_to = u.id;

CREATE VIEW opportunities_with_details AS
SELECT 
    o.*,
    l.name as lead_name,
    l.phone as lead_phone,
    l.email as lead_email,
    p.name as project_name,
    p.location as project_location,
    u.name as assigned_to_name
FROM opportunities o
LEFT JOIN leads l ON o.lead_id = l.id
LEFT JOIN projects p ON o.project_id = p.id
LEFT JOIN users u ON o.assigned_to = u.id;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crm_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crm_user;

-- Add comments for documentation
COMMENT ON TABLE users IS 'CRM users with role-based access';
COMMENT ON TABLE projects IS 'Real estate projects';
COMMENT ON TABLE leads IS 'Potential customers';
COMMENT ON TABLE opportunities IS 'Sales opportunities from qualified leads';
COMMENT ON TABLE site_visits IS 'Scheduled and completed site visits';
COMMENT ON TABLE interactions IS 'Communication history with leads and opportunities';

COMMENT ON COLUMN users.project_ids IS 'Array of project IDs the user has access to';
COMMENT ON COLUMN leads.phone IS 'Primary contact phone number (unique)';
COMMENT ON COLUMN opportunities.probability IS 'Percentage chance of closing (0-100)';
COMMENT ON COLUMN site_visits.visit_date IS 'Scheduled date and time for the site visit';