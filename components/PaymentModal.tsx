'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Student, PaymentRecord, StudentWithPayments } from '@/lib/types'
import { X, Save, CreditCard, Calendar, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, getMonthName } from '@/lib/utils'

interface PaymentModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onUpdatePayment: (studentId: string, paymentData: any) => Promise<void>
  onDeletePayment: (paymentId: string) => Promise<void>
}

export function PaymentModal({
  student,
  isOpen,
  onClose,
  onUpdatePayment,
  onDeletePayment
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [renewalPaymentDate, setRenewalPaymentDate] = useState('')
  const [monthlyPaymentDates, setMonthlyPaymentDates] = useState<{ [month: number]: string }>({})

  const getExistingPayment = (month: number) => {
    const studentWithPayments = student as StudentWithPayments
    return studentWithPayments?.payment_records?.find(p => p.year === parseInt(selectedYear) && p.month === month)
  }

  const getRenewalPayment = () => {
    const studentWithPayments = student as StudentWithPayments
    return studentWithPayments?.payment_records?.find(p => p.year === parseInt(selectedYear) && p.month === 0)
  }

  const getMonthlyPaymentDate = (month: number) => {
    const payment = getExistingPayment(month)
    return payment?.payment_date || ''
  }

  const getRenewalPaymentDate = () => {
    const payment = getRenewalPayment()
    return payment?.payment_date || ''
  }

  const onSubmitRenewal = async () => {
    if (!student) return

    setIsLoading(true)
    try {
      await onUpdatePayment(student.id, {
        year: parseInt(selectedYear),
        month: 0, // Month 0 represents renewal payment
        payment_date: renewalPaymentDate
      })
      toast.success('Renewal payment updated successfully!')
    } catch (error) {
      console.error('Error updating renewal payment:', error)
      toast.error('Failed to update renewal payment')
    } finally {
      setIsLoading(false)
    }
  }

  const updateMonthlyPayment = async (month: number, paymentDate: string) => {
    if (!student) return

    setIsLoading(true)
    try {
      await onUpdatePayment(student.id, {
        year: parseInt(selectedYear),
        month: month,
        payment_date: paymentDate
      })
      
      toast.success(`${getMonthName(month)} payment updated successfully!`)
    } catch (error) {
      console.error('Error updating monthly payment:', error)
      toast.error('Failed to update monthly payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId: string, monthName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the payment for ${monthName}? This action cannot be undone.`)) {
      return
    }
    
    setIsDeleting(true)
    try {
      await onDeletePayment(paymentId)
      toast.success('Payment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete payment')
    } finally {
      setIsDeleting(false)
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Payment Management
              </h2>
              <p className="text-sm text-gray-500">
                {student.name} - Update monthly payments
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

        <div className="p-6">
          {/* Year Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={isLoading || isDeleting}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Renewal Payment Section */}
          <div className="mb-8">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Renewal Payment</h3>
                  <p className="text-sm text-purple-700">Annual renewal payment for {selectedYear}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renewal Payment Date
                  </label>
                  <input
                    type="date"
                    value={getRenewalPaymentDate()}
                    onChange={(e) => setRenewalPaymentDate(e.target.value)}
                    disabled={isLoading || isDeleting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <button
                  onClick={onSubmitRenewal}
                  disabled={isLoading || isDeleting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Update Renewal Payment</span>
                    </>
                  )}
                </button>
                
                {getRenewalPaymentDate() && (
                  <button
                    onClick={() => {
                      const renewalPayment = getRenewalPayment()
                      if (renewalPayment) {
                        handleDeletePayment(renewalPayment.id, 'Renewal')
                      }
                    }}
                    disabled={isLoading || isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Renewal Payment</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Payment Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Payments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1
                const existingPayment = getExistingPayment(month)
                
                return (
                  <div key={month} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {getMonthName(month)}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {existingPayment?.payment_date && (
                          <span className="text-xs text-gray-500">
                            {formatDate(existingPayment.payment_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          value={monthlyPaymentDates[month] || getMonthlyPaymentDate(month)}
                          onChange={(e) => setMonthlyPaymentDates(prev => ({
                            ...prev,
                            [month]: e.target.value
                          }))}
                          disabled={isLoading || isDeleting}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button
                        onClick={() => updateMonthlyPayment(month, monthlyPaymentDates[month] || getMonthlyPaymentDate(month))}
                        disabled={isLoading || isDeleting || !(monthlyPaymentDates[month] || getMonthlyPaymentDate(month))}
                        className="w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Update'}
                      </button>
                      
                      {existingPayment?.payment_date && (
                        <button
                          onClick={() => handleDeletePayment(existingPayment.id, getMonthName(month))}
                          disabled={isLoading || isDeleting}
                          className="w-full px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                        >
                          {isDeleting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Payment Summary for {selectedYear}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Months:</span>
                <span className="ml-2 font-medium">12</span>
              </div>
              <div>
                <span className="text-gray-600">Paid Months:</span>
                <span className="ml-2 font-medium text-green-600">
                  {Array.from({ length: 12 }, (_, i) => i + 1).filter(month => getMonthlyPaymentDate(month)).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Renewal Payment:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {getRenewalPaymentDate() ? 'Paid' : 'Not Paid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
