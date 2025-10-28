import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateStudentId, generateTMNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const year = searchParams.get('year')
    const class_id = searchParams.get('class_id')

    let query = supabase
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

    if (search) {
      query = query.or(`name.ilike.%${search}%,tm_number.ilike.%${search}%,ic_number.ilike.%${search}%`)
    }

    if (year) {
      query = query.eq('payment_records.year', parseInt(year))
    }

    if (class_id) {
      query = query.eq('class_id', parseInt(class_id))
    }

    // Only show active students by default
    query = query.eq('is_active', true)

    const { data: students, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    return NextResponse.json({ students })

  } catch (error) {
    console.error('Students GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { name, tm_number, ic_number, current_grade_id, class_id, remarks } = body

    if (!name || !tm_number || !ic_number || !current_grade_id || !class_id) {
      return NextResponse.json(
        { error: 'Name, TM Number, IC Number, Grade, and Class are required' },
        { status: 400 }
      )
    }

    // Check if there's already an active student with this tm_number
    const { data: existingStudentByTM } = await supabase
      .from('students')
      .select('id, tm_number, is_active')
      .eq('tm_number', tm_number)
      .eq('is_active', true)
      .single()

    if (existingStudentByTM) {
      return NextResponse.json(
        { error: 'TM Number already exists for an active student. Please use a different TM Number.' },
        { status: 409 }
      )
    }

    // Check if there's already an active student with this ic_number
    const { data: existingStudentByIC } = await supabase
      .from('students')
      .select('id, ic_number, is_active')
      .eq('ic_number', ic_number)
      .eq('is_active', true)
      .single()

    if (existingStudentByIC) {
      return NextResponse.json(
        { error: 'IC Number already exists for an active student. Please use a different IC Number.' },
        { status: 409 }
      )
    }

    const studentData = {
      student_id: generateStudentId(),
      tm_number,
      ic_number,
      name,
      current_grade_id: parseInt(current_grade_id),
      class_id: parseInt(class_id),
      remarks: remarks || null,
      is_active: true
    }

    const { data: student, error } = await supabase
      .from('students')
      .insert(studentData)
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
      console.error('Error creating student:', error)
      return NextResponse.json(
        { error: 'Failed to create student' },
        { status: 500 }
      )
    }

    return NextResponse.json({ student }, { status: 201 })

  } catch (error) {
    console.error('Students POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
