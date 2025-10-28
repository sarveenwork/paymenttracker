'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Class } from '@/lib/types'
import { 
  X, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const classSchema = z.object({
  class_name: z.string().min(1, 'Class name is required').max(100, 'Class name too long')
})

interface ClassesModalProps {
  isOpen: boolean
  onClose: () => void
  onClassesUpdate: () => void
}

export function ClassesModal({ isOpen, onClose, onClassesUpdate }: ClassesModalProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: {
      class_name: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      fetchClasses()
    }
  }, [isOpen])

  const fetchClasses = async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingClass) {
        // Update existing class
        const response = await fetch(`/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          toast.success('Class updated successfully')
          await fetchClasses()
          onClassesUpdate()
          resetForm()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update class')
        }
      } else {
        // Create new class
        const response = await fetch('/api/classes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          toast.success('Class created successfully')
          await fetchClasses()
          onClassesUpdate()
          resetForm()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create class')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setValue('class_name', classItem.class_name)
  }

  const handleDelete = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Class deleted successfully')
        await fetchClasses()
        onClassesUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete class')
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Failed to delete class')
    }
  }

  const resetForm = () => {
    reset()
    setEditingClass(null)
  }

  const handleClose = () => {
    resetForm()
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
            className="fixed inset-4 z-50 bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Manage Classes</h2>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Add/Edit Form */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingClass ? 'Edit Class' : 'Add New Class'}
                    </h3>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class Name *
                        </label>
                        <input
                          {...register('class_name')}
                          placeholder="Enter class name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.class_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.class_name.message}</p>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>
                            {isSubmitting 
                              ? (editingClass ? 'Updating...' : 'Creating...') 
                              : (editingClass ? 'Update Class' : 'Create Class')
                            }
                          </span>
                        </motion.button>
                        
                        {editingClass && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </motion.button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Classes List */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Classes</h3>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : classes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No classes found</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {classes.map((classItem) => (
                          <motion.div
                            key={classItem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{classItem.class_name}</h4>
                              <p className="text-sm text-gray-500">
                                Created {new Date(classItem.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEdit(classItem)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit class"
                              >
                                <Edit className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(classItem.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete class"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Important Notes</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Class names must be unique</li>
                        <li>• You cannot delete a class that has active students assigned to it</li>
                        <li>• Changes will be reflected immediately in the system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
