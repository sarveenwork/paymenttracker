-- Optional: Enable RLS for extra security
-- Run these commands in Supabase SQL Editor if you want RLS enabled

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow public read access to grades and classes (needed for dropdowns)
CREATE POLICY "Allow public read on grades" ON grades FOR SELECT USING (true);
CREATE POLICY "Allow public read on classes" ON classes FOR SELECT USING (true);

-- Allow public search by IC number only
CREATE POLICY "Allow public IC search" ON students FOR SELECT 
USING (is_active = true);

-- Admin policies (requires authentication)
CREATE POLICY "Admin full access to students" ON students FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to payment_records" ON payment_records FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to admins" ON admins FOR ALL 
USING (auth.role() = 'authenticated');
