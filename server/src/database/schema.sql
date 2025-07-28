-- Signature Properties CRM Database Schema
-- PostgreSQL Database Schema for Web Installer

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Project Manager', 'Sales Executive', 'Telecaller')),
    project_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    avatar TEXT,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    total_units INTEGER,
    available_units INTEGER,
    price_range_min DECIMAL(15,2),
    price_range_max DECIMAL(15,2),
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100) NOT NULL,
    project_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Unqualified')),
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    requirements TEXT,
    notes TEXT,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    assigned_to INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    stage VARCHAR(50) DEFAULT 'Scheduled' CHECK (stage IN ('Scheduled', 'Visit Done', 'Negotiation', 'Booking', 'Lost')),
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    visit_date TIMESTAMP WITH TIME ZONE,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    assigned_to INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    opportunity_id INTEGER,
    project_id INTEGER NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
    notes TEXT,
    feedback TEXT,
    assigned_to INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interactions table for tracking communications
CREATE TABLE IF NOT EXISTS interactions (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    opportunity_id INTEGER,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'sms')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    outcome VARCHAR(100),
    notes TEXT,
    duration VARCHAR(20),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    -- Users table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_created_by_fkey') THEN
        ALTER TABLE users ADD CONSTRAINT users_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Projects table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_created_by_fkey') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Leads table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_project_id_fkey') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_assigned_to_fkey') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_created_by_fkey') THEN
        ALTER TABLE leads ADD CONSTRAINT leads_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Opportunities table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_lead_id_fkey') THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_lead_id_fkey 
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_project_id_fkey') THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_assigned_to_fkey') THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'opportunities_created_by_fkey') THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Site visits table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_visits_lead_id_fkey') THEN
        ALTER TABLE site_visits ADD CONSTRAINT site_visits_lead_id_fkey 
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_visits_opportunity_id_fkey') THEN
        ALTER TABLE site_visits ADD CONSTRAINT site_visits_opportunity_id_fkey 
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_visits_project_id_fkey') THEN
        ALTER TABLE site_visits ADD CONSTRAINT site_visits_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_visits_assigned_to_fkey') THEN
        ALTER TABLE site_visits ADD CONSTRAINT site_visits_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_visits_created_by_fkey') THEN
        ALTER TABLE site_visits ADD CONSTRAINT site_visits_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
    
    -- Interactions table constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interactions_lead_id_fkey') THEN
        ALTER TABLE interactions ADD CONSTRAINT interactions_lead_id_fkey 
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interactions_opportunity_id_fkey') THEN
        ALTER TABLE interactions ADD CONSTRAINT interactions_opportunity_id_fkey 
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interactions_created_by_fkey') THEN
        ALTER TABLE interactions ADD CONSTRAINT interactions_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;
END $$;

-- Add unique constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_phone_lead') THEN
        ALTER TABLE leads ADD CONSTRAINT unique_phone_lead UNIQUE(phone);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_lead_opportunity') THEN
        ALTER TABLE opportunities ADD CONSTRAINT unique_lead_opportunity UNIQUE(lead_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_project_name') THEN
        ALTER TABLE projects ADD CONSTRAINT unique_project_name UNIQUE(name);
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_project_id') THEN
        CREATE INDEX idx_leads_project_id ON leads(project_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_assigned_to') THEN
        CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_status') THEN
        CREATE INDEX idx_leads_status ON leads(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_phone') THEN
        CREATE INDEX idx_leads_phone ON leads(phone);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_opportunities_lead_id') THEN
        CREATE INDEX idx_opportunities_lead_id ON opportunities(lead_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_opportunities_stage') THEN
        CREATE INDEX idx_opportunities_stage ON opportunities(stage);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON users(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_active') THEN
        CREATE INDEX idx_users_active ON users(active);
    END IF;
END $$;

-- Create or replace function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at 
        BEFORE UPDATE ON projects 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_updated_at') THEN
        CREATE TRIGGER update_leads_updated_at 
        BEFORE UPDATE ON leads 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_opportunities_updated_at') THEN
        CREATE TRIGGER update_opportunities_updated_at 
        BEFORE UPDATE ON opportunities 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create views for common queries (drop and recreate to ensure consistency)
DROP VIEW IF EXISTS leads_with_details;
CREATE VIEW leads_with_details AS
SELECT 
    l.*,
    p.name as project_name,
    p.location as project_location,
    u.name as assigned_to_name
FROM leads l
LEFT JOIN projects p ON l.project_id = p.id
LEFT JOIN users u ON l.assigned_to = u.id;

DROP VIEW IF EXISTS opportunities_with_details;
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