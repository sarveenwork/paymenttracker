'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { debounce } from 'lodash'
import { Student, Grade, Class } from '@/lib/types'
import { StudentTable } from '@/components/StudentTable'
import { StudentEditModal } from '@/components/StudentEditModal'
import { AddStudentModal } from '@/components/AddStudentModal'
import { SimplePaymentModal } from '@/components/SimplePaymentModal'
import { ImportModal } from '@/components/ImportModal'
import { ClassesModal } from '@/components/ClassesModal'
import { 
  Search, 
  Plus, 
  Download, 
  LogOut, 
  Users, 
  User,
  Calendar,
  Upload,
  Settings,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSimplePaymentModalOpen, setIsSimplePaymentModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
    fetchGrades()
    fetchClasses()
  }, [selectedYear, selectedClass])

  const fetchStudents = async (searchTerm?: string) => {
    try {
      const params = new URLSearchParams()
      if (searchTerm && searchTerm.length >= 4) {
        params.append('search', searchTerm)
      }
      if (selectedYear) params.append('year', selectedYear.toString())
      if (selectedClass) params.append('class_id', selectedClass.toString())

      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
      } else {
        toast.error(data.error || 'Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to fetch students')
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.length >= 4) {
        fetchStudents(searchTerm)
      } else if (searchTerm.length === 0) {
        fetchStudents()
      }
    }, 3000),
    [selectedYear, selectedClass]
  )

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades')
      const data = await response.json()

      if (response.ok) {
        setGrades(data.grades)
      } else {
        toast.error(data.error || 'Failed to fetch grades')
      }
    } catch (error) {
      console.error('Error fetching grades:', error)
      toast.error('Failed to fetch grades')
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      const data = await response.json()

      if (response.ok) {
        setClasses(data.classes)
      } else {
        toast.error(data.error || 'Failed to fetch classes')
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to fetch classes')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    fetchStudents()
  }

  const handleAddStudent = async (data: any) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchStudents()
        setIsAddModalOpen(false)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add student')
      }
    } catch (error) {
      console.error('Error adding student:', error)
      throw error
    }
  }

  const handleUpdateStudent = async (data: any) => {
    if (!selectedStudent) return

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchStudents()
        setIsEditModalOpen(false)
        setSelectedStudent(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  const handleUpdateStudentFromTable = async (studentId: string, data: any) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await fetchStudents()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  const handleUpdatePayment = async (studentId: string, year: number, month?: number, paymentDate?: string, renewalDate?: string) => {
    try {
      // If renewalDate is provided, send it as month 0
      const paymentMonth = renewalDate ? 0 : month
      const finalPaymentDate = renewalDate || paymentDate

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          year,
          month: paymentMonth,
          payment_date: finalPaymentDate
        })
      })

      if (response.ok) {
        await fetchStudents()
        
        // Update selectedStudent with fresh data if modal is open
        if (selectedStudent && selectedStudent.id === studentId) {
          const response = await fetch(`/api/students/${studentId}`)
          if (response.ok) {
            const data = await response.json()
            setSelectedStudent(data.student)
          }
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      throw error
    }
  }

  const handleUpdatePaymentFromTable = async (studentId: string, paymentData: any) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          ...paymentData
        })
      })

      if (response.ok) {
        await fetchStudents()
        
        // Update selectedStudent with fresh data if modal is open
        if (selectedStudent && selectedStudent.id === studentId) {
          const response = await fetch(`/api/students/${studentId}`)
          if (response.ok) {
            const data = await response.json()
            setSelectedStudent(data.student)
          }
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update payment')
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      throw error
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments?id=${paymentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStudents()
        
        // Update selectedStudent with fresh data if modal is open
        if (selectedStudent) {
          const response = await fetch(`/api/students/${selectedStudent.id}`)
          if (response.ok) {
            const data = await response.json()
            setSelectedStudent(data.student)
          }
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete payment')
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStudents()
        toast.success('Student deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export?year=${selectedYear}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `students-export-${selectedYear}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Excel export completed successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Payment Tracker</h1>
                <p className="text-sm text-gray-500">Manage students and payments</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/search"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Student Search
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsClassesModalOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Classes</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by name, TM Number, or IC Number (min 4 characters)..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
                <select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Excel Operations Dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === 'export-csv') {
                      handleExport()
                    } else if (value === 'import-excel') {
                      setIsImportModalOpen(true)
                    }
                    e.target.value = '' // Reset selection
                  }}
                  className="appearance-none px-4 py-2 pr-8 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Excel Operations</option>
                  <option value="export-csv">📊 Export CSV</option>
                  <option value="import-excel">📥 Import Excel</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StudentTable
            students={students}
            grades={grades}
            classes={classes}
            onEdit={handleUpdateStudentFromTable}
            onDelete={handleDeleteStudent}
            onUpdatePayment={handleUpdatePaymentFromTable}
            onDeletePayment={handleDeletePayment}
            onSimplePayment={(student) => {
              setSelectedStudent(student)
              setIsSimplePaymentModalOpen(true)
            }}
            isLoading={isLoading}
          />
        </motion.div>
      </main>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddStudent}
        grades={grades}
        classes={classes}
      />

      <StudentEditModal
        key={`edit-${selectedStudent?.id}-${(selectedStudent as any)?.payment_records?.length || 0}`}
        student={selectedStudent}
        grades={grades}
        classes={classes}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedStudent(null)
        }}
        onSave={handleUpdateStudent}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
      />

      <SimplePaymentModal
        key={`simple-${selectedStudent?.id}-${(selectedStudent as any)?.payment_records?.length || 0}`}
        student={selectedStudent}
        isOpen={isSimplePaymentModalOpen}
        onClose={() => {
          setIsSimplePaymentModalOpen(false)
          setSelectedStudent(null)
        }}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={fetchStudents}
      />

      <ClassesModal
        isOpen={isClassesModalOpen}
        onClose={() => setIsClassesModalOpen(false)}
        onClassesUpdate={fetchClasses}
      />

    </div>
  )
}
