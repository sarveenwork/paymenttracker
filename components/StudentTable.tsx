'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Student, Grade, Class } from '@/lib/types'
import { GradeBadge } from './GradeBadge'
import { ClassBadge } from './ClassBadge'
import { Edit, Trash2, Eye, CreditCard } from 'lucide-react'
import { StudentDetailsModal } from './StudentDetailsModal'
import { PaymentModal } from './PaymentModal'

interface StudentTableProps {
  students: Student[]
  grades: Grade[]
  classes: Class[]
  onEdit: (studentId: string, data: any) => Promise<void>
  onDelete: (studentId: string) => void
  onView: (student: Student) => void
  onUpdatePayment: (studentId: string, paymentData: any) => Promise<void>
  onSimplePayment: (student: Student) => void
  isLoading?: boolean
}

export function StudentTable({ students, grades, classes, onEdit, onDelete, onView, onUpdatePayment, onSimplePayment, isLoading }: StudentTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const handleEditDetails = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const handleEditPayment = (student: Student) => {
    setSelectedStudent(student)
    setIsPaymentModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsDetailsModalOpen(false)
    setIsPaymentModalOpen(false)
    setSelectedStudent(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-gray-500 text-lg">No students found</div>
        <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
      </motion.div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TM Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IC Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {students.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredRow(student.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.student_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.tm_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.ic_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <GradeBadge grade={student.grades as Grade} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ClassBadge classData={student.classes as Class} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {student.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onView(student)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditDetails(student)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Edit Details"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditPayment(student)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Edit Payment"
                        >
                          <CreditCard className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(student.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.student_id}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <GradeBadge grade={student.grades as Grade} />
                  <ClassBadge classData={student.classes as Class} />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">TM Number:</span>
                  <span className="text-sm font-medium">{student.tm_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">IC Number:</span>
                  <span className="text-sm font-medium">{student.ic_number}</span>
                </div>
                {student.remarks && (
                  <div>
                    <span className="text-sm text-gray-500">Remarks:</span>
                    <p className="text-sm text-gray-700 mt-1">{student.remarks}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onView(student)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900 border border-blue-200 rounded"
                >
                  View
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditDetails(student)}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-200 rounded"
                >
                  Edit Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditPayment(student)}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-900 border border-green-200 rounded"
                >
                  Payment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSimplePayment(student)}
                  className="px-3 py-1 text-sm text-purple-600 hover:text-purple-900 border border-purple-200 rounded"
                >
                  Quick Pay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(student.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-900 border border-red-200 rounded"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <StudentDetailsModal
        student={selectedStudent}
        grades={grades}
        classes={classes}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        onSave={async (data: any) => {
          if (selectedStudent) {
            await onEdit(selectedStudent.id, data)
          }
        }}
      />
      
      <PaymentModal
        student={selectedStudent}
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModals}
        onUpdatePayment={onUpdatePayment}
      />
    </div>
  )
}
