'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

// 简化的语言配置
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' }
]

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('en')
  const router = useRouter()

  // 获取当前语言（从 localStorage 或 URL）
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setCurrentLang(savedLang)
  }, [])

  const handleLanguageChange = (newLang: string) => {
    setCurrentLang(newLang)
    // 保存到 localStorage
    localStorage.setItem('preferred-language', newLang)
    
    // 简单的语言切换提示
    if (newLang !== 'en') {
      alert(`语言已切换到 ${languages.find(l => l.code === newLang)?.label}。\n注意：完整的多语言功能正在开发中。`)
    }
    
    // 可选：重新加载页面以应用语言设置
    // window.location.reload()
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0]

  return (
    <div suppressHydrationWarning>
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px] h-9">
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.label}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}