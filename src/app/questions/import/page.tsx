'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Copy,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { demoStorage } from '@/lib/demo/demo-storage'
import DemoModeBanner from '@/components/demo-mode-banner'

interface ImportResult {
  total: number
  successful: number
  skipped: number
  failed: number
  errors: string[]
  imported_ids: string[]
}

export default function ImportQuestionsPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [format, setFormat] = useState<'json' | 'csv' | 'txt'>('json')
  const [fileContent, setFileContent] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false)
  
  // Professional question banks
  const professionalBanks = [
    { id: 'professional-questions.json', name: '🎓 完整专业题库', desc: '34题 - 覆盖10大专业领域', count: '34题' },
    { id: 'medical-questions.csv', name: '🏥 医学健康', desc: '药理学、医学影像等', count: '2题' },
    { id: 'legal-questions.csv', name: '⚖️ 法律司法', desc: '民法、合同法等', count: '2题' },
    { id: 'engineering-questions.csv', name: '🔧 工程技术', desc: '土木、电气工程等', count: '2题' },
    { id: 'business-questions.csv', name: '💼 商业管理', desc: '战略、财务管理等', count: '2题' },
    { id: 'science-questions.csv', name: '🔬 自然科学', desc: '物理、化学、生物等', count: '6题' },
    { id: 'mathematics-questions.csv', name: '📊 数学统计', desc: '微积分、线性代数等', count: '2题' },
    { id: 'social-questions.csv', name: '🧠 社会科学', desc: '心理学、经济学等', count: '4题' },
    { id: 'humanities-questions.csv', name: '📚 人文艺术', desc: '历史、地理、哲学等', count: '8题' },
    { id: 'education-questions.csv', name: '🎓 教育培训', desc: '教育学、学习理论等', count: '2题' },
    { id: 'environmental-questions.csv', name: '🌍 环境科学', desc: '环保、可持续发展等', count: '2题' }
  ]

  const templates = {
    json: `{
  "format": "json",
  "questions": [
    {
      "content": "What is the capital of France?",
      "subject": "Geography",
      "grade": "High School",
      "language": "en",
      "answer": "Paris",
      "explanation": "Paris is the capital and most populous city of France.",
      "tags": ["geography", "capitals", "europe"]
    },
    {
      "content": "解方程：2x + 5 = 17",
      "subject": "数学",
      "grade": "初中",
      "language": "zh-CN",
      "answer": "x = 6",
      "explanation": "两边同时减5，得到2x = 12，然后两边除以2得到x = 6",
      "tags": ["数学", "代数", "方程"]
    }
  ]
}`,
    csv: `content,subject,grade,language,answer,explanation,tags
"What is the capital of France?",Geography,"High School",en,Paris,"Paris is the capital and most populous city of France.","geography,capitals,europe"
"解方程：2x + 5 = 17",数学,初中,zh-CN,"x = 6","两边同时减5，得到2x = 12，然后两边除以2得到x = 6","数学,代数,方程"`,
    txt: `What is the capital of France?

解方程：2x + 5 = 17

Which gas is most responsible for the greenhouse effect?
A) Oxygen
B) Nitrogen  
C) Carbon dioxide
D) Argon`
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setFileContent(content)
      
      // Auto-detect format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'json') setFormat('json')
      else if (extension === 'csv') setFormat('csv')
      else setFormat('txt')
    }
    reader.readAsText(file)
  }

  const parseContent = (content: string, format: string) => {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(content)
          
        case 'csv':
          const lines = content.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
          const questions = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim())
            const question: any = {}
            headers.forEach((header, index) => {
              if (header === 'tags') {
                question[header] = values[index] ? values[index].split(',').map(t => t.trim()) : []
              } else {
                question[header] = values[index] || undefined
              }
            })
            return question
          })
          return { format: 'json', questions }
          
        case 'txt':
          const textQuestions = content.split('\n\n').filter(q => q.trim()).map(q => ({
            content: q.trim(),
            language: 'en'
          }))
          return { format: 'json', questions: textQuestions }
          
        default:
          throw new Error('Unsupported format')
      }
    } catch (error) {
      throw new Error(`解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleProfessionalImport = async (bankId: string) => {
    setIsImporting(true)
    
    try {
      // 根据bankId获取对应的专业题库数据
      const response = await fetch(`/api/professional-data/${bankId}`)
      
      if (!response.ok) {
        throw new Error(`无法加载题库文件: ${bankId}`)
      }
      
      const fileContent = await response.text()
      let parsedData
      
      if (bankId.endsWith('.json')) {
        parsedData = JSON.parse(fileContent)
      } else if (bankId.endsWith('.csv')) {
        // 解析CSV格式
        parsedData = parseContent(fileContent, 'csv')
      } else {
        throw new Error('不支持的文件格式')
      }
      
      const importData = {
        ...parsedData,
        source: 'professional_bank',
        overwrite_duplicates: overwriteDuplicates
      }

      const importResponse = await fetch('/api/questions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      })

      const result = await importResponse.json()
      
      if (result.success) {
        // 如果是演示模式导入，使用专业存储管理器保存数据
        if (result.data.demo_questions && demoStorage.isDemoMode()) {
          const success = demoStorage.saveQuestions(result.data.demo_questions, true)
          if (success) {
            const storageInfo = demoStorage.getStorageInfo()
            console.log(`✅ 演示模式导入成功：${result.data.demo_questions.length} 个题目`)
            console.log(`📊 存储信息：`, storageInfo)
          }
        }
        
        setImportResult(result.data)
      } else {
        alert(`导入失败: ${result.error}`)
      }
    } catch (error) {
      alert(`导入错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleImport = async () => {
    if (!fileContent.trim()) {
      alert('请先输入或上传内容')
      return
    }

    setIsImporting(true)
    
    try {
      const parsedData = parseContent(fileContent, format)
      const importData = {
        ...parsedData,
        source: 'file_upload',
        overwrite_duplicates: overwriteDuplicates
      }

      const response = await fetch('/api/questions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      })

      const result = await response.json()
      
      if (result.success) {
        setImportResult(result.data)
      } else {
        alert(`导入失败: ${result.error}`)
      }
    } catch (error) {
      alert(`导入错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsImporting(false)
    }
  }

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template)
    alert('模板已复制到剪贴板')
  }

  const downloadTemplate = (format: string) => {
    const template = templates[format as keyof typeof templates]
    const blob = new Blob([template], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questions_template.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Upload className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">批量导入题目</h1>
            </div>
            <Link href="/questions">
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                返回题库
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <DemoModeBanner />
        
        {/* Import Result */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  导入完成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                    <div className="text-sm text-gray-600">总计</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                    <div className="text-sm text-gray-600">成功</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                    <div className="text-sm text-gray-600">跳过</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                    <div className="text-sm text-gray-600">失败</div>
                  </div>
                </div>

                <Progress 
                  value={(importResult.successful / importResult.total) * 100} 
                  className="mb-4" 
                />

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">错误信息</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => {
                      setImportResult(null)
                      setFileContent('')
                    }}
                  >
                    继续导入
                  </Button>
                  <Link href="/questions">
                    <Button variant="outline">查看题库</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Import Interface */}
        {!importResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="professional">专业题库</TabsTrigger>
                <TabsTrigger value="upload">文件导入</TabsTrigger>
                <TabsTrigger value="template">模板下载</TabsTrigger>
              </TabsList>

              <TabsContent value="professional" className="space-y-6">
                {/* Professional Question Banks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      世界各行各业专业题库
                    </CardTitle>
                    <div className="text-sm text-gray-600">
                      覆盖医学、法律、工程、商业、科学等10大专业领域，共34个经典题目
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {professionalBanks.map((bank) => (
                        <Card
                          key={bank.id}
                          className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300 group"
                          onClick={() => handleProfessionalImport(bank.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-sm group-hover:text-blue-600">
                                {bank.name}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {bank.count}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600 mb-3">
                              {bank.desc}
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              disabled={isImporting}
                            >
                              {isImporting ? '导入中...' : '立即导入'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-900 mb-1">专业题库特色</div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• 权威专业：基于各领域经典教材和考试</li>
                            <li>• 多语言：中英文对照，国际化视野</li>
                            <li>• 分级学习：从基础到高级，循序渐进</li>
                            <li>• 即时导入：点击即可导入到您的题库</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                {/* Format Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>选择导入格式</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries({
                        json: { name: 'JSON', desc: '结构化数据，支持完整字段' },
                        csv: { name: 'CSV', desc: '表格数据，Excel友好' },
                        txt: { name: 'TXT', desc: '纯文本，简单快速' }
                      }).map(([key, value]) => (
                        <Card
                          key={key}
                          className={`cursor-pointer transition-colors ${
                            format === key ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setFormat(key as any)}
                        >
                          <CardContent className="p-4 text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <div className="font-medium">{value.name}</div>
                            <div className="text-sm text-gray-600">{value.desc}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle>上传文件或直接输入</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">选择文件</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".json,.csv,.txt"
                        onChange={handleFileUpload}
                        className="mt-1"
                      />
                    </div>

                    <div className="text-center text-gray-500">或</div>

                    <div>
                      <Label htmlFor="content">直接输入内容</Label>
                      <Textarea
                        id="content"
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        placeholder={`请输入${format.toUpperCase()}格式的题目数据...`}
                        className="mt-1 min-h-[200px] font-mono text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="overwrite"
                        checked={overwriteDuplicates}
                        onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                      />
                      <Label htmlFor="overwrite">覆盖重复题目</Label>
                    </div>

                    <Button
                      onClick={handleImport}
                      disabled={!fileContent.trim() || isImporting}
                      className="w-full"
                    >
                      {isImporting ? '导入中...' : '开始导入'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="template" className="space-y-6">
                {/* Templates */}
                {Object.entries(templates).map(([key, template]) => (
                  <Card key={key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {key.toUpperCase()} 模板
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyTemplate(template)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            复制
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTemplate(key)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{template}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}

                {/* Guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      导入须知
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">限制条件</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• 单次最多导入 100 个题目</li>
                          <li>• 每个题目内容最多 4000 字符</li>
                          <li>• 支持语言：中文、英文、印尼语、菲律宾语、斯瓦西里语</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">最佳实践</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• 确保题目内容清晰完整</li>
                          <li>• 提供准确的学科和年级信息</li>
                          <li>• 建议提供答案和解释</li>
                          <li>• 使用标准化标签便于搜索</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  )
}