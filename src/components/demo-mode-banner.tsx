'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Download, 
  Database, 
  ExternalLink,
  X,
  Info
} from 'lucide-react'
import { demoStorage } from '@/lib/demo/demo-storage'

export default function DemoModeBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const demoMode = demoStorage.isDemoMode()
    setIsDemoMode(demoMode)
    
    if (demoMode) {
      const info = demoStorage.getStorageInfo()
      setStorageInfo(info)
    }
  }, [])

  const handleExportData = () => {
    try {
      const data = demoStorage.exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quizmate-demo-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请稍后重试')
    }
  }

  const handleSetupDatabase = () => {
    window.open('https://supabase.com', '_blank')
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有演示数据吗？此操作不可撤销。')) {
      demoStorage.clearData()
      window.location.reload()
    }
  }

  // 不在客户端或非演示模式时不显示
  if (!isClient || !isDemoMode || !isVisible) {
    return null
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              <Info className="w-3 h-3 mr-1" />
              演示模式
            </Badge>
            {storageInfo && (
              <span className="text-sm text-orange-600">
                {storageInfo.questionCount} 个题目 · {storageInfo.storageSize}
              </span>
            )}
          </div>
          
          <div className="text-sm text-orange-700 mb-3">
            <strong>⚠️ 重要提醒：</strong>当前数据仅保存在本地浏览器中。
            <br />
            • 换设备或清除浏览器缓存会丢失所有数据
            • 无法实现跨设备同步和团队协作
            • 不适合生产环境使用
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleExportData}
              className="h-8 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Download className="w-3 h-3 mr-1" />
              导出数据
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleSetupDatabase}
              className="h-8 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Database className="w-3 h-3 mr-1" />
              配置真实数据库
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>

            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleClearData}
              className="h-8 text-orange-600 hover:bg-orange-100"
            >
              清除演示数据
            </Button>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-100 ml-4"
        >
          <X className="w-4 h-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}