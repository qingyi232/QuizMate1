'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Book, Zap, Key, Shield, Globe, Copy, ExternalLink } from 'lucide-react'

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/generate',
    description: '分析题目并生成详细解答',
    parameters: [
      { name: 'question', type: 'string', required: true, description: '题目内容（文字或base64图片）' },
      { name: 'subject', type: 'string', required: false, description: '学科类型' },
      { name: 'language', type: 'string', required: false, description: '回答语言' },
      { name: 'difficulty', type: 'string', required: false, description: '难度等级' }
    ],
    response: {
      success: 'boolean',
      answer: 'string',
      explanation: 'string',
      steps: 'array',
      validation: 'object',
      disclaimer: 'string'
    }
  },
  {
    method: 'GET',
    endpoint: '/api/questions',
    description: '获取题库列表',
    parameters: [
      { name: 'page', type: 'number', required: false, description: '页码' },
      { name: 'limit', type: 'number', required: false, description: '每页数量' },
      { name: 'subject', type: 'string', required: false, description: '学科筛选' }
    ],
    response: {
      questions: 'array',
      total: 'number',
      page: 'number',
      totalPages: 'number'
    }
  },
  {
    method: 'GET',
    endpoint: '/api/user-questions',
    description: '获取用户的错题本',
    parameters: [
      { name: 'page', type: 'number', required: false, description: '页码' },
      { name: 'limit', type: 'number', required: false, description: '每页数量' }
    ],
    response: {
      questions: 'array',
      statistics: 'object',
      total: 'number'
    }
  },
  {
    method: 'POST',
    endpoint: '/api/upload',
    description: '上传题目图片',
    parameters: [
      { name: 'image', type: 'file', required: true, description: '图片文件（JPG/PNG, <10MB）' }
    ],
    response: {
      success: 'boolean',
      imageUrl: 'string',
      extractedText: 'string'
    }
  }
]

const sdkExamples = {
  javascript: `// JavaScript SDK 示例
import QuizMateSDK from 'quizmate-sdk';

const client = new QuizMateSDK({
  apiKey: 'your_api_key_here',
  baseURL: 'https://api.quizmate.com'
});

// 分析题目
const result = await client.analyze({
  question: "解方程: 2x + 5 = 13",
  subject: "mathematics",
  language: "zh"
});

console.log(result.answer);`,
  python: `# Python SDK 示例
from quizmate import QuizMateClient

client = QuizMateClient(api_key="your_api_key_here")

# 分析题目
result = client.analyze(
    question="解方程: 2x + 5 = 13",
    subject="mathematics",
    language="zh"
)

print(result.answer)`,
  curl: `# cURL 示例
curl -X POST "https://api.quizmate.com/api/generate" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "解方程: 2x + 5 = 13",
    "subject": "mathematics",
    "language": "zh"
  }'`
}

const features = [
  {
    icon: Zap,
    title: '快速响应',
    description: '平均响应时间 < 2秒'
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: 'HTTPS加密，数据安全保护'
  },
  {
    icon: Globe,
    title: '全球可用',
    description: '99.9%可用性，全球CDN加速'
  },
  {
    icon: Key,
    title: '简单认证',
    description: 'API Key认证，简单易用'
  }
]

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Code className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            QuizMate API 文档
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            强大的AI分析API，轻松集成到您的应用中
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              获取API Key
              <Key className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              查看示例
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="text-center border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Start */}
        <Card className="mb-16 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Book className="h-6 w-6 mr-2" />
              快速开始
            </CardTitle>
            <CardDescription>
              三步快速集成QuizMate API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-bold mb-2">获取API Key</h3>
                <p className="text-sm text-gray-600">在开发者控制台注册并获取您的API密钥</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-bold mb-2">发送请求</h3>
                <p className="text-sm text-gray-600">使用HTTP POST请求发送题目到我们的API端点</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-bold mb-2">获取结果</h3>
                <p className="text-sm text-gray-600">接收JSON格式的详细分析结果和解答</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="mb-16 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">API 端点</CardTitle>
            <CardDescription>
              所有可用的API端点和参数说明
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Badge 
                      className={`mr-3 ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {endpoint.endpoint}
                    </code>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{endpoint.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Parameters */}
                    <div>
                      <h4 className="font-bold mb-3">请求参数</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <code className="text-sm font-mono text-blue-600">{param.name}</code>
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${param.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                {param.required ? '必填' : '可选'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{param.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <h4 className="font-bold mb-3">响应格式</h4>
                      <div className="bg-gray-50 p-4 rounded">
                        <pre className="text-sm">
                          <code>
                            {JSON.stringify(endpoint.response, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card className="mb-16 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">代码示例</CardTitle>
            <CardDescription>
              不同编程语言的使用示例
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              
              {Object.entries(sdkExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-4 right-4"
                      onClick={() => navigator.clipboard.writeText(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Rate Limits & Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>速率限制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>免费版</span>
                <span className="font-mono">100 请求/天</span>
              </div>
              <div className="flex justify-between">
                <span>Pro版</span>
                <span className="font-mono">10,000 请求/天</span>
              </div>
              <div className="flex justify-between">
                <span>企业版</span>
                <span className="font-mono">无限制</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>状态码</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>200</span>
                <span className="text-green-600">请求成功</span>
              </div>
              <div className="flex justify-between">
                <span>400</span>
                <span className="text-orange-600">请求参数错误</span>
              </div>
              <div className="flex justify-between">
                <span>401</span>
                <span className="text-red-600">API Key无效</span>
              </div>
              <div className="flex justify-between">
                <span>429</span>
                <span className="text-red-600">请求频率超限</span>
              </div>
              <div className="flex justify-between">
                <span>500</span>
                <span className="text-red-600">服务器内部错误</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">需要帮助？</h2>
            <p className="text-xl mb-8 text-blue-100">
              我们的开发者支持团队随时为您服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="mailto:shenqingyi16@gmail.com">
                  联系技术支持
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/help">
                  查看帮助文档
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-blue-200 text-sm">
              技术支持邮箱: shenqingyi16@gmail.com | QQ: 3123155744@qq.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Metadata moved to layout.tsx since this is a client component