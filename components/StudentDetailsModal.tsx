'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Student, Grade, Class } from '@/lib/types'
import { X, Save, User } from 'lucide-react'
import toast from 'react-hot-toast'

const studentDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tm_number: z.string().min(1, 'TM Number is required'),
  ic_number: z.string().min(1, 'IC Number is required'),
  current_grade_id: z.string().min(1, 'Grade is required'),
  class_id: z.string().min(1, 'Class is required'),
  remarks: z.string().optional()
})

interface StudentDetailsModalProps {
  student: Student | null
  grades: Grade[]
  classes: Class[]
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export function StudentDetailsModal({
  student,
  grades,
  classes,
  isOpen,
  onClose,
  onSave
}: StudentDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(studentDetailsSchema),
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
      toast.success('Student details updated successfully!')
      onClose()
    } catch (error) {
      console.error('Error updating student:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student details'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !student) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Student Details
              </h2>
              <p className="text-sm text-gray-500">
                Update student information and grade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                {...register('remarks')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about the student..."
              />
              {errors.remarks && (
                <p className="text-red-500 text-sm mt-1">{errors.remarks.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
