'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Student, PaymentRecord, StudentWithPayments } from '@/lib/types'
import { X, Check, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, getMonthName } from '@/lib/utils'

interface SimplePaymentModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onUpdatePayment: (studentId: string, year: number, month?: number, paymentDate?: string, renewalDate?: string) => Promise<void>
  onDeletePayment: (paymentId: string) => Promise<void>
}

export function SimplePaymentModal({
  student,
  isOpen,
  onClose,
  onUpdatePayment,
  onDeletePayment
}: SimplePaymentModalProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)

  const getPaymentForMonth = (month: number): PaymentRecord | undefined => {
    const studentWithPayments = student as StudentWithPayments
    return studentWithPayments?.payment_records?.find(p => p.year === selectedYear && p.month === month)
  }

  const togglePayment = async (month: number) => {
    if (!student) return
    
    setIsLoading(true)
    try {
      const existingPayment = getPaymentForMonth(month)
      const paymentDate = existingPayment?.payment_date ? undefined : new Date().toISOString().split('T')[0]
      
      await onUpdatePayment(student.id, selectedYear, month, paymentDate, undefined)
      toast.success(paymentDate ? 'Payment marked as paid' : 'Payment marked as unpaid')
    } catch (error) {
      toast.error('Failed to update payment')
    } finally {
      setIsLoading(false)
    }
  }

  const getRenewalPayment = () => {
    // Find renewal payment for the current year (month 0)
    const studentWithPayments = student as StudentWithPayments
    return studentWithPayments?.payment_records?.find(p => p.year === selectedYear && p.month === 0)
  }

  const updateRenewalPayment = async (renewalDate: string) => {
    if (!student) return
    
    setIsLoading(true)
    try {
      // Update renewal payment for the current year
      await onUpdatePayment(student.id, selectedYear, undefined, undefined, renewalDate)
      toast.success('Renewal payment updated')
    } catch (error) {
      toast.error('Failed to update renewal payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId: string, monthName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the payment for ${monthName}? This action cannot be undone.`)) {
      return
    }
    
    setIsLoading(true)
    try {
      await onDeletePayment(paymentId)
      toast.success('Payment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete payment')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !student) return null

  const renewalPayment = getRenewalPayment()

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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Payment Management
            </h2>
            <p className="text-sm text-gray-500">
              {student.name} - Simple Payment Toggle
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Year Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Renewal Payment */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Renewal Payment for {selectedYear}</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Payment Date
                </label>
                <input
                  type="date"
                  value={renewalPayment?.payment_date || ''}
                  onChange={(e) => updateRenewalPayment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {renewalPayment?.payment_date && (
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-green-600 text-sm">
                    ✅ Renewal Paid: {formatDate(renewalPayment.payment_date)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePayment(renewalPayment.id, 'Renewal')
                    }}
                    className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Payment Grid */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Payments - {selectedYear}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1
                const payment = getPaymentForMonth(month)
                const isPaid = !!payment?.payment_date
                
                return (
                  <motion.div
                    key={month}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isPaid 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => togglePayment(month)}
                  >
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">{getMonthName(month)}</h4>
                      <div className="flex items-center justify-center mb-2">
                        {isPaid ? (
                          <Check className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm">
                        {isPaid ? (
                          <div className="text-green-600">
                            <div className="font-medium">Paid</div>
                            <div className="text-xs text-gray-500 mb-2">
                              {formatDate(payment.payment_date!)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePayment(payment.id, getMonthName(month))
                              }}
                              className="mt-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded transition-colors flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-red-600 font-medium">Unpaid</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Payment Summary for {selectedYear}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Months:</span>
                <span className="ml-2 font-medium">12</span>
              </div>
              <div>
                <span className="text-gray-600">Paid Months:</span>
                <span className="ml-2 font-medium text-green-600">
                  {Array.from({ length: 12 }, (_, i) => i + 1).filter(month => getPaymentForMonth(month)?.payment_date).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
