import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { student_id, year, month, payment_date } = body

    if (!student_id || !year || month === undefined) {
      return NextResponse.json(
        { error: 'Student ID, year, and month are required' },
        { status: 400 }
      )
    }

    const paymentData = {
      student_id,
      year: parseInt(year),
      month: parseInt(month), // 0 for renewal, 1-12 for monthly payments
      payment_date: payment_date || null
    }

    const { data: payment, error } = await supabase
      .from('payment_records')
      .upsert(paymentData, { 
        onConflict: 'student_id,year,month',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating payment:', error)
      return NextResponse.json(
        { error: 'Failed to save payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ payment }, { status: 201 })

  } catch (error) {
    console.error('Payments POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { id, payment_date } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const { data: payment, error } = await supabase
      .from('payment_records')
      .update({
        payment_date: payment_date || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment:', error)
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ payment })

  } catch (error) {
    console.error('Payments PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('payment_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting payment:', error)
      return NextResponse.json(
        { error: 'Failed to delete payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Payment deleted successfully' })

  } catch (error) {
    console.error('Payments DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}