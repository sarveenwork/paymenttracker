-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  grade_name TEXT NOT NULL,
  grade_level VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  class_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT UNIQUE NOT NULL,
  tm_number TEXT NOT NULL,
  ic_number TEXT NOT NULL,
  name TEXT NOT NULL,
  current_grade_id INTEGER REFERENCES grades(id),
  class_id INTEGER REFERENCES classes(id),
  remarks TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  payment_date DATE,
  renewal_payment DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, year, month)
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert grades data
INSERT INTO grades (grade_name, grade_level) VALUES
('White Grade', '9'),
('Yellow Grade', '8'),
('Yellow 2 Grade', '7'),
('Green Grade', '6'),
('Green 2 Grade', '5'),
('Blue Grade', '4'),
('Blue 2 Grade', '3'),
('Red Grade', '2'),
('Red 2 Grade', '1'),
('1st Dan', '1st Dan'),
('2nd Dan', '2nd Dan'),
('3rd Dan', '3rd Dan'),
('4th Dan', '4th Dan'),
('5th Dan', '5th Dan'),
('6th Dan', '6th Dan'),
('7th Dan', '7th Dan'),
('8th Dan', '8th Dan'),
('9th Dan', '9th Dan')
ON CONFLICT (grade_level) DO NOTHING;

-- Insert sample classes data
INSERT INTO classes (class_name) VALUES
('Main Class'),
('Mak Mandin'),
('Kuala Prai')
ON CONFLICT (class_name) DO NOTHING;

-- Insert default admin (password: RajenTehLeenVeen)
-- Note: You'll need to hash this password using bcrypt before inserting
INSERT INTO admins (username, password_hash, name) VALUES
('admin', '$2b$10$7CLK29qtLBOo.Nr2kU7QIurWK8uwlKuFQl7Q9fY4LgkAaE8iHD07u', 'Admin User')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_tm_number ON students(tm_number);
CREATE INDEX IF NOT EXISTS idx_students_ic_number ON students(ic_number);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_grade_id ON students(current_grade_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_records_student_year ON payment_records(student_id, year);
CREATE INDEX IF NOT EXISTS idx_payment_records_year_month ON payment_records(year, month);

-- Create partial unique index for tm_number only for active students
-- This allows duplicate tm_number for inactive/deleted students
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_tm_number_active 
ON students(tm_number) 
WHERE is_active = TRUE;

-- Create partial unique index for ic_number only for active students
-- This allows duplicate ic_number for inactive/deleted students
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_ic_number_active 
ON students(ic_number) 
WHERE is_active = TRUE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
