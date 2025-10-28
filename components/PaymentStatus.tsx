'use client'

import { motion } from 'framer-motion'
import { Student, PaymentRecord, StudentWithPayments } from '@/lib/types'
import { GradeBadge } from './GradeBadge'
import { ClassBadge } from './ClassBadge'
import { formatDate, getMonthName } from '@/lib/utils'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { useState } from 'react'

interface PaymentStatusProps {
  student: Student
}

export function PaymentStatus({ student }: PaymentStatusProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]))

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  const getPaymentsByYear = () => {
    const paymentsByYear: { [year: number]: PaymentRecord[] } = {}
    
    const studentWithPayments = student as StudentWithPayments
    studentWithPayments.payment_records?.forEach(payment => {
      if (!paymentsByYear[payment.year]) {
        paymentsByYear[payment.year] = []
      }
      paymentsByYear[payment.year].push(payment)
    })

    return paymentsByYear
  }

  const paymentsByYear = getPaymentsByYear()
  const years = Object.keys(paymentsByYear).map(Number).sort((a, b) => b - a)

  const getPaymentForMonth = (year: number, month: number): PaymentRecord | undefined => {
    return paymentsByYear[year]?.find(p => p.month === month)
  }

  const getRenewalPayment = (year: number): PaymentRecord | undefined => {
    return paymentsByYear[year]?.find(p => p.renewal_payment)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Student Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">ID: {student.student_id}</span>
              <span className="text-sm text-gray-500">TM: {student.tm_number}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <GradeBadge grade={student.grades as any} size="lg" />
            <ClassBadge classData={student.classes as any} size="lg" />
          </div>
        </div>
        
        {student.remarks && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Remarks:</span> {student.remarks}
            </p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        
        {years.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No payment records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {years.map((year) => {
              const isExpanded = expandedYears.has(year)
              const yearPayments = paymentsByYear[year] || []
              const paidCount = yearPayments.filter(p => p.payment_date).length
              const totalCount = 12
              const renewalPayment = getRenewalPayment(year)
              
              return (
                <motion.div
                  key={year}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <motion.button
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => toggleYear(year)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{year}</h4>
                      <span className="text-sm text-gray-500">
                        {paidCount}/{totalCount} months paid
                      </span>
                      {renewalPayment?.renewal_payment && (
                        <span className="text-sm text-purple-600 font-medium">
                          🔄 Renewal Paid
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium ${
                        paidCount === totalCount ? 'text-green-600' : 
                        paidCount > totalCount / 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round((paidCount / totalCount) * 100)}%
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </motion.button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 bg-gray-50">
                        {/* Renewal Payment Section */}
                        {renewalPayment?.renewal_payment && (
                          <div className="mb-4 p-3 bg-purple-100 border border-purple-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-purple-900">🔄 Renewal Payment:</span>
                              <span className="text-sm text-purple-700">
                                Paid on {formatDate(renewalPayment.renewal_payment)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Monthly Payments */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1
                            const payment = getPaymentForMonth(year, month)
                            const isPaid = !!payment?.payment_date
                            
                            return (
                              <motion.div
                                key={month}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className={`p-3 rounded-lg text-center ${
                                  isPaid 
                                    ? 'bg-green-100 border border-green-200' 
                                    : 'bg-red-100 border border-red-200'
                                }`}
                              >
                                <div className="text-sm font-medium text-gray-900">
                                  {getMonthName(month)}
                                </div>
                                <div className="mt-1">
                                  {isPaid ? (
                                    <div className="text-green-600 text-xs">
                                      ✅ Paid
                                      {payment?.payment_date && (
                                        <div className="text-gray-500">
                                          {formatDate(payment.payment_date)}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-red-600 text-xs">❌ Unpaid</div>
                                  )}
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
