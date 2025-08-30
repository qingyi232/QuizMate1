'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File, content?: string) => void
  onFileRemove: () => void
  acceptedTypes?: string[]
  maxSize?: number // in bytes
  disabled?: boolean
  selectedFile?: File | null
  className?: string
}

interface FileValidation {
  isValid: boolean
  error?: string
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['text/plain', 'application/pdf'],
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  selectedFile = null,
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = useCallback((file: File): FileValidation => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const allowedExtensions = acceptedTypes.map(type => {
        switch(type) {
          case 'text/plain': return '.txt'
          case 'application/pdf': return '.pdf'
          default: return type
        }
      }).join(', ')
      
      return {
        isValid: false,
        error: `Please select a valid file type (${allowedExtensions})`
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB`
      }
    }

    return { isValid: true }
  }, [acceptedTypes, maxSize])

  // Process file content
  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setUploadProgress(0)
    setError('')

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      let content: string | undefined

      if (file.type === 'text/plain') {
        // Read text file content
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string || '')
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsText(file)
        })
      }
      // For PDF files, content will be processed on the backend

      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Brief delay to show completion
      setTimeout(() => {
        onFileSelect(file, content)
        setIsProcessing(false)
        setUploadProgress(0)
      }, 500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }, [onFileSelect])

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    const validation = validateFile(file)
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    await processFile(file)
  }, [validateFile, processFile])

  // Handle file input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [disabled, handleFileSelect])

  // Handle click to select file
  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click()
    }
  }, [disabled, isProcessing])

  // Handle file removal
  const handleRemove = useCallback(() => {
    onFileRemove()
    setError('')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onFileRemove])

  // Get file icon
  const getFileIcon = (file: File) => {
    switch (file.type) {
      case 'application/pdf':
        return <File className="h-8 w-8 text-red-500" />
      case 'text/plain':
        return <FileText className="h-8 w-8 text-blue-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className={className}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {!selectedFile ? (
        <Card 
          className={`
            border-2 border-dashed cursor-pointer transition-all
            ${isDragOver ? 'border-blue-600 bg-blue-500/5' : 'border-gray-300 hover:border-blue-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center space-y-4">
            {isProcessing ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Processing file...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: {acceptedTypes.map(type => {
                      switch(type) {
                        case 'text/plain': return 'TXT'
                        case 'application/pdf': return 'PDF'
                        default: return type.split('/')[1].toUpperCase()
                      }
                    }).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum size: {Math.round(maxSize / (1024 * 1024))}MB
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Selected File Display */
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}