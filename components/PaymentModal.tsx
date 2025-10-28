'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Student, PaymentRecord, StudentWithPayments } from '@/lib/types'
import { X, Save, CreditCard, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, getMonthName } from '@/lib/utils'

interface PaymentModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onUpdatePayment: (studentId: string, paymentData: any) => Promise<void>
}

export function PaymentModal({
  student,
  isOpen,
  onClose,
  onUpdatePayment
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [renewalPaymentDate, setRenewalPaymentDate] = useState('')
  const [monthlyPaymentDates, setMonthlyPaymentDates] = useState<{ [month: number]: string }>({})

  useEffect(() => {
    if (student && isOpen) {
      // Load existing payments for the selected year
      const studentWithPayments = student as StudentWithPayments
      const yearPayments = studentWithPayments.payment_records?.filter(
        (payment) => payment.year === parseInt(selectedYear)
      ) || []
      setPayments(yearPayments)
      
      // Load renewal payment date for the year
      const renewalPayment = yearPayments.find(p => p.renewal_payment)
      setRenewalPaymentDate(renewalPayment?.renewal_payment || '')
      
      // Initialize monthly payment dates
      const monthlyDates: { [month: number]: string } = {}
      yearPayments.forEach(payment => {
        if (payment.payment_date) {
          monthlyDates[payment.month] = payment.payment_date
        }
      })
      setMonthlyPaymentDates(monthlyDates)
    }
  }, [student, isOpen, selectedYear])


  const onSubmitRenewal = async () => {
    if (!student) return

    setIsLoading(true)
    try {
      await onUpdatePayment(student.id, {
        year: parseInt(selectedYear),
        renewal_payment: renewalPaymentDate
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
      
      // Update local state
      setMonthlyPaymentDates(prev => ({
        ...prev,
        [month]: paymentDate
      }))
      
      toast.success(`${getMonthName(month)} payment updated successfully!`)
    } catch (error) {
      console.error('Error updating monthly payment:', error)
      toast.error('Failed to update monthly payment')
    } finally {
      setIsLoading(false)
    }
  }

  const getExistingPayment = (month: number) => {
    return payments.find(p => p.month === month)
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
                    value={renewalPaymentDate}
                    onChange={(e) => setRenewalPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <button
                  onClick={onSubmitRenewal}
                  disabled={isLoading}
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
                          value={monthlyPaymentDates[month] || ''}
                          onChange={(e) => setMonthlyPaymentDates(prev => ({
                            ...prev,
                            [month]: e.target.value
                          }))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => updateMonthlyPayment(month, monthlyPaymentDates[month] || '')}
                        disabled={isLoading || !monthlyPaymentDates[month]}
                        className="w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : 'Update'}
                      </button>
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
                <span className="ml-2 font-medium">{payments.length}/12</span>
              </div>
              <div>
                <span className="text-gray-600">Paid Months:</span>
                <span className="ml-2 font-medium text-green-600">
                  {payments.filter(p => p.payment_date).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Renewal Payment:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {renewalPaymentDate ? 'Paid' : 'Not Paid'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
