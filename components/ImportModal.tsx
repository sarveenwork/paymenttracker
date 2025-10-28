'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResults {
  success: number
  errors: string[]
  skipped: number
}

export function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [importResults, setImportResults] = useState<ImportResults | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/import/template')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'students-import-template.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Template downloaded successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to download template')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download template')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setIsLoading(true)
    setImportResults(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/students', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setImportResults(data.results)
        toast.success(data.message)
        onImportComplete()
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleClose = () => {
    setImportResults(null)
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
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Import Students</h2>
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
                {!importResults ? (
                  <div className="space-y-6">
                    {/* Download Template */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-blue-900">Step 1: Download Template</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Download the Excel template with the correct format and sample data.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownloadTemplate}
                            disabled={isDownloading}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>{isDownloading ? 'Downloading...' : 'Download Template'}</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Upload File */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Upload className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">Step 2: Upload Excel File</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Fill in the template with your student data and upload it here.
                          </p>
                          
                          <div
                            className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              dragActive 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                          >
                            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              Drop your Excel file here
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                              or click to browse
                            </p>
                            <input
                              type="file"
                              accept=".xlsx,.xls"
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                            />
                            <label
                              htmlFor="file-upload"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-yellow-900">Important Notes</h3>
                          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                            <li>• Make sure to use the exact grade and class names from the reference sheets</li>
                            <li>• TM Number and IC Number must be unique</li>
                            <li>• All required fields must be filled</li>
                            <li>• Payment dates should be in YYYY-MM-DD format (optional)</li>
                            <li>• Month 0 (Renewal) = renewal payment, Month 1-12 = monthly payments</li>
                            <li>• Empty month columns mean no payment made for that month</li>
                            <li>• Only .xlsx and .xls files are supported</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Import Results */
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Import Results</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                        <div className="text-sm text-green-700">Successfully Imported</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{importResults.errors.length}</div>
                        <div className="text-sm text-red-700">Errors</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-600">{importResults.skipped}</div>
                        <div className="text-sm text-gray-700">Skipped</div>
                      </div>
                    </div>

                    {importResults.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                        <div className="max-h-40 overflow-y-auto">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-700 py-1">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {importResults ? 'Close' : 'Cancel'}
                </motion.button>
                {importResults && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setImportResults(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Import More
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
