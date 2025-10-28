'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Grade, Class } from '@/lib/types'
import { X, Save, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

const addStudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tm_number: z.string().min(1, 'TM Number is required'),
  ic_number: z.string().min(1, 'IC Number is required'),
  current_grade_id: z.string().min(1, 'Grade is required'),
  class_id: z.string().min(1, 'Class is required'),
  remarks: z.string().optional()
})

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  grades: Grade[]
  classes: Class[]
}

export function AddStudentModal({ isOpen, onClose, onSave, grades, classes }: AddStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '',
      tm_number: '',
      ic_number: '',
      current_grade_id: '',
      class_id: '',
      remarks: ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await onSave({
        ...data,
        current_grade_id: parseInt(data.current_grade_id),
        class_id: parseInt(data.class_id)
      })
      toast.success('Student added successfully')
      reset()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add student'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl mx-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Add New Student</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        {...register('name')}
                        placeholder="Enter student's full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TM Number *
                      </label>
                      <input
                        {...register('tm_number')}
                        placeholder="Enter TM Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.tm_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.tm_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IC Number *
                      </label>
                      <input
                        {...register('ic_number')}
                        placeholder="Enter IC Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.ic_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.ic_number.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Grade *
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class *
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
                        placeholder="Any additional notes about the student..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onClick={handleClose}
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
                  <span>{isLoading ? 'Adding...' : 'Add Student'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
