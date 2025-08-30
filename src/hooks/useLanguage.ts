'use client'

import { useState, useEffect } from 'react'

export interface Language {
  code: string
  label: string
  flag: string
}

export const languages: Language[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' }
]

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])

  useEffect(() => {
    const savedLangCode = localStorage.getItem('preferred-language') || 'en'
    const savedLang = languages.find(lang => lang.code === savedLangCode) || languages[0]
    setCurrentLanguage(savedLang)
  }, [])

  const changeLanguage = (langCode: string) => {
    const newLang = languages.find(lang => lang.code === langCode)
    if (newLang) {
      setCurrentLanguage(newLang)
      localStorage.setItem('preferred-language', langCode)
    }
  }

  return {
    currentLanguage,
    changeLanguage,
    languages
  }
}

// 简单的翻译函数（未来可以扩展）
export function useTranslation() {
  const { currentLanguage } = useLanguage()

  const t = (key: string) => {
    // 这里可以添加实际的翻译逻辑
    // 目前只是返回键值
    return key
  }

  return { t, currentLanguage }
}
