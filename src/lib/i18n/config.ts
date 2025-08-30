/**
 * i18n configuration for next-intl
 */

export const locales = ['en', 'zh', 'id', 'fil', 'sw'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  id: 'Bahasa Indonesia', 
  fil: 'Filipino',
  sw: 'Kiswahili'
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  id: '🇮🇩',
  fil: '🇵🇭', 
  sw: '🇹🇿'
}

// AI output language mapping
export const aiLanguageMapping: Record<Locale, string> = {
  en: 'en',
  zh: 'zh',
  id: 'id', 
  fil: 'fil',
  sw: 'sw'
}

// Supported time zones for each locale
export const localeTimeZones: Record<Locale, string> = {
  en: 'America/New_York',
  zh: 'Asia/Shanghai',
  id: 'Asia/Jakarta',
  fil: 'Asia/Manila',
  sw: 'Africa/Dar_es_Salaam'
}

// Currency codes for each locale
export const localeCurrencies: Record<Locale, string> = {
  en: 'USD',
  zh: 'USD', // Use USD for consistency in pricing
  id: 'USD', // Use USD for consistency in pricing
  fil: 'USD',
  sw: 'USD'
}

// Number formatting preferences
export const localeNumberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  en: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  zh: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  id: {
    style: 'decimal', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  fil: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  sw: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
}

// Date formatting preferences
export const localeDateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  en: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  zh: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  id: {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  },
  fil: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  sw: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/')
  const localeSegment = segments[1]
  return isValidLocale(localeSegment) ? localeSegment : null
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/')
  if (isValidLocale(segments[1])) {
    return '/' + segments.slice(2).join('/')
  }
  return pathname
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPath(pathname)
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}