import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if admin exists in our custom admins table
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single()

    if (adminError || !admin) {
      console.error('Admin not found:', adminError)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    if (!isValidPassword) {
      console.error('Invalid password for admin:', username)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return success with admin data (no Supabase Auth needed)
    return NextResponse.json({
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: 'admin'
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
