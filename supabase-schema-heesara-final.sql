-- Heesara.lk v1 Final Schema
create table if not exists districts (name_en text primary key, name_si text not null, province text);
insert into districts values 
('Ampara','අම්පාර','Eastern'),('Anuradhapura','අනුරාධපුර','North Central'),
('Badulla','බදුල්ල','Uva'),('Batticaloa','මඩකලපුව','Eastern'),
('Colombo','කොළඹ','Western'),('Galle','ගාල්ල','Southern'),
('Gampaha','ගම්පහ','Western'),('Hambantota','හම්බන්තොට','Southern'),
('Jaffna','යාපනය','Northern'),('Kalutara','කළුතර','Western'),
('Kandy','මහනුවර','Central'),('Kegalle','කෑගල්ල','Sabaragamuwa'),
('Kilinochchi','කිලිනොච්චිය','Northern'),('Kurunegala','කුරුණෑගල','North Western'),
('Mannar','මන්නාරම','Northern'),('Matale','මාතලේ','Central'),
('Matara','මාතර','Southern'),('Monaragala','මොණරාගල','Uva'),
('Mullaitivu','මුලතිව්','Northern'),('Nuwara Eliya','නුවරඑළිය','Central'),
('Polonnaruwa','පොළොන්නරුව','North Central'),('Puttalam','පුත්තලම','North Western'),
('Ratnapura','රත්නපුර','Sabaragamuwa'),('Trincomalee','ත්‍රිකුණාමලය','Eastern'),
('Vavuniya','වව්නියාව','Northern') on conflict do nothing;

create table if not exists cities (id serial primary key, district_en text references districts(name_en), city_si text, city_en text, lat float, lng float);
insert into cities (district_en, city_si, city_en, lat, lng) values
('Colombo','කොළඹ','Colombo',6.9271,79.8612),('Colombo','දෙහිවල','Dehiwala',6.8560,79.8655),
('Colombo','මොරටුව','Moratuwa',6.7731,79.8816),('Gampaha','ගම්පහ','Gampaha',7.0917,79.9995),
('Gampaha','මීගමුව','Negombo',7.2083,79.8358),('Kalutara','කළුතර','Kalutara',6.5854,79.9607),
('Kalutara','පානදුර','Panadura',6.7132,79.9047),('Kandy','මහනුවර','Kandy',7.2906,80.6337),
('Kandy','පේරාදෙනිය','Peradeniya',7.2680,80.5972),('Matale','මාතලේ','Matale',7.4675,80.6234),
('Matale','දඹුල්ල','Dambulla',7.8742,80.6511),('Nuwara Eliya','නුවරඑළිය','Nuwara Eliya',6.9497,80.7891),
('Nuwara Eliya','හැටන්','Hatton',6.8916,80.5952),('Galle','ගාල්ල','Galle',6.0535,80.2210),
('Matara','මාතර','Matara',5.9549,80.5550),('Matara','වැලිගම','Weligama',5.9730,80.4298),
('Hambantota','හම්බන්තොට','Hambantota',6.1240,81.1185),('Hambantota','තංගල්ල','Tangalle',6.0240,80.7919),
('Kurunegala','කුරුණෑගල','Kurunegala',7.4863,80.3623),('Kurunegala','කුලියාපිටිය','Kuliyapitiya',7.4685,80.0408),
('Puttalam','පුත්තලම','Puttalam',8.0343,79.8420),('Puttalam','හලාවත','Chilaw',7.5757,79.7945),
('Anuradhapura','අනුරාධපුර','Anuradhapura',8.3114,80.4037),('Polonnaruwa','පොළොන්නරුව','Polonnaruwa',7.9403,81.0188),
('Ratnapura','රත්නපුර','Ratnapura',6.7056,80.3847),('Ratnapura','ඇඹිලිපිටිය','Embilipitiya',6.3436,80.8504),
('Badulla','බදුල්ල','Badulla',6.9934,81.0540),('Badulla','බණ්ඩාරවෙල','Bandarawela',6.8251,81.0559),
('Monaragala','මොණරාගල','Monaragala',6.8728,81.3507),('Ampara','අම්පාර','Ampara',7.2975,81.6747),
('Batticaloa','මඩකලපුව','Batticaloa',7.7102,81.6924),('Trincomalee','ත්‍රිකුණාමලය','Trincomalee',8.5874,81.2152),
('Jaffna','යාපනය','Jaffna',9.6615,80.0255),('Kilinochchi','කිලිනොච්චිය','Kilinochchi',9.3803,80.3770),
('Mullaitivu','මුලතිව්','Mullaitivu',9.2675,80.8146),('Mannar','මන්නාරම','Mannar',8.9800,79.9043),
('Vavuniya','වව්නියාව','Vavuniya',8.7522,80.4982),('Kegalle','කෑගල්ල','Kegalle',7.2514,80.3464)
on conflict do nothing;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  account_type text not null, full_name text not null, gender text not null,
  dob date not null, tob time not null,
  pob_district_en text references districts(name_en), pob_city_en text not null,
  pob_lat float, pob_lng float, lagna text, rashi text, nakshatra text, porondam_data jsonb,
  job_main text not null, job_custom text, education text, height_cm int,
  body_type text, skin_color text, ethnicity text, religion text,
  caste_main text, caste_custom text, caste_considered boolean default false,
  district_en text references districts(name_en), bio text,
  is_verified boolean default false, is_paid boolean default false,
  free_slot_number int, created_at timestamptz default now()
);
create table if not exists expectations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade unique,
  job_required text default 'any', job_pref_main text, job_pref_custom text,
  age_min int default 18, age_max int default 60, height_min int, height_max int,
  skin_pref text, ethnicity_pref text, caste_pref_main text, caste_pref_custom text,
  horoscope_required boolean default true, min_porondam int default 10,
  district_pref_en text, created_at timestamptz default now()
);
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade unique,
  email text not null, phone text, whatsapp text, is_visible boolean default false,
  created_at timestamptz default now()
);
create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  from_profile uuid references profiles(id) on delete cascade,
  to_profile uuid references profiles(id) on delete cascade,
  status text default 'pending', compatibility_score int, porondam_score int,
  created_at timestamptz default now(), unique(from_profile, to_profile)
);
insert into storage.buckets (id, name, public) values ('heesara-photos','heesara-photos', true) on conflict (id) do nothing;
alter table profiles enable row level security;
alter table expectations enable row level security;
alter table contacts enable row level security;
alter table districts enable row level security;
alter table cities enable row level security;
create policy "Public read districts" on districts for select using (true);
create policy "Public read cities" on cities for select using (true);
create policy "Public view profiles" on profiles for select using (true);
create policy "Owner insert" on profiles for insert with check (auth.uid() = user_id);
create policy "Owner update" on profiles for update using (auth.uid() = user_id);
create policy "Public read photos" on storage.objects for select using (bucket_id = 'heesara-photos');
create policy "Auth upload" on storage.objects for insert with check (bucket_id = 'heesara-photos' and auth.role()='authenticated');
create or replace function get_free_slots_count() returns int as $$ select count(*)::int from profiles where free_slot_number is not null; $$ language sql;
