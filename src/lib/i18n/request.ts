/**
 * next-intl request configuration
 */

import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  try {
    const messages = await import(`./messages/${locale}.json`)
    return {
      locale,
      messages: messages.default,
      timeZone: getTimeZone(locale as Locale),
      now: new Date()
    }
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error)
    // Fallback to default locale
    const messages = await import(`./messages/${defaultLocale}.json`)
    return {
      locale: defaultLocale,
      messages: messages.default,
      timeZone: getTimeZone(defaultLocale),
      now: new Date()
    }
  }
})

function getTimeZone(locale: Locale): string {
  const timeZones: Record<Locale, string> = {
    en: 'America/New_York',
    id: 'Asia/Jakarta',
    fil: 'Asia/Manila',
    sw: 'Africa/Dar_es_Salaam'
  }
  
  return timeZones[locale] || timeZones.en
}