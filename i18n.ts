/**
 * Next.js i18n configuration for next-intl
 */

import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from './src/lib/i18n/config'

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  try {
    const messages = await import(`./src/lib/i18n/messages/${locale}.json`)
    return {
      locale: locale as string,
      messages: messages.default,
      timeZone: getTimeZone(locale as Locale),
      now: new Date()
    }
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error)
    notFound()
  }
})

function getTimeZone(locale: Locale): string {
  const timeZones: Record<Locale, string> = {
    en: 'America/New_York',
    zh: 'Asia/Shanghai',
    id: 'Asia/Jakarta',
    fil: 'Asia/Manila',
    sw: 'Africa/Dar_es_Salaam'
  }
  
  return timeZones[locale] || timeZones.en
}