import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id } = await params

    const { class_name } = body

    if (!class_name || !class_name.trim()) {
      return NextResponse.json(
        { error: 'Class name is required' },
        { status: 400 }
      )
    }

    // Convert to uppercase
    const uppercaseClassName = class_name.trim().toUpperCase()

    // Check if class already exists (excluding current class)
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('class_name', uppercaseClassName)
      .neq('id', id)
      .single()

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this name already exists' },
        { status: 409 }
      )
    }

    const { data: updatedClass, error } = await supabase
      .from('classes')
      .update({ class_name: uppercaseClassName })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating class:', error)
      return NextResponse.json(
        { error: 'Failed to update class' },
        { status: 500 }
      )
    }

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ class: updatedClass })

  } catch (error) {
    console.error('Classes PUT API error:', error)
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

    // Check if any students are using this class
    const { data: studentsUsingClass } = await supabase
      .from('students')
      .select('id')
      .eq('class_id', id)
      .eq('is_active', true)
      .limit(1)

    if (studentsUsingClass && studentsUsingClass.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete class that is assigned to active students' },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting class:', error)
      return NextResponse.json(
        { error: 'Failed to delete class' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Class deleted successfully' })

  } catch (error) {
    console.error('Classes DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
