'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, User, AlertCircle, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SearchPage() {
  const [icNumber, setIcNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!icNumber.trim()) {
      toast.error('Please enter your IC Number', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
        },
      })
      return
    }

    // Validate IC number format (basic validation)
    const icPattern = /^[0-9]{6}-?[0-9]{2}-?[0-9]{4}$/i
    const icWithoutDashes = icNumber.trim().replace(/-/g, '')
    
    if (!icPattern.test(icNumber.trim()) && icWithoutDashes.length < 10) {
      toast.error('Please enter a valid IC Number format (e.g., 123456-12-1234)', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#fef3c7',
          color: '#d97706',
          border: '1px solid #fde68a',
          borderRadius: '8px',
        },
      })
      return
    }

    setIsLoading(true)
    const loadingToast = toast.loading('Searching for your student record...', {
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
      const response = await fetch(`/api/public-search?ic_number=${encodeURIComponent(icNumber.trim())}`)
      const data = await response.json()

      if (response.ok) {
        toast.dismiss(loadingToast)
        toast.success('Student found! Redirecting to your payment details...', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
          },
        })
        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push(`/student/${encodeURIComponent(icNumber.trim())}`)
        }, 1000)
      } else {
        toast.dismiss(loadingToast)
        toast.error(data.error || 'Student not found. Please check your IC Number and try again.', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
          },
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.dismiss(loadingToast)
      toast.error('Search failed. Please check your internet connection and try again.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
        },
      })
    } finally {
      setIsLoading(false)
    }
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
                <p className="text-sm text-gray-500">Search for student payment information</p>
              </div>
            </motion.div>
            
            <motion.a
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              href="/admin/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Admin Login
            </motion.a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Your Payment Information</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={icNumber}
                    onChange={(e) => setIcNumber(e.target.value)}
                    placeholder="Enter your IC Number..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{isLoading ? 'Searching...' : 'Search'}</span>
              </motion.button>
            </div>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            <p>Please enter your exact IC Number to view your payment information.</p>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-blue-900 mb-2">How to Search</h3>
          <div className="text-blue-800 space-y-2">
            <p>• Enter your exact IC Number in the search box above</p>
            <p>• The system will find your student record and show your payment history</p>
            <p>• You can view your current grade and monthly payment status</p>
            <p>• Green checkmarks (✅) indicate paid months, red X marks (❌) indicate unpaid months</p>
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
