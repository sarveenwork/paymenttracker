import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { student_id, year, month, payment_date, renewal_payment } = body

    if (!student_id || !year) {
      return NextResponse.json(
        { error: 'Student ID and year are required' },
        { status: 400 }
      )
    }

    // Handle renewal payment (only needs year, not month)
    if (renewal_payment && !month) {
      // Find any existing payment record for this year to update renewal
      const { data: existingPayments } = await supabase
        .from('payment_records')
        .select('*')
        .eq('student_id', student_id)
        .eq('year', parseInt(year))
        .limit(1)

      if (existingPayments && existingPayments.length > 0) {
        // Update existing record with renewal payment
        const { data: payment, error } = await supabase
          .from('payment_records')
          .update({
            renewal_payment: renewal_payment
          })
          .eq('id', existingPayments[0].id)
          .select()
          .single()

        if (error) {
          console.error('Error updating renewal payment:', error)
          return NextResponse.json(
            { error: 'Failed to update renewal payment' },
            { status: 500 }
          )
        }

        return NextResponse.json({ payment }, { status: 200 })
      } else {
        // Create new record for renewal payment (using month 1 as placeholder)
        const paymentData = {
          student_id,
          year: parseInt(year),
          month: 1,
          payment_date: null,
          renewal_payment: renewal_payment
        }

        const { data: payment, error } = await supabase
          .from('payment_records')
          .insert(paymentData)
          .select()
          .single()

        if (error) {
          console.error('Error creating renewal payment:', error)
          return NextResponse.json(
            { error: 'Failed to create renewal payment' },
            { status: 500 }
          )
        }

        return NextResponse.json({ payment }, { status: 201 })
      }
    }

    // Handle monthly payment
    if (!month) {
      return NextResponse.json(
        { error: 'Month is required for monthly payments' },
        { status: 400 }
      )
    }

    const paymentData = {
      student_id,
      year: parseInt(year),
      month: parseInt(month),
      payment_date: payment_date || null,
      renewal_payment: null
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

    const { id, payment_date, renewal_payment } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const { data: payment, error } = await supabase
      .from('payment_records')
      .update({
        payment_date: payment_date || null,
        renewal_payment: renewal_payment || null
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
