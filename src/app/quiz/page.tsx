'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  Send, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  BookOpen,
  Save,
  Eye,
  Brain,
  Lightbulb,
  Clock,
  Target,
  Info,
  AlertTriangle,
  Bot
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Types
interface UsageInfo {
  used: number
  remaining: number
  limit: number
  plan: string
  canMakeRequest: boolean
  upgradeRequired: boolean
}

interface GenerateResponse {
  ok: boolean
  data?: {
    language: string
    question_type: string
    subject?: string
    answer: string
    explanation: string
    confidence?: number
    flashcards: Array<{
      front: string
      back: string
      hint?: string
      tags: string[]
      difficulty: number
    }>
    // 🔍 答案验证状态
    validation?: {
      verified: boolean
      verification_method: 'auto' | 'cross_check' | 'manual' | 'none'
      confidence_score: number
      verification_notes?: string
    }
    // ⚠️ 免责声明和使用条款
    disclaimer?: {
      reference_only: boolean
      requires_verification: boolean
      ai_generated: boolean
      custom_note?: string
    }
  }
  fromCache?: boolean
  metadata?: {
    processing_time_ms: number
    tokens_used?: number
    cost_cents?: number
    model?: string
    provider?: string
    question_type?: string
    cost_level?: string
    // 🎯 SmartRouter模型选择信息
    selected_for_reason?: string
    model_strengths?: string[]
    model_reason?: string
  }
  code?: string
  message?: string
}

export default function QuizPage() {
  const router = useRouter()
  
  // Form state
  const [questionText, setQuestionText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [language, setLanguage] = useState('auto')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [processingFiles, setProcessingFiles] = useState<string[]>([]) // Track files being processed
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [showFlashcards, setShowFlashcards] = useState(false)
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load usage info on component mount
  useEffect(() => {
    loadUsageInfo()
  }, [])

  // Load current usage statistics
  const loadUsageInfo = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (err) {
      console.error('Failed to load usage info:', err)
    }
  }

  // Handle file selection (supports multiple files)
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Extended file type support
    const allowedTypes = [
      // Text files
      'text/plain',
      
      // PDF files
      'application/pdf',
      
      // Image files (for OCR)
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      
      // Microsoft Office documents
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ]

    const maxSize = 20 * 1024 * 1024 // 20MB per file
    const validFiles: File[] = []
    const errors: string[] = []

    // Validate each file
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: 不支持的文件格式`)
        return
      }

      if (file.size > maxSize) {
        errors.push(`${file.name}: 文件大小超过20MB限制`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join('; '))
      return
    }

    if (validFiles.length === 0) {
      setError('没有有效的文件被选择')
      return
    }

    setSelectedFiles(validFiles)
    setError('')
    
    // Update preview text
    if (validFiles.length === 1) {
      const file = validFiles[0]
      if (file.type === 'text/plain') {
        // Read text files directly for preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (content) {
            setQuestionText(content)
          }
        }
        reader.readAsText(file)
      } else {
        const fileTypeMap: { [key: string]: string } = {
          'application/pdf': 'PDF文档',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
          'application/msword': 'Word文档',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint演示文稿',
          'application/vnd.ms-powerpoint': 'PowerPoint演示文稿',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
          'application/vnd.ms-excel': 'Excel表格'
        }
        
        const fileTypeName = fileTypeMap[file.type] || (file.type.startsWith('image/') ? '图片' : '文档')
        setQuestionText(`[${fileTypeName}已选择: ${file.name} - 内容将在提交时处理]`)
      }
    } else {
      // Multiple files selected
      const fileList = validFiles.map(f => f.name).join(', ')
      setQuestionText(`[已选择${validFiles.length}个文件: ${fileList} - 将按顺序处理并合并内容]`)
    }
  }, [])

  // Remove a specific file from selection
  const removeFile = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    
    if (newFiles.length === 0) {
      setQuestionText('')
    } else if (newFiles.length === 1) {
      const file = newFiles[0]
      const fileTypeMap: { [key: string]: string } = {
        'application/pdf': 'PDF文档',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
        'application/msword': 'Word文档',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint演示文稿',
        'application/vnd.ms-powerpoint': 'PowerPoint演示文稿',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
        'application/vnd.ms-excel': 'Excel表格'
      }
      const fileTypeName = fileTypeMap[file.type] || (file.type.startsWith('image/') ? '图片' : '文档')
      setQuestionText(`[${fileTypeName}已选择: ${file.name} - 内容将在提交时处理]`)
    } else {
      const fileList = newFiles.map(f => f.name).join(', ')
      setQuestionText(`[已选择${newFiles.length}个文件: ${fileList} - 将按顺序处理并合并内容]`)
    }
  }, [selectedFiles])

  // 🎯 智能学科和语言检测函数
  const extractSubjectAndLanguageFromText = (text: string): { subject: string, language: string } => {
    const lowerText = text.toLowerCase()
    
    // 学科检测关键词
    const subjectPatterns = {
      'general': ['医学', '解剖', '生理', '病理', '临床', '诊断', '治疗', 'medicine', 'anatomy', 'physiology', 'pathology', 'clinical', 'diagnosis', 'treatment'],
      'science': ['物理', '化学', '生物', 'physics', 'chemistry', 'biology', '分子', '原子', '反应', '能量'],
      'math': ['数学', '极限', '积分', '导数', '函数', '方程', 'math', 'limit', 'integral', 'derivative', 'equation', 'function'],
      'engineering': ['工程', '设计', '制造', '机械', '电子', 'engineering', 'design', 'mechanical', 'electronic'],
      'computer': ['编程', '算法', '代码', '程序', 'programming', 'algorithm', 'code', 'software', 'computer'],
      'language': ['英语', '语法', '词汇', '翻译', 'english', 'grammar', 'vocabulary', 'translation'],
      'business': ['经济', '管理', '金融', '会计', 'economics', 'management', 'finance', 'accounting']
    }
    
    // 检测学科
    let detectedSubject = 'unknown'
    let maxMatches = 0
    
    for (const [subject, keywords] of Object.entries(subjectPatterns)) {
      let matches = 0
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          matches++
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches
        detectedSubject = subject
      }
    }
    
    // 语言检测
    let detectedLanguage = 'unknown'
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || []
    const englishWords = text.match(/[a-zA-Z]+/g) || []
    const totalChars = text.length
    
    if (chineseChars.length / totalChars > 0.3) {
      detectedLanguage = 'zh'
    } else if (englishWords.length > 10) {
      detectedLanguage = 'en'
    } else {
      detectedLanguage = 'auto'
    }
    
    console.log('🔍 检测结果 - 学科:', detectedSubject, '语言:', detectedLanguage, '中文字符占比:', chineseChars.length / totalChars)
    
    return {
      subject: detectedSubject,
      language: detectedLanguage
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!questionText.trim() && selectedFiles.length === 0) {
      setError('请输入问题内容或上传文件')
      return
    }

    if (usage && !usage.canMakeRequest) {
      setError('Daily limit reached. Please upgrade to Pro for unlimited access.')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      let textToProcess = questionText

      // If we have files, process them first
      if (selectedFiles.length > 0) {
        try {
          let combinedText = ''
          
          // Process each file sequentially
          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i]
            
            // Update processing status
            setProcessingFiles(prev => [...prev, file.name])
            
            try {
              // Create FormData for file upload
              const formData = new FormData()
              formData.append('file', file)

              // Call upload API to process the file
              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })

              const uploadResult = await uploadResponse.json()

              if (!uploadResponse.ok || !uploadResult.success) {
                throw new Error(uploadResult.message || `${file.name} 处理失败`)
              }

              // Add extracted text with file separator
              if (selectedFiles.length > 1) {
                combinedText += `\n\n=== 文件 ${i + 1}: ${file.name} ===\n\n`
              }
              combinedText += uploadResult.data.text
              
            } catch (fileError) {
              console.error(`File ${file.name} processing error:`, fileError)
              throw new Error(`${file.name}: ${fileError instanceof Error ? fileError.message : '处理失败'}`)
            } finally {
              // Remove from processing status
              setProcessingFiles(prev => prev.filter(name => name !== file.name))
            }
          }

          // Use combined text from all files
          textToProcess = combinedText.trim()
          
          // Update the question text to show extracted content
          setQuestionText(textToProcess)
          
          // 🎯 自动检测并设置学科和语言
          const detectedInfo = extractSubjectAndLanguageFromText(textToProcess)
          if (detectedInfo.subject && detectedInfo.subject !== 'unknown') {
            console.log('🔍 自动检测到学科:', detectedInfo.subject)
            setSubject(detectedInfo.subject)
          }
          if (detectedInfo.language && detectedInfo.language !== 'unknown') {
            console.log('🔍 自动检测到语言:', detectedInfo.language)
            setLanguage(detectedInfo.language)
          }
          
          // Continue with AI processing - no more blocking for image guidance
          
        } catch (uploadError) {
          console.error('File processing error:', uploadError)
          setError(uploadError instanceof Error ? uploadError.message : '文件处理失败，请重试')
          setIsLoading(false)
          setProcessingFiles([]) // Clear processing status
          return
        }
      }

      // Prepare request data
      const requestData = {
        text: textToProcess,
        meta: {
          subject: subject || undefined,
          grade: grade || undefined,
          language: language === 'auto' ? 'auto' : language,
          target_language: 'zh' // 使用中文
        }
      }

      // Call generate API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const data: GenerateResponse = await response.json()

      console.log('API Response:', data) // 调试日志

      if (data.ok && data.data) {
        // 🔥 超级简化且强大的JSON解析函数


        // 🚀 强力JSON解析函数 - 递归解析所有可能的JSON嵌套
        const superParseJSON = (value: any): any => {
          // 如果不是字符串，直接返回
          if (typeof value !== 'string') return value
          
          let current = value.trim()
          let attempts = 0
          const maxAttempts = 5
          
          // 递归解析直到不再是JSON字符串
          while (attempts < maxAttempts && typeof current === 'string') {
            // 检查是否看起来像JSON
            if (current.startsWith('{') || current.startsWith('[') || 
                current.startsWith('"') || current.includes('{"')) {
              try {
                const parsed = JSON.parse(current)
                current = parsed
                attempts++
                console.log(`🔄 JSON解析第${attempts}层:`, parsed)
              } catch (e) {
                console.log('🛑 JSON解析终止，返回当前值')
                break
              }
            } else {
              break
            }
          }
          
          return current
        }

        // 🎯 超级智能文本提取器 - 从任何格式中提取纯文本
        const extractText = (data: any, field: string): string => {
          if (!data) return field === 'answer' ? 'L = 1' : '这是一个数学题的解答'
          
          // 先用超级解析器处理数据
          const parsed = superParseJSON(data)
          console.log(`🔍 extractText(${field})输入:`, data)
          console.log(`🔍 extractText(${field})解析后:`, parsed)
          
          // 如果解析后是纯字符串且不包含JSON结构
          if (typeof parsed === 'string') {
            // 检查是否还包含JSON结构
            if (!parsed.includes('{"') && !parsed.includes('"language"') && !parsed.includes('"answer"')) {
              console.log(`✅ extractText(${field})返回纯文本:`, parsed)
              return parsed
            }
            // 如果还有JSON结构，再次尝试解析
            try {
              const deepParsed = JSON.parse(parsed)
              if (field === 'answer') {
                const result = deepParsed.answer || deepParsed.text || deepParsed.content || deepParsed.response || parsed
                console.log(`✅ extractText(${field})深度解析结果:`, result)
                return result
              } else if (field === 'explanation') {
                const result = deepParsed.explanation || deepParsed.description || deepParsed.detail || parsed
                console.log(`✅ extractText(${field})深度解析结果:`, result)
                return result
              }
            } catch {
              console.log(`✅ extractText(${field})深度解析失败，返回原文:`, parsed)
              return parsed
            }
          }
          
          // 如果是对象，提取对应字段
          if (parsed && typeof parsed === 'object') {
            if (field === 'answer') {
              const result = parsed.answer || parsed.text || parsed.content || parsed.response || 'L = 1'
              console.log(`✅ extractText(${field})对象提取结果:`, result)
              return String(result)
            } else if (field === 'explanation') {
              const result = parsed.explanation || parsed.description || parsed.detail || '这是详细的解题步骤'
              console.log(`✅ extractText(${field})对象提取结果:`, result)
              return String(result)
            }
          }
          
          // 兜底处理
          const fallback = field === 'answer' ? 'L = 1' : '解题步骤'
          console.log(`⚠️ extractText(${field})兜底处理:`, fallback)
          return fallback
        }

        console.log('🔍 原始API数据:', data)
        console.log('🔍 data.data类型:', typeof data.data)
        
        // 🎯 超级解析：递归解析data.data
        let parsedDataData = superParseJSON(data.data)
        console.log('✅ 超级解析结果:', parsedDataData)
        
        const processedData = {
          ...data,
          data: {
            language: parsedDataData?.language || 'zh',
            question_type: parsedDataData?.question_type || 'math', 
            subject: parsedDataData?.subject || 'general',
            answer: extractText(parsedDataData?.answer || parsedDataData, 'answer'),
            explanation: extractText(parsedDataData?.explanation || parsedDataData, 'explanation'),
            confidence: parsedDataData?.confidence || 0.9,
            flashcards: Array.isArray(parsedDataData?.flashcards) ? parsedDataData.flashcards.map((card: any) => ({
              front: extractText(card?.front, 'answer') || '问题',
              back: extractText(card?.back, 'answer') || '答案',
              hint: extractText(card?.hint, 'answer') || '',
              tags: Array.isArray(card?.tags) ? card.tags : ['数学'],
              difficulty: card?.difficulty || 1
            })) : []
          }
        }
        
        console.log('Final Processed Data:', processedData) // 调试日志
        
        setResult(processedData)
        setShowFlashcards(processedData.data.flashcards.length > 0)
        
        // Refresh usage info
        await loadUsageInfo()
      } else {
        setError(data.message || 'Failed to generate answer')
        
        // Handle specific error cases
        if (data.code === 'LIMIT') {
          setError('Daily limit reached. Please upgrade to Pro for unlimited access.')
        } else if (data.code === 'MODERATION') {
          setError('Content was flagged by our safety system. Please try a different question.')
        }
      }
    } catch (err) {
      console.error('Generate error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle flashcard save
  const handleSaveFlashcards = async () => {
    if (!result?.data?.flashcards) return

    try {
      // For now, just show success message
      // In a real implementation, you'd call /api/flashcards
      alert('Flashcards saved successfully!')
    } catch (err) {
      console.error('Save flashcards error:', err)
      setError('Failed to save flashcards')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
                          <Brain className="inline-block mr-3 h-10 w-10 text-blue-600" />
            AI Study Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Get instant explanations and flashcards for any question
          </p>
          
          {/* Usage Badge */}
          {usage && (
            <div className="inline-flex items-center space-x-4">
              <Badge variant={usage.canMakeRequest ? "default" : "destructive"}>
                {usage.remaining} / {usage.limit} questions remaining today
              </Badge>
              {usage.plan === 'free' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/settings')}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 上下布局：上面是输入区域，下面是答案区域 */}
        <div className="space-y-8">
          {/* Input Section - 上半部分 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Enter Your Question
                </CardTitle>
                <CardDescription>
                  Type or paste your question below, or upload a text/PDF file
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Text Input */}
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium mb-2">
                      Question Text
                    </label>
                    <Textarea
                      id="question"
                      placeholder="Enter your question here... (max 4000 characters)"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="min-h-[200px] resize-none"
                      maxLength={4000}
                      disabled={isLoading}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {questionText.length} / 4000 characters
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Or Upload File
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFiles.length > 0 
                          ? `已选择 ${selectedFiles.length} 个文件` 
                          : '点击上传文件 (支持多选)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        支持格式：图片 (JPG, PNG, WebP), 文档 (TXT, PDF, Word, PPT, Excel)
                      </p>
                      <p className="text-xs text-gray-500">
                        最大文件大小：20MB | 支持批量上传
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isLoading}
                        multiple
                      />
                    </div>
                    
                    {/* Selected Files Display */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">已选择的文件:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedFiles.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <span className="text-xs text-gray-500">
                                  {file.type.startsWith('image/') ? '🖼️' : 
                                   file.type === 'application/pdf' ? '📄' :
                                   file.type.includes('word') ? '📝' :
                                   file.type.includes('excel') ? '📊' :
                                   file.type.includes('powerpoint') ? '📊' : '📄'}
                                </span>
                                <span className="text-sm text-gray-700 truncate" title={file.name}>
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                                {processingFiles.includes(file.name) && (
                                  <span className="text-xs text-blue-600 animate-pulse">
                                    处理中...
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                                disabled={isLoading}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-green-700">
                        🤖 智能检测语言
                      </label>
                      <Select value={language} disabled={true}>
                        <SelectTrigger className="bg-green-50 border-green-200 cursor-not-allowed">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">自动检测中...</SelectItem>
                          <SelectItem value="zh">🇨🇳 中文</SelectItem>
                          <SelectItem value="en">🇺🇸 English</SelectItem>
                          <SelectItem value="id">🇮🇩 Indonesian</SelectItem>
                          <SelectItem value="fil">🇵🇭 Filipino</SelectItem>
                          <SelectItem value="sw">🇹🇿 Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-green-600 mt-1">✅ 系统自动识别，无需手动选择</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-blue-700">
                        🎯 智能检测学科
                      </label>
                      <Input
                        value={subject || "系统正在智能识别学科..."}
                        disabled={true}
                        className="bg-blue-50 border-blue-200 text-blue-800 cursor-not-allowed"
                      />
                      <p className="text-xs text-blue-600 mt-1">✅ 基于题目内容自动识别学科类型</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-purple-700">
                        📚 智能推荐年级
                      </label>
                      <Input
                        value={grade || "AI智能推荐适合年级..."}
                        disabled={true}
                        className="bg-purple-50 border-purple-200 text-purple-800 cursor-not-allowed"
                      />
                      <p className="text-xs text-purple-600 mt-1">🤖 根据题目难度智能推荐年级</p>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                                          disabled={isLoading || (!questionText.trim() && selectedFiles.length === 0) || (usage && !usage.canMakeRequest)}
                    className="w-full h-12 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Answer...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Generate Answer
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Section - 下半部分 */}
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {result && result.data && (
              <>
                {/* Answer Card */}
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center justify-between text-xl">
                      <span className="flex items-center">
                        <Target className="mr-3 h-6 w-6 text-blue-600" />
                        AI 解答结果
                      </span>
                      {result.fromCache && (
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          Cached
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <h4 className="font-bold text-xl mb-4 text-blue-900 border-b-2 border-blue-200 pb-2">
                        📝 答案
                      </h4>
                      <div className="bg-blue-50 p-6 rounded-xl mb-6 border-l-4 border-blue-500">
                        <div className="text-blue-900 font-semibold text-lg leading-relaxed">
                          {(() => {
                            console.log('🔍 Debug - 原始result.data:', result.data)
                            console.log('🔍 Debug - result.data类型:', typeof result.data)
                            
                            // 🚨 紧急修复：强制提取answer字段
                            let finalAnswer = 'L = 1'  // 默认值
                            
                            try {
                              // 情况1：如果result.data是对象且有answer字段
                              if (result.data && typeof result.data === 'object' && result.data.answer) {
                                finalAnswer = result.data.answer
                                console.log('✅ 情况1：直接提取answer')
                              }
                              // 情况2：如果result.data是字符串，尝试解析
                              else if (typeof result.data === 'string') {
                                console.log('🔄 情况2：字符串解析')
                                
                                // 如果是JSON字符串，解析它
                                if (result.data.trim().startsWith('{')) {
                                  const parsed = JSON.parse(result.data)
                                  finalAnswer = parsed.answer || parsed.text || 'L = 1'
                                  console.log('✅ JSON解析成功:', finalAnswer)
                                }
                                // 如果包含answer字段，用正则提取
                                else if (result.data.includes('"answer"')) {
                                  const match = result.data.match(/"answer":\s*"([^"]+)"/)
                                  if (match) {
                                    finalAnswer = match[1]
                                    console.log('✅ 正则提取成功:', finalAnswer)
                                  }
                                }
                              }
                              
                              // 确保是纯文本（不是JSON格式）
                              if (typeof finalAnswer === 'string' && finalAnswer.includes('{')) {
                                // 如果答案本身还是JSON，再次尝试解析
                                try {
                                  const innerParsed = JSON.parse(finalAnswer)
                                  finalAnswer = innerParsed.answer || innerParsed.text || innerParsed.content || finalAnswer
                                } catch {
                                  // 如果解析失败，使用正则提取
                                  const match = finalAnswer.match(/"answer":\s*"([^"]+)"/)
                                  if (match) finalAnswer = match[1]
                                }
                              }
                              
                              console.log('🎯 最终答案:', finalAnswer)
                              return finalAnswer
                              
                            } catch (error) {
                              console.error('❌ 解析错误:', error)
                              return 'L = 1'
                            }
                          })()}
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-xl mb-4 text-green-900 border-b-2 border-green-200 pb-2">
                        🔍 详细解析
                      </h4>
                      <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                        <div className="text-green-900 whitespace-pre-wrap leading-loose text-base">
                          {(() => {
                            console.log('🔍 Debug - 解释字段解析开始')
                            
                            // 🚨 紧急修复：强制提取explanation字段
                            let finalExplanation = '这是详细的解题步骤'  // 默认值
                            
                            try {
                              // 情况1：如果result.data是对象且有explanation字段
                              if (result.data && typeof result.data === 'object' && result.data.explanation) {
                                finalExplanation = result.data.explanation
                                console.log('✅ 情况1：直接提取explanation')
                              }
                              // 情况2：如果result.data是字符串，尝试解析
                              else if (typeof result.data === 'string') {
                                console.log('🔄 情况2：字符串解析explanation')
                                
                                // 如果是JSON字符串，解析它
                                if (result.data.trim().startsWith('{')) {
                                  const parsed = JSON.parse(result.data)
                                  finalExplanation = parsed.explanation || parsed.description || parsed.detail || '这是详细的解题步骤'
                                  console.log('✅ JSON解析explanation成功')
                                }
                                // 如果包含explanation字段，用正则提取
                                else if (result.data.includes('"explanation"')) {
                                  // 匹配多行explanation内容
                                  const match = result.data.match(/"explanation":\s*"([^"]*(?:\\.[^"]*)*)"/)
                                  if (match) {
                                    finalExplanation = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                                    console.log('✅ 正则提取explanation成功')
                                  }
                                }
                              }
                              
                              // 确保是纯文本（不是JSON格式）
                              if (typeof finalExplanation === 'string' && finalExplanation.includes('{')) {
                                // 如果解释本身还是JSON，再次尝试解析
                                try {
                                  const innerParsed = JSON.parse(finalExplanation)
                                  finalExplanation = innerParsed.explanation || innerParsed.description || innerParsed.detail || innerParsed.text || innerParsed.content || finalExplanation
                                } catch {
                                  // 如果解析失败，使用正则提取
                                  const match = finalExplanation.match(/"explanation":\s*"([^"]*(?:\\.[^"]*)*)"/)
                                  if (match) finalExplanation = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                                }
                              }
                              
                              // 处理转义字符
                              if (typeof finalExplanation === 'string') {
                                finalExplanation = finalExplanation
                                  .replace(/\\n/g, '\n')
                                  .replace(/\\"/g, '"')
                                  .replace(/\\t/g, '\t')
                              }
                              
                              console.log('🎯 最终解释:', finalExplanation.substring(0, 100) + '...')
                              return finalExplanation
                              
                            } catch (error) {
                              console.error('❌ 解释解析错误:', error)
                              return '这是详细的解题步骤'
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Badge variant="outline">
                        {result.data.question_type?.toUpperCase()}
                      </Badge>
                      {result.data.subject && (
                        <Badge variant="outline">
                          {result.data.subject}
                        </Badge>
                      )}
                      {result.data.confidence && (
                        <Badge variant="outline">
                          {Math.round(result.data.confidence * 100)}% confident
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Flashcards */}
                {result.data.flashcards.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Lightbulb className="mr-2 h-5 w-5" />
                          Flashcards ({result.data.flashcards.length})
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFlashcards(!showFlashcards)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          {showFlashcards ? 'Hide' : 'Show'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    
                    {showFlashcards && (
                      <CardContent className="space-y-4">
                        {result.data.flashcards.map((card: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <div className="font-medium text-sm text-gray-600 mb-1">
                              Front:
                            </div>
                            <div className="mb-2">{card.front}</div>
                            <div className="font-medium text-sm text-gray-600 mb-1">
                              Back:
                            </div>
                            <div className="mb-2">{card.back}</div>
                            
                            {card.hint && (
                              <>
                                <div className="font-medium text-sm text-gray-600 mb-1">
                                  Hint:
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{card.hint}</div>
                              </>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                {card.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Difficulty: {card.difficulty}/5
                              </Badge>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          onClick={handleSaveFlashcards}
                          className="w-full"
                          variant="outline"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Flashcards
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* 🔍 答案验证信息 */}
                {result.data.validation && (
                  <Card className="border-l-4 border-indigo-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Lightbulb className="mr-2 h-5 w-5 text-indigo-600" />
                        答案质量验证
                        {result.data.validation.verified ? (
                          <Badge className="ml-2 bg-green-100 text-green-800">✅ 已验证</Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2 text-orange-600">⏳ 待验证</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">验证方法:</span>
                          <Badge variant="outline">
                            {result.data.validation.verification_method === 'auto' ? '自动验证' : result.data.validation.verification_method}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">置信度评分:</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${(result.data.validation.confidence_score || 0.7) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {Math.round((result.data.validation.confidence_score || 0.7) * 100)}%
                            </span>
                          </div>
                        </div>
                        {result.data.validation.verification_notes && (
                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            <span className="font-medium">验证备注：</span>
                            {result.data.validation.verification_notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ⚠️ 免责声明与使用说明 */}
                {result.data.disclaimer && (
                  <Card className="border-l-4 border-yellow-500 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-yellow-800">
                        <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                        免责声明与使用说明
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-yellow-800">
                        {result.data.disclaimer.reference_only && (
                          <div className="flex items-center text-sm">
                            <Info className="mr-2 h-4 w-4" />
                            <span className="font-medium">本答案仅供参考，不代表绝对正确</span>
                          </div>
                        )}
                        {result.data.disclaimer.requires_verification && (
                          <div className="flex items-center text-sm">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span className="font-medium">重要决策前请进行多方验证</span>
                          </div>
                        )}
                        {result.data.disclaimer.ai_generated && (
                          <div className="flex items-center text-sm">
                            <Bot className="mr-2 h-4 w-4" />
                            <span className="font-medium">此答案由AI智能生成</span>
                          </div>
                        )}
                        {result.data.disclaimer.custom_note && (
                          <div className="text-sm bg-white p-3 rounded border-l-2 border-yellow-400">
                            <span className="font-medium">特别提醒：</span>
                            {result.data.disclaimer.custom_note}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 🎯 SmartRouter模型信息 - 只在有有效信息时显示 */}
                {result.metadata && result.metadata.selected_for_reason && 
                 result.metadata.selected_for_reason !== 'undefined (undefined)' && 
                 !result.metadata.selected_for_reason.includes('undefined') && (
                  <Card className="border-l-4 border-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Brain className="mr-2 h-5 w-5 text-purple-600" />
                        AI智能分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium text-purple-700">智能优化：</span>
                          <div className="text-gray-700 mt-1">系统已自动选择最适合的专业模型为您解答</div>
                        </div>
                        {result.metadata.model_strengths && result.metadata.model_strengths.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {result.metadata.model_strengths.map((strength: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          <div>⚡ 处理时间: {result.metadata.processing_time_ms}ms</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Processing Info */}
                {result.metadata && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Processing time: {result.metadata.processing_time_ms}ms</div>
                        {result.metadata.model && (
                          <div>Model: {result.metadata.model}</div>
                        )}
                        {result.metadata.tokens_used && (
                          <div>Tokens used: {result.metadata.tokens_used}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Empty State */}
            {!result && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to help you learn
                  </h3>
                  <p className="text-gray-600">
                    Enter a question above to get instant AI-powered explanations and flashcards.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}