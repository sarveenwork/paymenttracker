import bcrypt from 'bcryptjs'

// This script helps you create the hashed password for the admin user
// Run this with: npx tsx scripts/seed-admin.ts

async function hashPassword() {
  const password = 'RajenTehLeenVeen'
  const saltRounds = 10
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('Hashed password for RajenTehLeenVeen:')
    console.log(hashedPassword)
    console.log('\nUse this in your Supabase SQL editor:')
    console.log(`INSERT INTO admins (username, password_hash, name) VALUES ('admin', '${hashedPassword}', 'Admin User');`)
  } catch (error) {
    console.error('Error hashing password:', error)
  }
}

hashPassword()
