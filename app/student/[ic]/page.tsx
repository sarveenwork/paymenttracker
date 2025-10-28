'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { User, CreditCard, Calendar, ArrowLeft, AlertCircle } from 'lucide-react'
import { StudentWithPayments } from '@/lib/types'
import { GradeBadge } from '@/components/GradeBadge'
import { ClassBadge } from '@/components/ClassBadge'
import { formatDate, getMonthName } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<StudentWithPayments | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const icNumber = params.ic as string

  useEffect(() => {
    if (icNumber) {
      fetchStudentDetails()
    }
  }, [icNumber])


  const fetchStudentDetails = async () => {
    setIsLoading(true)
    setError(null)

    // Show loading toast
    const loadingToast = toast.loading('Loading your student information...', {
      duration: 0,
      position: 'top-center',
      style: {
        background: '#dbeafe',
        color: '#1d4ed8',
        border: '1px solid #93c5fd',
        borderRadius: '8px',
      },
    })

    try {
      const response = await fetch(`/api/public-search?ic_number=${encodeURIComponent(icNumber)}`)
      const data = await response.json()

      if (response.ok) {
        toast.dismiss(loadingToast)
        setStudent(data.student)
      } else {
        toast.dismiss(loadingToast)
        toast.error(data.error || 'Student not found with this IC Number', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
          },
        })
        setError(data.error || 'Student not found')
      }
    } catch (error) {
      console.error('Error fetching student:', error)
      toast.dismiss(loadingToast)
      toast.error('Failed to load student information. Please try again.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
        },
      })
      setError('Failed to load student information')
    } finally {
      setIsLoading(false)
    }
  }

  const getPaymentForMonth = (year: number, month: number) => {
    return student?.payment_records?.find(p => p.year === year && p.month === month)
  }

  const getPaymentsByYear = () => {
    const paymentsByYear: { [year: number]: any[] } = {}
    
    student?.payment_records?.forEach(payment => {
      if (!paymentsByYear[payment.year]) {
        paymentsByYear[payment.year] = []
      }
      paymentsByYear[payment.year].push(payment)
    })

    return paymentsByYear
  }

  const paymentsByYear = getPaymentsByYear()
  const years = Object.keys(paymentsByYear).map(Number).sort((a, b) => b - a)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student information...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
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
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Student Payment Tracker</h1>
                  <p className="text-sm text-gray-500">Student payment information</p>
                </div>
              </motion.div>
              
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push('/search')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Search</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Error State */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                router.push('/search')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Another Search
            </button>
          </motion.div>
        </main>
      </div>
    )
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
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Payment Tracker</h1>
                <p className="text-sm text-gray-500">Student payment information</p>
              </div>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
               
                router.push('/search')
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Search</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">ID: {student.student_id}</span>
                  <span className="text-sm text-gray-500">TM: {student.tm_number}</span>
                  <span className="text-sm text-gray-500">IC: {student.ic_number}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <GradeBadge grade={student.grades || null} />
                <ClassBadge classData={student.classes || null} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Payment History
            </h3>

            {years.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No payment records found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {years.map((year) => (
                  <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">{year}</h4>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            {paymentsByYear[year].filter(p => p.payment_date).length} / 12 months paid
                          </span>
                          <div className={`text-sm font-medium px-2 py-1 rounded ${
                            paymentsByYear[year].filter(p => p.payment_date).length === 12
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {Math.round((paymentsByYear[year].filter(p => p.payment_date).length / 12) * 100)}% Complete
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = i + 1
                          const payment = getPaymentForMonth(year, month)
                          const isPaid = !!payment?.payment_date
                          
                          return (
                            <div
                              key={month}
                              className={`p-3 rounded-lg text-center ${
                                isPaid
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {getMonthName(month)}
                              </div>
                              <div className="mt-1">
                                {isPaid ? (
                                  <div className="text-green-600 text-xs">
                                    ✅ Paid
                                    <div className="text-gray-500">
                                      {formatDate(payment.payment_date!)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-red-600 text-xs">❌ Unpaid</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Student Payment Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
