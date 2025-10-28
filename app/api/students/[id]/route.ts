import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const { id } = await params

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
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching student:', error)
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ student })

  } catch (error) {
    console.error('Student GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const { id } = await params
    const body = await request.json()

    const { name, tm_number, ic_number, current_grade_id, class_id, remarks } = body

    if (!name || !tm_number || !ic_number || current_grade_id === undefined || current_grade_id === null || class_id === undefined || class_id === null) {
      return NextResponse.json(
        { error: 'Name, TM Number, IC Number, Grade, and Class are required' },
        { status: 400 }
      )
    }

    // Check if there's already an active student with this tm_number (excluding current student)
    const { data: existingStudentByTM } = await supabase
      .from('students')
      .select('id, tm_number, is_active')
      .eq('tm_number', tm_number)
      .eq('is_active', true)
      .neq('id', id)
      .single()

    if (existingStudentByTM) {
      return NextResponse.json(
        { error: 'TM Number already exists for an active student. Please use a different TM Number.' },
        { status: 409 }
      )
    }

    // Check if there's already an active student with this ic_number (excluding current student)
    const { data: existingStudentByIC } = await supabase
      .from('students')
      .select('id, ic_number, is_active')
      .eq('ic_number', ic_number)
      .eq('is_active', true)
      .neq('id', id)
      .single()

    if (existingStudentByIC) {
      return NextResponse.json(
        { error: 'IC Number already exists for an active student. Please use a different IC Number.' },
        { status: 409 }
      )
    }

    const { data: student, error } = await supabase
      .from('students')
      .update({
        name,
        tm_number,
        ic_number,
        current_grade_id: parseInt(current_grade_id),
        class_id: parseInt(class_id),
        remarks: remarks || null
      })
      .eq('id', id)
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
        )
      `)
      .single()

    if (error) {
      console.error('Error updating student:', error)
      return NextResponse.json(
        { error: 'Failed to update student' },
        { status: 500 }
      )
    }

    return NextResponse.json({ student })

  } catch (error) {
    console.error('Student PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const { id } = await params

    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error soft deleting student:', error)
      return NextResponse.json(
        { error: 'Failed to delete student' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Student deleted successfully' })

  } catch (error) {
    console.error('Student DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
