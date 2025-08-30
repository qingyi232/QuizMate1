/**
 * Question type detection utilities
 */

export type QuestionType = 'mcq' | 'multi' | 'short' | 'true_false' | 'unknown'

export interface QuestionAnalysis {
  type: QuestionType
  confidence: number
  hasOptions: boolean
  optionCount: number
  features: string[]
}

/**
 * Detect the type of question from text content
 */
export function detectQuestionType(text: string): QuestionAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      hasOptions: false,
      optionCount: 0,
      features: ['empty_text']
    }
  }

  const normalizedText = text.toLowerCase().trim()
  const features: string[] = []
  let confidence = 0

  // Check for multiple choice options
  const hasOptions = checkForOptions(text)
  const optionCount = countOptions(text)
  
  if (hasOptions) {
    features.push('has_options')
    confidence += 0.3
  }

  // True/False detection
  const truefalseScore = detectTrueFalse(normalizedText)
  if (truefalseScore > 0.7) {
    features.push('true_false_keywords')
    return {
      type: 'true_false',
      confidence: truefalseScore,
      hasOptions: hasOptions,
      optionCount: optionCount,
      features: features
    }
  }

  // MCQ detection (single answer)
  const mcqScore = detectMCQ(normalizedText, hasOptions, optionCount)
  if (mcqScore > 0.6) {
    features.push('single_choice_indicators')
    return {
      type: 'mcq',
      confidence: mcqScore,
      hasOptions: hasOptions,
      optionCount: optionCount,
      features: features
    }
  }

  // Multiple choice detection (multiple answers)
  const multiScore = detectMultiChoice(normalizedText, hasOptions, optionCount)
  if (multiScore > 0.6) {
    features.push('multiple_choice_indicators')
    return {
      type: 'multi',
      confidence: multiScore,
      hasOptions: hasOptions,
      optionCount: optionCount,
      features: features
    }
  }

  // Short answer detection
  const shortScore = detectShortAnswer(normalizedText)
  if (shortScore > 0.5) {
    features.push('short_answer_indicators')
    return {
      type: 'short',
      confidence: shortScore,
      hasOptions: hasOptions,
      optionCount: optionCount,
      features: features
    }
  }

  // Default to unknown if no clear pattern
  return {
    type: 'unknown',
    confidence: 0.1,
    hasOptions: hasOptions,
    optionCount: optionCount,
    features: features.length > 0 ? features : ['no_clear_pattern']
  }
}

/**
 * Check if text contains multiple choice options
 */
function checkForOptions(text: string): boolean {
  const optionPatterns = [
    /[A-E]\)\s/g,           // A) B) C)
    /[A-E]\.\s/g,           // A. B. C.
    /\([A-E]\)\s/g,         // (A) (B) (C)
    /[A-E]:\s/g,            // A: B: C:
    /^\s*[A-E][\)\.]\s/gm,  // Line starting with A) or A.
    /\n\s*[A-E][\)\.]\s/g   // New line with A) or A.
  ]

  return optionPatterns.some(pattern => pattern.test(text))
}

/**
 * Count the number of options in the text
 */
function countOptions(text: string): number {
  const optionPatterns = [
    /[A-E]\)\s/g,
    /[A-E]\.\s/g,
    /\([A-E]\)\s/g,
    /[A-E]:\s/g,
    /^\s*[A-E][\)\.]\s/gm
  ]

  let maxCount = 0
  for (const pattern of optionPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      maxCount = Math.max(maxCount, matches.length)
    }
  }

  return maxCount
}

/**
 * Detect True/False questions
 */
function detectTrueFalse(text: string): number {
  let score = 0

  // True/False keywords
  const tfKeywords = [
    'true or false',
    'true/false',
    'verdadero o falso',
    'benar atau salah',
    'tama o mali',
    'kweli au uwongo'
  ]

  for (const keyword of tfKeywords) {
    if (text.includes(keyword)) {
      score += 0.8
      break
    }
  }

  // Binary choice patterns
  const binaryPatterns = [
    /\b(true|false)\b.*\b(true|false)\b/i,
    /\b(yes|no)\b.*\b(yes|no)\b/i,
    /\b(correct|incorrect)\b.*\b(correct|incorrect)\b/i
  ]

  for (const pattern of binaryPatterns) {
    if (pattern.test(text)) {
      score += 0.6
      break
    }
  }

  // Question patterns typical of T/F
  const tfQuestionPatterns = [
    /is it true that/i,
    /is this statement/i,
    /the following statement is/i,
    /true or false:/i
  ]

  for (const pattern of tfQuestionPatterns) {
    if (pattern.test(text)) {
      score += 0.4
    }
  }

  return Math.min(score, 1.0)
}

/**
 * Detect multiple choice questions (single answer)
 */
function detectMCQ(text: string, hasOptions: boolean, optionCount: number): number {
  let score = 0

  if (hasOptions) {
    score += 0.4
    
    // More options suggest MCQ
    if (optionCount >= 3) {
      score += 0.3
    }
    if (optionCount >= 4) {
      score += 0.2
    }
  }

  // MCQ indicator phrases
  const mcqPatterns = [
    /which of the following/i,
    /select the best/i,
    /choose the correct/i,
    /what is the/i,
    /which one/i,
    /the best answer is/i,
    /select one/i,
    /choose one/i
  ]

  for (const pattern of mcqPatterns) {
    if (pattern.test(text)) {
      score += 0.3
      break
    }
  }

  // Single answer indicators
  const singleAnswerPatterns = [
    /only one/i,
    /single correct/i,
    /best answer/i,
    /most appropriate/i
  ]

  for (const pattern of singleAnswerPatterns) {
    if (pattern.test(text)) {
      score += 0.2
    }
  }

  return Math.min(score, 1.0)
}

/**
 * Detect multiple choice questions (multiple answers)
 */
function detectMultiChoice(text: string, hasOptions: boolean, optionCount: number): number {
  let score = 0

  if (hasOptions && optionCount >= 3) {
    score += 0.3
  }

  // Multiple answer indicators
  const multiPatterns = [
    /select all/i,
    /choose all/i,
    /which of the following are/i,
    /all that apply/i,
    /more than one/i,
    /multiple correct/i,
    /check all/i,
    /mark all/i
  ]

  for (const pattern of multiPatterns) {
    if (pattern.test(text)) {
      score += 0.6
      break
    }
  }

  // Plural forms suggesting multiple answers
  const pluralPatterns = [
    /which ones/i,
    /what are/i,
    /list all/i,
    /name all/i,
    /identify all/i
  ]

  for (const pattern of pluralPatterns) {
    if (pattern.test(text)) {
      score += 0.3
    }
  }

  return Math.min(score, 1.0)
}

/**
 * Detect short answer questions
 */
function detectShortAnswer(text: string): number {
  let score = 0

  // Open-ended question words
  const openEndedPatterns = [
    /^(explain|describe|discuss|analyze|compare|contrast|evaluate|define|outline|summarize)/i,
    /how would you/i,
    /what do you think/i,
    /in your opinion/i,
    /give an example/i,
    /provide/i,
    /calculate/i,
    /solve/i,
    /find/i,
    /determine/i
  ]

  for (const pattern of openEndedPatterns) {
    if (pattern.test(text)) {
      score += 0.4
      break
    }
  }

  // Question words that typically require longer answers
  const longAnswerWords = [
    /\bwhy\b/i,
    /\bhow\b/i,
    /\bexplain\b/i,
    /\bdescribe\b/i,
    /\bcompare\b/i,
    /\banalyze\b/i
  ]

  for (const pattern of longAnswerWords) {
    if (pattern.test(text)) {
      score += 0.2
    }
  }

  // Mathematical problem indicators
  const mathPatterns = [
    /solve for/i,
    /calculate/i,
    /find the value/i,
    /what is.*\+.*=/i,
    /\d+\s*[\+\-\*\/]\s*\d+/,
    /equation/i,
    /formula/i
  ]

  for (const pattern of mathPatterns) {
    if (pattern.test(text)) {
      score += 0.3
      break
    }
  }

  // Lack of options suggests short answer
  if (!checkForOptions(text)) {
    score += 0.2
  }

  return Math.min(score, 1.0)
}

/**
 * Get question type description for humans
 */
export function getQuestionTypeDescription(type: QuestionType): string {
  switch (type) {
    case 'mcq':
      return 'Multiple Choice (Single Answer)'
    case 'multi':
      return 'Multiple Choice (Multiple Answers)'
    case 'short':
      return 'Short Answer'
    case 'true_false':
      return 'True/False'
    case 'unknown':
      return 'Unknown Question Type'
    default:
      return 'Unknown'
  }
}

/**
 * Determine if question type requires options
 */
export function requiresOptions(type: QuestionType): boolean {
  return type === 'mcq' || type === 'multi' || type === 'true_false'
}

/**
 * Get recommended difficulty based on question characteristics
 */
export function estimateDifficulty(text: string, type: QuestionType): number {
  let difficulty = 2 // Default difficulty

  const textLength = text.length
  
  // Longer questions tend to be more complex
  if (textLength > 500) {
    difficulty += 1
  } else if (textLength < 100) {
    difficulty -= 1
  }

  // Certain types are inherently harder
  switch (type) {
    case 'short':
      difficulty += 1 // Open-ended questions are typically harder
      break
    case 'true_false':
      difficulty -= 1 // T/F questions are typically easier
      break
  }

  // Keywords that suggest higher difficulty
  const complexKeywords = [
    'analyze', 'evaluate', 'synthesize', 'compare', 'contrast',
    'justify', 'critique', 'assess', 'interpret', 'conclude'
  ]

  const lowerText = text.toLowerCase()
  for (const keyword of complexKeywords) {
    if (lowerText.includes(keyword)) {
      difficulty += 1
      break
    }
  }

  // Mathematical content typically increases difficulty
  if (/\d+\s*[\+\-\*\/]\s*\d+|equation|formula|calculate|solve/.test(lowerText)) {
    difficulty += 1
  }

  // Ensure difficulty is within reasonable bounds
  return Math.max(1, Math.min(5, difficulty))
}