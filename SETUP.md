# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration (optional)
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## How to Get Supabase Keys

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API
3. Copy the Project URL and paste it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the anon/public key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the service_role key and paste it as `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase-schema.sql` to create tables and seed data
4. The script will create all necessary tables and insert sample data

## Default Admin Credentials

- **Username**: admin
- **Password**: RajenTehLeenVeen

The password is already hashed in the SQL script, so you can use these credentials immediately after running the schema.
