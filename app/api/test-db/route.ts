import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Missing environment variables',
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }, { status: 500 })
    }

    const supabase = createClient()

    // Test admin table
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('id, username, name, created_at')
      .limit(5)

    if (adminError) {
      return NextResponse.json({
        error: 'Admin table error',
        details: adminError.message,
        code: adminError.code,
        hint: adminError.hint
      }, { status: 500 })
    }

    // Test grades table
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('id, grade_name')
      .limit(5)

    // Test classes table
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, class_name')
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        admins: admins || [],
        grades: grades || [],
        classes: classes || [],
        adminCount: admins?.length || 0,
        gradesCount: grades?.length || 0,
        classesCount: classes?.length || 0
      },
      errors: {
        gradesError: gradesError?.message,
        classesError: classesError?.message
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
