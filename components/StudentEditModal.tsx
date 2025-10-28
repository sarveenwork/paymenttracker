'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Student, Grade, Class, PaymentRecord, StudentWithPayments } from '@/lib/types'
import { GradeBadge } from './GradeBadge'
import { formatDate, getMonthName } from '@/lib/utils'
import { X, Calendar, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tm_number: z.string().min(1, 'TM Number is required'),
  ic_number: z.string().min(1, 'IC Number is required'),
  current_grade_id: z.string().min(1, 'Grade is required'),
  class_id: z.string().min(1, 'Class is required'),
  remarks: z.string().optional()
})

interface StudentEditModalProps {
  student: Student | null
  grades: Grade[]
  classes: Class[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  onUpdatePayment: (studentId: string, year: number, month?: number, paymentDate?: string, renewalDate?: string) => Promise<void>
}

export function StudentEditModal({ 
  student, 
  grades, 
  classes,
  isOpen, 
  onClose, 
  onSave, 
  onUpdatePayment 
}: StudentEditModalProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      tm_number: '',
      ic_number: '',
      current_grade_id: '',
      class_id: '',
      remarks: ''
    }
  })

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        tm_number: student.tm_number,
        ic_number: student.ic_number,
        current_grade_id: student.current_grade_id.toString(),
        class_id: student.class_id.toString(),
        remarks: student.remarks || ''
      })
    }
  }, [student, reset])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await onSave({
        ...data,
        current_grade_id: parseInt(data.current_grade_id),
        class_id: parseInt(data.class_id)
      })
      toast.success('Student updated successfully')
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentUpdate = async (month?: number, paymentDate?: string, renewalDate?: string) => {
    if (!student) return
    
    try {
      await onUpdatePayment(student.id, selectedYear, month, paymentDate, renewalDate)
      toast.success('Payment updated successfully')
    } catch (error) {
      toast.error('Failed to update payment')
    }
  }

  const getPaymentForMonth = (month: number): PaymentRecord | undefined => {
    const studentWithPayments = student as StudentWithPayments
    return studentWithPayments?.payment_records?.find(p => p.year === selectedYear && p.month === month)
  }

  const markPaidToday = (month: number) => {
    const today = new Date().toISOString().split('T')[0]
    handlePaymentUpdate(month, today)
  }

  if (!student) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Edit Student</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        {...register('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TM Number
                      </label>
                      <input
                        {...register('tm_number')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.tm_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.tm_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IC Number
                      </label>
                      <input
                        {...register('ic_number')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.ic_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.ic_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <select
                        {...register('current_grade_id')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Grade</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.grade_name}
                          </option>
                        ))}
                      </select>
                      {errors.current_grade_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.current_grade_id.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class
                      </label>
                      <select
                        {...register('class_id')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Class</option>
                        {classes.map((classItem) => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.class_name}
                          </option>
                        ))}
                      </select>
                      {errors.class_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.class_id.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      {...register('remarks')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Year Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Year
                    </label>
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
                  </div>

                  {/* Monthly Payment Grid */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Payments - {selectedYear}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1
                        const payment = getPaymentForMonth(month)
                        
                        return (
                          <motion.div
                            key={month}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-4 border rounded-lg ${
                              payment?.payment_date 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="text-center">
                              <h4 className="font-medium text-gray-900">{getMonthName(month)}</h4>
                              <div className="mt-2">
                                {payment?.payment_date ? (
                                  <div className="text-green-600 text-sm">
                                    ✅ Paid
                                    <div className="text-xs text-gray-500">
                                      {formatDate(payment.payment_date)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-red-600 text-sm">❌ Unpaid</div>
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => markPaidToday(month)}
                                className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Mark Paid Today
                              </motion.button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Renewal Payment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renewal Payment Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        defaultValue={(student as StudentWithPayments)?.payment_records?.find(p => p.year === selectedYear && p.renewal_payment)?.renewal_payment || ''}
                        onChange={(e) => {
                          const studentWithPayments = student as StudentWithPayments
                          if (studentWithPayments.payment_records?.[0]) {
                            handlePaymentUpdate(
                              studentWithPayments.payment_records[0].month,
                              studentWithPayments.payment_records[0].payment_date,
                              e.target.value
                            )
                          } else {
                            // Handle renewal payment update for the current year
                            handlePaymentUpdate(undefined, undefined, e.target.value)
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
