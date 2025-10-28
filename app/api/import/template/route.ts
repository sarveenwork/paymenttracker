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
        'TM Number': 'TM123456',
        'IC Number': '123456789012',
        'Grade': 'White Grade',
        'Class': 'Main Class',
        'Remarks': 'Sample student'
      },
      {
        'Student Name': 'Jane Smith',
        'TM Number': 'TM789012',
        'IC Number': '987654321098',
        'Grade': 'Yellow Grade',
        'Class': 'Mak Mandin',
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
      { wch: 20 }, // Grade
      { wch: 15 }, // Class
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
    const dataRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:F3')
    for (let row = dataRange.s.r + 1; row <= dataRange.e.r; row++) {
      // Grade validation (column D)
      const gradeCell = XLSX.utils.encode_cell({ r: row, c: 3 })
      if (!worksheet[gradeCell]) worksheet[gradeCell] = { t: 's', v: '' }
      worksheet[gradeCell].dataValidation = gradeValidation
      
      // Class validation (column E)
      const classCell = XLSX.utils.encode_cell({ r: row, c: 4 })
      if (!worksheet[classCell]) worksheet[classCell] = { t: 's', v: '' }
      worksheet[classCell].dataValidation = classValidation
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')

    // Add grades reference sheet
    const gradesSheet = XLSX.utils.json_to_sheet(
      grades.map(g => ({ 'Grade Name': g.grade_name }))
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
