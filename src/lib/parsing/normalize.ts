/**
 * Text normalization utilities for cleaning and standardizing input text
 */

/**
 * Normalize and clean input text for processing
 */
export function normalize(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let cleaned = text

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ')
  
  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim()

  // Remove common document headers/footers patterns
  cleaned = cleaned.replace(/^(page \d+|chapter \d+|section \d+)/i, '')
  cleaned = cleaned.replace(/(page \d+ of \d+|© \d+|copyright)/i, '')
  
  // Remove question numbering at start (like "1.", "Q1:", "Question 1:")
  cleaned = cleaned.replace(/^(q\d+[:.]\s*|question\s+\d+[:.]\s*|\d+[.)]\s*)/i, '')

  return cleaned
}

/**
 * Clean text specifically for PDF parsing
 */
export function normalizePdfText(text: string): string {
  if (!text) return ''

  let cleaned = normalize(text)

  // Remove PDF-specific artifacts
  cleaned = cleaned.replace(/\f/g, ' ') // Form feed characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
  
  // Fix broken words across lines (remove hyphenation)
  cleaned = cleaned.replace(/(\w+)-\s+(\w+)/g, '$1$2')
  
  // Remove page numbers and headers/footers
  cleaned = cleaned.replace(/^\d+\s*$/gm, '') // Standalone numbers (page numbers)
  cleaned = cleaned.replace(/^(chapter|section|part)\s+\d+.*$/gmi, '') // Chapter headers
  
  // Remove excessive line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  
  return cleaned.trim()
}

/**
 * Extract question text from mixed content
 */
export function extractQuestionText(text: string): string {
  const normalized = normalize(text)
  
  // Look for question patterns
  const questionPatterns = [
    /(?:^|\n)(.*?\?)/s, // Text ending with question mark
    /(?:^|\n)(?:question|q)[\s\d:.]*([^?]+\?)/si, // Explicit question markers
    /(?:^|\n)(which|what|who|when|where|why|how|is|are|do|does|can|will|would|should)[\s\w]*[^.]*\?/si
  ]

  for (const pattern of questionPatterns) {
    const match = normalized.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  // If no clear question pattern, return first sentence or paragraph
  const sentences = normalized.split(/[.!?]+/)
  if (sentences.length > 0 && sentences[0].length > 10) {
    return sentences[0].trim()
  }

  return normalized.substring(0, 500) // Fallback: first 500 chars
}

/**
 * Validate if text looks like a valid question
 */
export function isValidQuestion(text: string): boolean {
  const normalized = normalize(text)
  
  if (!normalized || normalized.length < 10) {
    return false
  }

  // Too long to be a reasonable question
  if (normalized.length > 2000) {
    return false
  }

  // Contains suspicious patterns that indicate it's not a question
  const suspiciousPatterns = [
    /^(lorem ipsum|test|sample|example)/i,
    /password|username|login|register/i,
    /(http|https|www\.)/i,
    /^\d+\s*$/
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(normalized)) {
      return false
    }
  }

  return true
}

/**
 * Split text into individual questions if multiple are detected
 */
export function splitQuestions(text: string): string[] {
  const normalized = normalize(text)
  
  // Split by explicit question markers
  const questionMarkers = [
    /\n\s*(?:q\d+[:.]\s*|\d+[.)]\s*|question\s+\d+[:.]\s*)/gi,
    /\n\s*(?:\d+\.\s*|\w\)\s*)/g // Numbered or lettered options
  ]

  let questions = [normalized]

  for (const marker of questionMarkers) {
    const newQuestions: string[] = []
    for (const q of questions) {
      const parts = q.split(marker)
      if (parts.length > 1) {
        newQuestions.push(...parts.filter(p => p.trim().length > 10))
      } else {
        newQuestions.push(q)
      }
    }
    questions = newQuestions
  }

  // Filter and clean individual questions
  return questions
    .map(q => normalize(q))
    .filter(q => isValidQuestion(q))
    .slice(0, 10) // Limit to 10 questions max
}

/**
 * Estimate the language of the text
 */
export function detectLanguage(text: string): string {
  if (!text) return 'unknown'

  const normalized = normalize(text).toLowerCase()

  // Common words for language detection
  const languagePatterns = {
    en: /\b(the|and|or|is|are|was|were|have|has|this|that|with|for|from|they|them|what|which|who|where|when|how)\b/g,
    id: /\b(dan|atau|adalah|yang|dari|untuk|dengan|ini|itu|di|ke|pada|akan|sudah|belum|jika|kalau|bagaimana)\b/g,
    fil: /\b(ang|at|ng|sa|na|ay|mga|para|para sa|kung|kapag|sino|ano|saan|kailan|paano|nang|may|meron)\b/g,
    sw: /\b(na|wa|ya|za|la|pa|kwa|katika|hii|hiyo|nini|nani|wapi|lini|jinsi|ikiwa|au|lakini)\b/g
  }

  const scores: Record<string, number> = {}

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    const matches = normalized.match(pattern)
    scores[lang] = matches ? matches.length : 0
  }

  // Return the language with the highest score
  const detected = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0]

  return scores[detected] > 0 ? detected : 'en' // Default to English
}

/**
 * Remove or replace LaTeX/Math expressions for processing
 */
export function handleMathExpressions(text: string): { cleanText: string; mathExpressions: Array<{ original: string; placeholder: string }> } {
  const mathExpressions: Array<{ original: string; placeholder: string }> = []
  let cleanText = text

  // LaTeX patterns
  const latexPatterns = [
    /\$\$[^$]+\$\$/g, // Display math $$...$$
    /\$[^$]+\$/g, // Inline math $...$
    /\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, // LaTeX environments
    /\\[a-zA-Z]+\{[^}]*\}/g // LaTeX commands
  ]

  let counter = 0
  for (const pattern of latexPatterns) {
    cleanText = cleanText.replace(pattern, (match) => {
      const placeholder = `__MATH_${counter++}__`
      mathExpressions.push({ original: match, placeholder })
      return placeholder
    })
  }

  return { cleanText, mathExpressions }
}

/**
 * Restore math expressions in processed text
 */
export function restoreMathExpressions(text: string, mathExpressions: Array<{ original: string; placeholder: string }>): string {
  let result = text
  for (const { original, placeholder } of mathExpressions) {
    result = result.replace(placeholder, original)
  }
  return result
}