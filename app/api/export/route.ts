import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()

    // Fetch students with payment records
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
      .eq('is_active', true)
      .order('name')

    // Filter payment records by year
    if (students) {
      students.forEach((student: any) => {
        if (student.payment_records) {
          student.payment_records = student.payment_records.filter((payment: any) => payment.year === parseInt(year))
        }
      })
    }

    if (error) {
      console.error('Error fetching students for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data for export' },
        { status: 500 }
      )
    }

    // Convert to Excel format matching import template structure
    const exportData = students.map(student => {
      // Create payment dates object for months 0-12
      const paymentDates: { [month: number]: string } = {}
      
      student.payment_records.forEach((payment: any) => {
        if (payment.payment_date) {
          paymentDates[payment.month] = payment.payment_date
        }
      })

      // Build row data matching import template structure
      const rowData: any = {
        'Student Name': student.name,
        'TM Number': student.tm_number,
        'IC Number': student.ic_number,
        'Grade': student.grades?.grade_name?.replace(' Grade', '') || 'N/A',
        'Class': student.classes?.class_name || 'N/A',
        'Month 0 (Renewal)': paymentDates[0] || '',
        'Month 1': paymentDates[1] || '',
        'Month 2': paymentDates[2] || '',
        'Month 3': paymentDates[3] || '',
        'Month 4': paymentDates[4] || '',
        'Month 5': paymentDates[5] || '',
        'Month 6': paymentDates[6] || '',
        'Month 7': paymentDates[7] || '',
        'Month 8': paymentDates[8] || '',
        'Month 9': paymentDates[9] || '',
        'Month 10': paymentDates[10] || '',
        'Month 11': paymentDates[11] || '',
        'Month 12': paymentDates[12] || '',
        'Remarks': student.remarks || ''
      }

      return rowData
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Add main data sheet
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths matching import template
    const columnWidths = [
      { wch: 20 }, // Student Name
      { wch: 15 }, // TM Number
      { wch: 15 }, // IC Number
      { wch: 15 }, // Grade
      { wch: 15 }, // Class
      { wch: 18 }, // Month 0 (Renewal)
      { wch: 12 }, // Month 1
      { wch: 12 }, // Month 2
      { wch: 12 }, // Month 3
      { wch: 12 }, // Month 4
      { wch: 12 }, // Month 5
      { wch: 12 }, // Month 6
      { wch: 12 }, // Month 7
      { wch: 12 }, // Month 8
      { wch: 12 }, // Month 9
      { wch: 12 }, // Month 10
      { wch: 12 }, // Month 11
      { wch: 12 }, // Month 12
      { wch: 30 }  // Remarks
    ]
    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Add grades reference sheet
    const gradesResult = await supabase.from('grades').select('*').order('id', { ascending: true })
    if (gradesResult.data) {
      const gradesSheet = XLSX.utils.json_to_sheet(
        gradesResult.data.map(g => ({ 'Grade Name': g.grade_name.replace(' Grade', '') }))
      )
      gradesSheet['!cols'] = [{ wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, gradesSheet, 'Grades')
    }

    // Add classes reference sheet
    const classesResult = await supabase.from('classes').select('*').order('id', { ascending: true })
    if (classesResult.data) {
      const classesSheet = XLSX.utils.json_to_sheet(
        classesResult.data.map(c => ({ 'Class Name': c.class_name }))
      )
      classesSheet['!cols'] = [{ wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, classesSheet, 'Classes')
    }

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="students-export-${year}.xlsx"`,
        'Content-Length': excelBuffer.length.toString()
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