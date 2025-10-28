import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const ic_number = searchParams.get('ic_number')

    if (!ic_number) {
      return NextResponse.json(
        { error: 'IC Number is required' },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS for public search
    const { data: student, error } = await supabase
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
          payment_date,
          renewal_payment
        )
      `)
      .eq('ic_number', ic_number)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error searching student by IC:', error)
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ student })

  } catch (error) {
    console.error('Public search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
