import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Fetch grades and classes for the template
    const [gradesResult, classesResult] = await Promise.all([
      supabase.from('grades').select('*').order('id', { ascending: true }),
      supabase.from('classes').select('*').order('id', { ascending: true })
    ])

    if (gradesResult.error || classesResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch template data' },
        { status: 500 }
      )
    }

    const grades = gradesResult.data
    const classes = classesResult.data

    // Create sample data for the template
    const sampleData = [
      {
        'Student Name': 'John Doe',
        'TM Number': '123456',
        'IC Number': '123456789012',
        'Grade': 'White',
        'Class': 'Main Class',
        'Month 0 (Renewal)': '2024-01-20',
        'Month 1': '2024-01-15',
        'Month 2': '',
        'Month 3': '',
        'Month 4': '',
        'Month 5': '',
        'Month 6': '',
        'Month 7': '',
        'Month 8': '',
        'Month 9': '',
        'Month 10': '',
        'Month 11': '',
        'Month 12': '',
        'Remarks': 'Sample student'
      },
      {
        'Student Name': 'Jane Smith',
        'TM Number': '789012',
        'IC Number': '987654321098',
        'Grade': 'Yellow',
        'Class': 'Mak Mandin',
        'Month 0 (Renewal)': '',
        'Month 1': '',
        'Month 2': '2024-02-20',
        'Month 3': '',
        'Month 4': '',
        'Month 5': '',
        'Month 6': '',
        'Month 7': '',
        'Month 8': '',
        'Month 9': '',
        'Month 10': '',
        'Month 11': '',
        'Month 12': '',
        'Remarks': 'Another sample student'
      }
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Add main data sheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    
    // Set column widths
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

    // Add data validation for Grade column (column D)
    const gradeValidation = {
      type: 'list',
      allowBlank: false,
      formula: `Grades!$A$2:$A$${grades.length + 1}`,
      showErrorMessage: true,
      errorTitle: 'Invalid Grade',
      error: 'Please select a valid grade from the dropdown list.'
    }
    
    // Add data validation for Class column (column E)
    const classValidation = {
      type: 'list',
      allowBlank: false,
      formula: `Classes!$A$2:$A$${classes.length + 1}`,
      showErrorMessage: true,
      errorTitle: 'Invalid Class',
      error: 'Please select a valid class from the dropdown list.'
    }

    // Apply validations to the data range (excluding header row)
    const dataRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:S3')
    for (let row = dataRange.s.r + 1; row <= dataRange.e.r; row++) {
      // Grade validation (column E)
      const gradeCell = XLSX.utils.encode_cell({ r: row, c: 4 })
      if (!worksheet[gradeCell]) worksheet[gradeCell] = { t: 's', v: '' }
      worksheet[gradeCell].dataValidation = gradeValidation
      
      // Class validation (column F)
      const classCell = XLSX.utils.encode_cell({ r: row, c: 5 })
      if (!worksheet[classCell]) worksheet[classCell] = { t: 's', v: '' }
      worksheet[classCell].dataValidation = classValidation
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Add grades reference sheet
    const gradesSheet = XLSX.utils.json_to_sheet(
      grades.map(g => ({ 'Grade Name': g.grade_name.replace(' Grade', '') }))
    )
    gradesSheet['!cols'] = [{ wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, gradesSheet, 'Grades')

    // Add classes reference sheet
    const classesSheet = XLSX.utils.json_to_sheet(
      classes.map(c => ({ 'Class Name': c.class_name }))
    )
    classesSheet['!cols'] = [{ wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, classesSheet, 'Classes')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return the file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="students-import-template.xlsx"',
        'Content-Length': excelBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
