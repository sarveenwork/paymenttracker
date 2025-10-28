-- Migration script to update payment_records table for month 0 renewal payments
-- Run this in your Supabase SQL editor

-- Step 1: Update the month constraint to allow month 0
ALTER TABLE payment_records 
DROP CONSTRAINT IF EXISTS payment_records_month_check;

ALTER TABLE payment_records 
ADD CONSTRAINT payment_records_month_check 
CHECK (month >= 0 AND month <= 12); -- 0 = renewal, 1-12 = monthly

-- Step 2: Migrate existing renewal_payment data to month 0 records
-- First, create new records for existing renewal payments
INSERT INTO payment_records (student_id, year, month, payment_date, created_at, updated_at)
SELECT 
    student_id,
    year,
    0 as month, -- Month 0 for renewal payments
    renewal_payment as payment_date,
    created_at,
    updated_at
FROM payment_records 
WHERE renewal_payment IS NOT NULL;

-- Step 3: Remove the renewal_payment column
ALTER TABLE payment_records 
DROP COLUMN IF EXISTS renewal_payment;

-- Step 4: Add comment to clarify month 0 usage
COMMENT ON COLUMN payment_records.month IS 'Month number: 0 = renewal payment, 1-12 = monthly payments';

-- Step 5: Verify the changes
-- Check that month constraint allows 0-12
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'payment_records'::regclass 
AND conname = 'payment_records_month_check';

-- Check that renewal_payment column is removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payment_records' 
AND column_name = 'renewal_payment';

-- Check sample data to verify migration worked
SELECT 
    student_id,
    year,
    month,
    payment_date,
    CASE 
        WHEN month = 0 THEN 'Renewal Payment'
        ELSE 'Monthly Payment'
    END as payment_type
FROM payment_records 
WHERE month = 0 
LIMIT 5;
