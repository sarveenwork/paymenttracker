import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching classes:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch classes',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    console.log('Classes fetched successfully:', classes?.length || 0, 'classes')
    return NextResponse.json({ classes: classes || [] })

  } catch (error) {
    console.error('Classes API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { class_name } = body

    if (!class_name || !class_name.trim()) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      )
    }

    // Check if class already exists
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('class_name', class_name.trim())
      .single()

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this name already exists' },
        { status: 409 }
      )
    }

    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({ class_name: class_name.trim() })
      .select()
      .single()

    if (error) {
      console.error('Error creating class:', error)
      return NextResponse.json(
        { error: 'Failed to create class' },
        { status: 500 }
      )
    }

    return NextResponse.json({ class: newClass }, { status: 201 })

  } catch (error) {
    console.error('Classes POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
