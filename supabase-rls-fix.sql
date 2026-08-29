-- Fix permission denied for profiles
-- Run this in Supabase SQL Editor

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Public view profiles" ON profiles;
DROP POLICY IF EXISTS "Owner insert" ON profiles;
DROP POLICY IF EXISTS "Owner update" ON profiles;
DROP POLICY IF EXISTS "Public read districts" ON districts;
DROP POLICY IF EXISTS "Public read cities" ON cities;

-- Make districts/cities public readable (no auth needed)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow all read cities" ON cities FOR SELECT USING (true);

-- Fix profiles: allow authenticated users to insert/update/select their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public read all" ON profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated delete own" ON profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix expectations
ALTER TABLE expectations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read expectations" ON expectations;
CREATE POLICY "Allow all" ON expectations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read" ON expectations FOR SELECT TO anon USING (true);

-- Fix contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read contacts" ON contacts;
CREATE POLICY "Allow all contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Fix interests
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all interests" ON interests;
CREATE POLICY "Allow all interests" ON interests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('heesara-photos','heesara-photos', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload" ON storage.objects;
CREATE POLICY "Public read photos fixed" ON storage.objects FOR SELECT USING (bucket_id = 'heesara-photos');
CREATE POLICY "Auth upload fixed" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'heesara-photos');
