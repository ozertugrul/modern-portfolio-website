-- Portfolio Database Schema with SQL Injection Protection
-- All queries use parameterized statements in the application layer

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url VARCHAR(500),
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    huggingface_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- About information table (singleton)
CREATE TABLE IF NOT EXISTS about_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    email VARCHAR(255) NOT NULL,
    github VARCHAR(500),
    linkedin VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resume data table (singleton)
CREATE TABLE IF NOT EXISTS resume_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_info JSONB NOT NULL,
    section_order JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    summary_enabled BOOLEAN DEFAULT false,
    skills JSONB DEFAULT '[]'::jsonb,
    skills_enabled BOOLEAN DEFAULT true,
    soft_skills JSONB DEFAULT '[]'::jsonb,
    soft_skills_enabled BOOLEAN DEFAULT true,
    education JSONB DEFAULT '[]'::jsonb,
    education_enabled BOOLEAN DEFAULT true,
    experience JSONB DEFAULT '[]'::jsonb,
    experience_enabled BOOLEAN DEFAULT true,
    projects JSONB DEFAULT '[]'::jsonb,
    projects_enabled BOOLEAN DEFAULT true,
    languages JSONB DEFAULT '[]'::jsonb,
    languages_enabled BOOLEAN DEFAULT true,
    certifications JSONB DEFAULT '[]'::jsonb,
    certifications_enabled BOOLEAN DEFAULT true,
    awards JSONB DEFAULT '[]'::jsonb,
    awards_enabled BOOLEAN DEFAULT true,
    publications JSONB DEFAULT '[]'::jsonb,
    publications_enabled BOOLEAN DEFAULT true,
    volunteer JSONB DEFAULT '[]'::jsonb,
    volunteer_enabled BOOLEAN DEFAULT true,
    interests JSONB DEFAULT '[]'::jsonb,
    interests_enabled BOOLEAN DEFAULT true,
    resume_references JSONB DEFAULT '[]'::jsonb,
    references_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locale VARCHAR(10) NOT NULL,
    translations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(locale)
);

-- Footer settings table (singleton)
CREATE TABLE IF NOT EXISTS footer_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_tr TEXT NOT NULL,
    text_en TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    show_backend BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Features settings table (singleton)
CREATE TABLE IF NOT EXISTS features_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performance_tr JSONB NOT NULL,
    performance_en JSONB NOT NULL,
    scalable_tr JSONB NOT NULL,
    scalable_en JSONB NOT NULL,
    secure_tr JSONB NOT NULL,
    secure_en JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hero section table (singleton)
CREATE TABLE IF NOT EXISTS hero_section (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    greeting_tr VARCHAR(255) NOT NULL,
    greeting_en VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    title_tr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Visitor logs table
CREATE TABLE IF NOT EXISTS visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip VARCHAR(50) NOT NULL,
    user_agent TEXT,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    referer VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backups metadata table
CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON portfolio_items(display_order);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created ON visitor_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON visitor_logs(ip);
CREATE INDEX IF NOT EXISTS idx_backups_created ON backups(created_at DESC);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$12$VqCYr/oT6PlmDX5sZO7cn.cbvZ6jEv8EudahbgJgjD61yi3XfZcKu')
ON CONFLICT (username) DO NOTHING;

-- Insert default footer settings
INSERT INTO footer_settings (text_tr, text_en, enabled, show_backend)
VALUES (
    '© 2025 Ertu. Rust ile geliştirildi.',
    '© 2025 Ertu. Built with Rust.',
    true,
    false
)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_info_updated_at BEFORE UPDATE ON about_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_data_updated_at BEFORE UPDATE ON resume_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_settings_updated_at BEFORE UPDATE ON footer_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_settings_updated_at BEFORE UPDATE ON features_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_section_updated_at BEFORE UPDATE ON hero_section
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO portfolio_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO portfolio_user;
