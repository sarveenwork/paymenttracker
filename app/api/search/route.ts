import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    if (!search) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        grades:current_grade_id (
          id,
          grade_name,
          grade_level
        ),
        classes:class_id (
          id,
          class_name
        ),
        payment_records (
          id,
          year,
          month,
          payment_date
        )
      `)
      .or(`name.ilike.%${search}%,tm_number.ilike.%${search}%,ic_number.ilike.%${search}%`)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error searching students:', error)
      return NextResponse.json(
        { error: 'Failed to search students' },
        { status: 500 }
      )
    }

    return NextResponse.json({ students })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
