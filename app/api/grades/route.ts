import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: grades, error } = await supabase
      .from('grades')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching grades:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch grades',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Grades fetched successfully:', grades?.length || 0, 'grades')
    return NextResponse.json({ grades: grades || [] })

  } catch (error) {
    console.error('Grades API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
