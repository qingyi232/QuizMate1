/**
 * Option extraction utilities for multiple choice questions
 */

export interface ExtractedOption {
  letter: string // A, B, C, D, etc. (for backward compatibility)
  label: string // A, B, C, D, etc.
  text: string // The option content
  normalized: string // Cleaned option text
}

export interface OptionsResult {
  options: ExtractedOption[]
  questionText: string // Question without options
  hasValidOptions: boolean
}

/**
 * Extract multiple choice options from text
 */
export function extractOptions(text: string): OptionsResult {
  if (!text || text.trim().length === 0) {
    return {
      options: [],
      questionText: text,
      hasValidOptions: false
    }
  }

  // Try different option patterns in order of specificity
  const patterns = [
    extractPatternA, // A) B) C) format
    extractPatternB, // A. B. C. format
    extractPatternC, // (A) (B) (C) format
    extractPatternD, // A: B: C: format
    extractPatternE  // Numbered options 1) 2) 3)
  ]

  for (const pattern of patterns) {
    const result = pattern(text)
    if (result.hasValidOptions && result.options.length >= 2) {
      return result
    }
  }

  // No valid options found
  return {
    options: [],
    questionText: text.trim(),
    hasValidOptions: false
  }
}

/**
 * Extract options in A) B) C) format
 */
function extractPatternA(text: string): OptionsResult {
  const pattern = /^\s*([A-Ea-e])\)\s*(.+?)(?=\n\s*[A-Ea-e]\)|$)/gm
  return extractWithRegex(text, pattern)
}

/**
 * Extract options in A. B. C. format
 */
function extractPatternB(text: string): OptionsResult {
  const pattern = /^\s*([A-Ea-e])\.\s*(.+?)(?=\n\s*[A-Ea-e]\.|$)/gm
  return extractWithRegex(text, pattern)
}

/**
 * Extract options in (A) (B) (C) format
 */
function extractPatternC(text: string): OptionsResult {
  const pattern = /\(([A-Ea-e])\)\s*(.+?)(?=\s*\([A-Ea-e]\)|$)/g
  return extractWithRegex(text, pattern)
}

/**
 * Extract options in A: B: C: format
 */
function extractPatternD(text: string): OptionsResult {
  const pattern = /^\s*([A-Ea-e]):\s*(.+?)(?=\n\s*[A-Ea-e]:|$)/gm
  return extractWithRegex(text, pattern)
}

/**
 * Extract numbered options 1) 2) 3) format
 */
function extractPatternE(text: string): OptionsResult {
  const pattern = /^\s*(\d+)\)\s*(.+?)(?=\n\s*\d+\)|$)/gm
  const matches = Array.from(text.matchAll(pattern))
  
  if (matches.length < 2) {
    return {
      options: [],
      questionText: text.trim(),
      hasValidOptions: false
    }
  }

  let firstOptionIndex = text.length
  const options: ExtractedOption[] = []
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const optionText = match[2]
    const letter = String.fromCharCode(65 + i) // Convert to A, B, C, D...
    
    if (match.index !== undefined && match.index < firstOptionIndex) {
      firstOptionIndex = match.index
    }

    options.push({
      letter: letter,
      label: letter,
      text: optionText.trim(),
      normalized: normalizeOptionText(optionText.trim())
    })
  }

  // Extract question text (everything before first option)
  const questionText = text.substring(0, firstOptionIndex).trim()
  
  // For numbered options, we already converted them to letters, so they should be valid
  const hasValidOptions = options.length >= 2 && options.length <= 8 &&
    options.every(opt => opt.normalized.length > 0 && opt.normalized.length <= 500)

  return {
    options: hasValidOptions ? options : [],
    questionText: questionText || text.trim(),
    hasValidOptions
  }
}

/**
 * Generic regex-based option extraction
 */
function extractWithRegex(text: string, pattern: RegExp): OptionsResult {
  const options: ExtractedOption[] = []
  const matches = Array.from(text.matchAll(pattern))
  
  if (matches.length < 2) {
    return {
      options: [],
      questionText: text.trim(),
      hasValidOptions: false
    }
  }

  let firstOptionIndex = text.length
  
  for (const match of matches) {
    const label = match[1]
    const optionText = match[2]
    
    if (match.index !== undefined && match.index < firstOptionIndex) {
      firstOptionIndex = match.index
    }

    const upperLabel = label.toUpperCase()
    options.push({
      letter: upperLabel,
      label: upperLabel,
      text: optionText.trim(),
      normalized: normalizeOptionText(optionText.trim())
    })
  }

  // Extract question text (everything before first option)
  const questionText = text.substring(0, firstOptionIndex).trim()
  
  // Validate options
  const hasValidOptions = validateOptions(options)

  return {
    options: hasValidOptions ? options : [],
    questionText: questionText || text.trim(),
    hasValidOptions
  }
}

/**
 * Normalize option text by removing extra whitespace and formatting
 */
function normalizeOptionText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^[-•·]\s*/, '') // Remove bullet points
    .trim()
}

/**
 * Validate extracted options
 */
function validateOptions(options: ExtractedOption[]): boolean {
  if (options.length < 2 || options.length > 8) {
    return false
  }

  // Check for reasonable option length
  for (const option of options) {
    if (option.normalized.length === 0 || option.normalized.length > 500) {
      return false
    }
  }

  // Check for sequential labels (A, B, C or 1, 2, 3)
  // Allow some flexibility for malformed options
  const labels = options.map(opt => opt.label)
  const hasReasonableLabels = hasValidLetterLabels(labels)
  
  if (!hasReasonableLabels) {
    return false
  }

  // Check for duplicate options
  const texts = options.map(opt => opt.normalized.toLowerCase())
  const uniqueTexts = new Set(texts)
  if (uniqueTexts.size !== texts.length) {
    return false
  }

  return true
}

/**
 * Check if labels contain valid option letters (more flexible than sequential)
 */
function hasValidLetterLabels(labels: string[]): boolean {
  if (labels.length === 0) return false
  
  // Convert to uppercase for consistent comparison
  const upperLabels = labels.map(l => l.toUpperCase())
  
  // Check if most labels are valid option letters (A-E)
  const validLetters = upperLabels.filter(label => 
    /^[A-E]$/.test(label)
  )
  
  // Allow if at least half of the labels are valid letters
  // This handles cases where some options might be malformed
  return validLetters.length >= Math.ceil(labels.length / 2)
}

/**
 * Check if labels are sequential (A,B,C or 1,2,3)
 */
function isSequentialLabels(labels: string[]): boolean {
  if (labels.length === 0) return false
  
  // Convert to uppercase for consistent comparison
  const upperLabels = labels.map(l => l.toUpperCase())
  
  // Check for letter sequence
  const firstChar = upperLabels[0].charCodeAt(0)
  for (let i = 0; i < upperLabels.length; i++) {
    if (upperLabels[i].charCodeAt(0) !== firstChar + i) {
      break
    }
    if (i === labels.length - 1) {
      return true // All letters are sequential
    }
  }
  
  // Check for number sequence
  const firstNum = parseInt(labels[0], 10)
  if (!isNaN(firstNum)) {
    for (let i = 0; i < labels.length; i++) {
      const num = parseInt(labels[i], 10)
      if (isNaN(num) || num !== firstNum + i) {
        return false
      }
    }
    return true
  }
  
  return false
}

/**
 * Format options for display
 */
export function formatOptions(options: ExtractedOption[]): string {
  return options
    .map(opt => `${opt.label}) ${opt.text}`)
    .join('\n')
}

/**
 * Get option by label
 */
export function getOptionByLabel(options: ExtractedOption[], label: string): ExtractedOption | null {
  const normalizedLabel = label.toUpperCase()
  return options.find(opt => opt.label === normalizedLabel) || null
}

/**
 * Validate answer against available options
 */
export function validateAnswer(answer: string, options: ExtractedOption[]): boolean {
  if (!answer || options.length === 0) {
    return false
  }

  const normalizedAnswer = answer.toUpperCase()
  
  // Check if answer matches any option label
  return options.some(opt => opt.label === normalizedAnswer)
}

/**
 * Extract answer from text containing options and answer
 */
export function extractAnswerFromText(text: string, options: ExtractedOption[]): string | null {
  if (options.length === 0) {
    return null
  }

  const answerPatterns = [
    /answer[:\s]*([A-E])/i,
    /correct[:\s]*([A-E])/i,
    /solution[:\s]*([A-E])/i,
    /^([A-E])$/m, // Standalone letter on a line
    /\b([A-E])\s*is\s*correct/i
  ]

  for (const pattern of answerPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const label = match[1].toUpperCase()
      if (validateAnswer(label, options)) {
        return label
      }
    }
  }

  return null
}

/**
 * Generate fake options for questions that don't have them
 * This is useful for creating multiple choice versions of short answer questions
 */
export function generateOptions(questionText: string, correctAnswer: string): ExtractedOption[] {
  // This is a simplified implementation
  // In a real scenario, you might use AI to generate plausible distractors
  
  const options: ExtractedOption[] = [
    {
      label: 'A',
      text: correctAnswer,
      normalized: correctAnswer.trim()
    }
  ]

  // Generate simple distractors based on question type
  const questionLower = questionText.toLowerCase()
  
  if (questionLower.includes('true') || questionLower.includes('false')) {
    // True/False question
    options.push({
      label: 'B',
      text: correctAnswer.toLowerCase().includes('true') ? 'False' : 'True',
      normalized: correctAnswer.toLowerCase().includes('true') ? 'false' : 'true'
    })
  } else {
    // Generate generic distractors
    const distractors = [
      'Not enough information',
      'None of the above',
      'All of the above'
    ]
    
    for (let i = 0; i < Math.min(3, distractors.length); i++) {
      options.push({
        label: String.fromCharCode(66 + i), // B, C, D
        text: distractors[i],
        normalized: distractors[i].toLowerCase()
      })
    }
  }

  return options
}

/**
 * Shuffle options while maintaining correct answer mapping
 */
export function shuffleOptions(options: ExtractedOption[], correctLabel: string): { shuffled: ExtractedOption[], newCorrectLabel: string } {
  const shuffled = [...options]
  
  // Find the correct option
  const correctIndex = options.findIndex(opt => opt.label === correctLabel)
  if (correctIndex === -1) {
    return { shuffled, newCorrectLabel: correctLabel }
  }
  
  // Simple shuffle (Fisher-Yates)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  // Reassign labels and find new correct label
  let newCorrectLabel = 'A'
  for (let i = 0; i < shuffled.length; i++) {
    const newLabel = String.fromCharCode(65 + i)
    if (shuffled[i].label === correctLabel) {
      newCorrectLabel = newLabel
    }
    shuffled[i] = { ...shuffled[i], label: newLabel }
  }
  
  return { shuffled, newCorrectLabel }
}