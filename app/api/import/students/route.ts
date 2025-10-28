import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateStudentId } from '@/lib/utils'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in the Excel file' },
        { status: 400 }
      )
    }

    // Fetch grades and classes for validation
    const [gradesResult, classesResult] = await Promise.all([
      supabase.from('grades').select('*').order('id', { ascending: true }),
      supabase.from('classes').select('*').order('id', { ascending: true })
    ])

    if (gradesResult.error || classesResult.error) {
      return NextResponse.json(
        { error: 'Failed to fetch reference data' },
        { status: 500 }
      )
    }

    const grades = gradesResult.data
    const classes = classesResult.data

    // Create lookup maps
    const gradeMap = new Map(grades.map(g => [g.grade_name.toLowerCase(), g.id]))
    const gradeMapWithoutGrade = new Map(grades.map(g => [g.grade_name.replace(' Grade', '').toLowerCase(), g.id]))
    const classMap = new Map(classes.map(c => [c.class_name.toLowerCase(), c.id]))

    const results = {
      success: 0,
      errors: [] as string[],
      skipped: 0
    }

    const studentsToInsert = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // Excel row number (accounting for header)

      try {
        // Validate required fields
        const name = row['Student Name']?.toString().trim()
        const tmNumber = row['TM Number']?.toString().trim()
        const icNumber = row['IC Number']?.toString().trim()
        const gradeName = row['Grade']?.toString().trim()
        const className = row['Class']?.toString().trim()
        const remarks = row['Remarks']?.toString().trim()

        // Extract payment dates for months 0-12
        const paymentDates: { [month: number]: Date | null } = {}
        for (let month = 0; month <= 12; month++) {
          const columnName = month === 0 ? 'Month 0 (Renewal)' : `Month ${month}`
          const dateValue = row[columnName]?.toString().trim()
          if (dateValue) {
            const parsedDate = new Date(dateValue)
            if (!isNaN(parsedDate.getTime())) {
              paymentDates[month] = parsedDate
            } else {
              results.errors.push(`Row ${rowNumber}: Invalid date format in ${columnName}: "${dateValue}". Use YYYY-MM-DD format`)
              continue
            }
          }
        }

        if (!name || !tmNumber || !icNumber || !gradeName || !className) {
          results.errors.push(`Row ${rowNumber}: Missing required fields`)
          continue
        }

        // Validate grade
        const gradeId = gradeMap.get(gradeName.toLowerCase()) || gradeMapWithoutGrade.get(gradeName.toLowerCase())
        if (!gradeId) {
          results.errors.push(`Row ${rowNumber}: Invalid grade "${gradeName}". Available grades: ${grades.map(g => g.grade_name.replace(' Grade', '')).join(', ')}`)
          continue
        }

        // Validate class
        const classId = classMap.get(className.toLowerCase())
        if (!classId) {
          results.errors.push(`Row ${rowNumber}: Invalid class "${className}". Available classes: ${classes.map(c => c.class_name).join(', ')}`)
          continue
        }


        // Check for duplicates
        const { data: existingStudentByTM } = await supabase
          .from('students')
          .select('id')
          .eq('tm_number', tmNumber)
          .eq('is_active', true)
          .single()

        if (existingStudentByTM) {
          results.errors.push(`Row ${rowNumber}: TM Number "${tmNumber}" already exists`)
          continue
        }

        const { data: existingStudentByIC } = await supabase
          .from('students')
          .select('id')
          .eq('ic_number', icNumber)
          .eq('is_active', true)
          .single()

        if (existingStudentByIC) {
          results.errors.push(`Row ${rowNumber}: IC Number "${icNumber}" already exists`)
          continue
        }

        // Prepare student data
        const studentData = {
          student_id: generateStudentId(),
          tm_number: tmNumber,
          ic_number: icNumber,
          name: name,
          current_grade_id: gradeId,
          class_id: classId,
          remarks: remarks || null,
          is_active: true,
          paymentDates: paymentDates
        }
        
        studentsToInsert.push(studentData)

      } catch (error) {
        results.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Insert students and payment records
    if (studentsToInsert.length > 0) {
      // Prepare student data for insertion (without payment data)
      const studentInsertData = studentsToInsert.map(student => ({
        student_id: student.student_id,
        tm_number: student.tm_number,
        ic_number: student.ic_number,
        name: student.name,
        current_grade_id: student.current_grade_id,
        class_id: student.class_id,
        remarks: student.remarks,
        is_active: student.is_active
      }))

      const { data: insertedStudents, error: insertError } = await supabase
        .from('students')
        .insert(studentInsertData)
        .select('id, student_id')

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to insert students: ' + insertError.message },
          { status: 500 }
        )
      }

      // Create payment records for students with payment dates
      const paymentRecordsToInsert = []
      const currentYear = new Date().getFullYear()
      
      for (let i = 0; i < insertedStudents.length; i++) {
        const student = insertedStudents[i]
        const originalStudentData = studentsToInsert[i]
        
        // Create payment records for all months with payment dates (0-12)
        for (let month = 0; month <= 12; month++) {
          if (originalStudentData.paymentDates[month]) {
            paymentRecordsToInsert.push({
              student_id: student.id,
              year: currentYear,
              month: month,
              payment_date: originalStudentData.paymentDates[month]
            })
          }
        }
      }

      // Insert payment records if any
      if (paymentRecordsToInsert.length > 0) {
        const { error: paymentInsertError } = await supabase
          .from('payment_records')
          .insert(paymentRecordsToInsert)

        if (paymentInsertError) {
          console.error('Payment records insertion error:', paymentInsertError)
          // Don't fail the entire import if payment records fail
        }
      }

      results.success = studentsToInsert.length
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} students imported successfully.`,
      results
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
