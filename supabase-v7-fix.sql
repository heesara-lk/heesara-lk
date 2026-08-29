-- Add missing columns for body features
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skin_color text;

-- Ensure permissions
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE interests DISABLE ROW LEVEL SECURITY;
ALTER TABLE expectations DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Fix interests policies
DROP POLICY IF EXISTS "Allow all interests" ON interests;
CREATE POLICY "Allow all interests" ON interests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

SELECT 'v7 columns ready' as message;
