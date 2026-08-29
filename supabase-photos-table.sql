-- Photo upload table - Run this in Supabase SQL Editor
create table if not exists profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- Disable RLS for testing (you have it disabled, but keep)
ALTER TABLE profile_photos DISABLE ROW LEVEL SECURITY;

-- Grant permissions (fixes 42501)
GRANT ALL ON TABLE profile_photos TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Storage bucket already exists, but ensure public
INSERT INTO storage.buckets (id, name, public) VALUES ('heesara-photos','heesara-photos', true) ON CONFLICT (id) DO NOTHING;

-- Allow public read and anon upload for testing
DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload" ON storage.objects;
DROP POLICY IF EXISTS "Public read photos fixed" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload fixed" ON storage.objects;

CREATE POLICY "Allow public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'heesara-photos');
CREATE POLICY "Allow anon upload photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'heesara-photos');
CREATE POLICY "Allow anon delete photos" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'heesara-photos');

-- Test
SELECT 'Photo table ready!' as message;
