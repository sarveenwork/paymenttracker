import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    if (!envCheck.NEXT_PUBLIC_SUPABASE_URL || !envCheck.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Missing environment variables',
        envCheck,
        message: 'Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables'
      }, { status: 500 })
    }

    // Test database connection
    const supabase = createClient()
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('grades')
      .select('count')
      .limit(1)

    if (testError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code,
        hint: testError.hint
      }, { status: 500 })
    }

    // Test fetching data
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('*')
      .limit(5)

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        grades: grades || [],
        classes: classes || [],
        gradesCount: grades?.length || 0,
        classesCount: classes?.length || 0
      },
      envCheck
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
