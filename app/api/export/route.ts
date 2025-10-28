import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()

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
        payment_records!inner (
          id,
          year,
          month,
          payment_date,
          renewal_payment
        )
      `)
      .eq('payment_records.year', parseInt(year))
      .order('name')

    if (error) {
      console.error('Error fetching students for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data for export' },
        { status: 500 }
      )
    }

    // Convert to CSV format
    const csvHeaders = [
      'Student ID',
      'TM Number',
      'IC Number',
      'Name',
      'Current Grade',
      'Class',
      'January',
      'January Date',
      'February',
      'February Date',
      'March',
      'March Date',
      'April',
      'April Date',
      'May',
      'May Date',
      'June',
      'June Date',
      'July',
      'July Date',
      'August',
      'August Date',
      'September',
      'September Date',
      'October',
      'October Date',
      'November',
      'November Date',
      'December',
      'December Date',
      'Renewal Payment',
      'Renewal Payment Date',
      'Remarks'
    ]

    const csvRows = students.map(student => {
      const payments = student.payment_records.reduce((acc: any, payment: any) => {
        acc[payment.month] = {
          status: payment.payment_date ? 'Paid' : 'Unpaid',
          date: payment.payment_date || ''
        }
        return acc
      }, {})

      // Find renewal payment for the current year
      const renewalPayment = student.payment_records.find((p: any) => p.renewal_payment)

      return [
        student.student_id,
        student.tm_number,
        student.ic_number,
        student.name,
        student.grades?.grade_name || 'N/A',
        student.classes?.class_name || 'N/A',
        payments[1]?.status || 'Unpaid',
        payments[1]?.date || '',
        payments[2]?.status || 'Unpaid',
        payments[2]?.date || '',
        payments[3]?.status || 'Unpaid',
        payments[3]?.date || '',
        payments[4]?.status || 'Unpaid',
        payments[4]?.date || '',
        payments[5]?.status || 'Unpaid',
        payments[5]?.date || '',
        payments[6]?.status || 'Unpaid',
        payments[6]?.date || '',
        payments[7]?.status || 'Unpaid',
        payments[7]?.date || '',
        payments[8]?.status || 'Unpaid',
        payments[8]?.date || '',
        payments[9]?.status || 'Unpaid',
        payments[9]?.date || '',
        payments[10]?.status || 'Unpaid',
        payments[10]?.date || '',
        payments[11]?.status || 'Unpaid',
        payments[11]?.date || '',
        payments[12]?.status || 'Unpaid',
        payments[12]?.date || '',
        renewalPayment ? 'Yes' : 'No',
        renewalPayment?.renewal_payment || '',
        student.remarks || ''
      ]
    })

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="students-${year}.csv"`
      }
    })

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
