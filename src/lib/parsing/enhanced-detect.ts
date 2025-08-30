/**
 * Enhanced question type detection with support for multiple question types
 */

import type { QuestionType } from '@/lib/ai/schema'

export interface EnhancedQuestionAnalysis {
  type: QuestionType
  confidence: number
  hasOptions: boolean
  optionCount: number
  features: string[]
  detectedPatterns: {
    options?: string[]
    blanks?: string[]
    pairs?: Array<{ left: string; right: string }>
    sequence?: string[]
    codeLanguage?: string
    variables?: Record<string, any>
  }
}

/**
 * Enhanced question type detection with comprehensive pattern recognition
 */
export function detectEnhancedQuestionType(text: string): EnhancedQuestionAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      type: 'unknown',
      confidence: 0,
      hasOptions: false,
      optionCount: 0,
      features: ['empty_text'],
      detectedPatterns: {}
    }
  }

  const normalizedText = text.toLowerCase().trim()
  const features: string[] = []
  const detectedPatterns: any = {}

  // 1. Fill in the blank detection
  const fillBlankResult = detectFillBlank(text)
  if (fillBlankResult.confidence > 0.8) {
    return {
      type: 'fill_blank',
      confidence: fillBlankResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: fillBlankResult.features,
      detectedPatterns: { blanks: fillBlankResult.blanks }
    }
  }

  // 2. Matching question detection
  const matchingResult = detectMatching(text)
  if (matchingResult.confidence > 0.7) {
    return {
      type: 'matching',
      confidence: matchingResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: matchingResult.features,
      detectedPatterns: { pairs: matchingResult.pairs }
    }
  }

  // 3. Ordering/Sequencing detection
  const orderingResult = detectOrdering(text)
  if (orderingResult.confidence > 0.7) {
    return {
      type: 'ordering',
      confidence: orderingResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: orderingResult.features,
      detectedPatterns: { sequence: orderingResult.sequence }
    }
  }

  // 4. Coding question detection
  const codingResult = detectCoding(text)
  if (codingResult.confidence > 0.8) {
    return {
      type: 'coding',
      confidence: codingResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: codingResult.features,
      detectedPatterns: { codeLanguage: codingResult.language }
    }
  }

  // 5. Mathematical calculation detection
  const calculationResult = detectCalculation(text)
  if (calculationResult.confidence > 0.7) {
    return {
      type: 'calculation',
      confidence: calculationResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: calculationResult.features,
      detectedPatterns: { variables: calculationResult.variables }
    }
  }

  // 6. Multiple choice detection
  const mcqResult = detectMultipleChoice(text)
  if (mcqResult.confidence > 0.6) {
    return {
      type: mcqResult.isMultiSelect ? 'multi' : 'mcq',
      confidence: mcqResult.confidence,
      hasOptions: true,
      optionCount: mcqResult.options.length,
      features: mcqResult.features,
      detectedPatterns: { options: mcqResult.options }
    }
  }

  // 7. True/False detection
  const trueFalseResult = detectTrueFalse(text)
  if (trueFalseResult.confidence > 0.7) {
    return {
      type: 'true_false',
      confidence: trueFalseResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: trueFalseResult.features,
      detectedPatterns: {}
    }
  }

  // 8. Essay question detection
  const essayResult = detectEssay(text)
  if (essayResult.confidence > 0.6) {
    return {
      type: 'essay',
      confidence: essayResult.confidence,
      hasOptions: false,
      optionCount: 0,
      features: essayResult.features,
      detectedPatterns: {}
    }
  }

  // Default to short answer
  return {
    type: 'short',
    confidence: 0.5,
    hasOptions: false,
    optionCount: 0,
    features: ['default_short_answer'],
    detectedPatterns: {}
  }
}

/**
 * Detect fill-in-the-blank questions
 */
function detectFillBlank(text: string): { confidence: number; features: string[]; blanks: string[] } {
  const features: string[] = []
  const blanks: string[] = []
  let confidence = 0

  // Common blank patterns
  const blankPatterns = [
    /_{3,}/g,                    // Underscores: ____
    /\[_+\]/g,                   // Brackets with underscores: [___]
    /\(\s*\)/g,                  // Empty parentheses: ( )
    /\[[\s]*\]/g,                // Empty brackets: [ ]
    /\{\s*\}/g,                  // Empty braces: { }
    /\[\?\]/g,                   // Question mark in brackets: [?]
    /___+/g,                     // Multiple underscores
    /\.{3,}/g,                   // Multiple dots: ...
  ]

  for (const pattern of blankPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      features.push('blank_pattern_found')
      confidence += 0.3
      blanks.push(...matches)
    }
  }

  // Keyword indicators
  const fillBlankKeywords = [
    'fill in the blank', 'complete the sentence', 'fill the gap',
    '填空', '完成句子', '补全', '填入'
  ]

  for (const keyword of fillBlankKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('fill_blank_keyword')
      confidence += 0.4
    }
  }

  return { confidence: Math.min(confidence, 1), features, blanks }
}

/**
 * Detect matching questions
 */
function detectMatching(text: string): { 
  confidence: number; 
  features: string[]; 
  pairs: Array<{ left: string; right: string }> 
} {
  const features: string[] = []
  const pairs: Array<{ left: string; right: string }> = []
  let confidence = 0

  // Matching keywords
  const matchingKeywords = [
    'match', 'connect', 'pair', 'link', 'associate',
    '匹配', '连接', '配对', '关联'
  ]

  for (const keyword of matchingKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('matching_keyword')
      confidence += 0.3
    }
  }

  // Look for column structures (A-1, B-2, etc.)
  const columnPattern = /([A-Z])\s*[-–—]\s*(\d+)/g
  const columnMatches = text.match(columnPattern)
  if (columnMatches && columnMatches.length >= 2) {
    features.push('column_structure')
    confidence += 0.4
  }

  // Look for bullet point pairs
  const lines = text.split('\n').filter(line => line.trim())
  let leftColumn: string[] = []
  let rightColumn: string[] = []
  
  for (const line of lines) {
    if (/^[A-Z]\.\s/.test(line)) {
      leftColumn.push(line.replace(/^[A-Z]\.\s/, ''))
    } else if (/^[1-9]\.\s/.test(line)) {
      rightColumn.push(line.replace(/^[1-9]\.\s/, ''))
    }
  }

  if (leftColumn.length >= 2 && rightColumn.length >= 2) {
    features.push('two_column_structure')
    confidence += 0.4
    
    // Create pairs (this would be enhanced in real AI processing)
    for (let i = 0; i < Math.min(leftColumn.length, rightColumn.length); i++) {
      pairs.push({ left: leftColumn[i], right: rightColumn[i] })
    }
  }

  return { confidence: Math.min(confidence, 1), features, pairs }
}

/**
 * Detect ordering/sequencing questions
 */
function detectOrdering(text: string): {
  confidence: number;
  features: string[];
  sequence: string[];
} {
  const features: string[] = []
  const sequence: string[] = []
  let confidence = 0

  // Ordering keywords
  const orderingKeywords = [
    'order', 'sequence', 'arrange', 'sort', 'chronological',
    '排序', '排列', '顺序', '按顺序', '时间顺序'
  ]

  for (const keyword of orderingKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('ordering_keyword')
      confidence += 0.3
    }
  }

  // Look for numbered or lettered lists
  const lines = text.split('\n').filter(line => line.trim())
  const numberedItems: string[] = []
  
  for (const line of lines) {
    const numberedMatch = line.match(/^[1-9]\.\s(.+)$/)
    const letteredMatch = line.match(/^[A-Z]\.\s(.+)$/)
    
    if (numberedMatch) {
      numberedItems.push(numberedMatch[1])
    } else if (letteredMatch) {
      numberedItems.push(letteredMatch[1])
    }
  }

  if (numberedItems.length >= 3) {
    features.push('multiple_items_found')
    confidence += 0.4
    sequence.push(...numberedItems)
  }

  return { confidence: Math.min(confidence, 1), features, sequence }
}

/**
 * Detect coding questions
 */
function detectCoding(text: string): {
  confidence: number;
  features: string[];
  language?: string;
} {
  const features: string[] = []
  let confidence = 0
  let language: string | undefined

  // Programming language indicators
  const languagePatterns = {
    'python': /\b(def|print|import|if __name__|class)\b/i,
    'javascript': /\b(function|const|let|var|console\.log)\b/i,
    'java': /\b(public class|System\.out\.println|public static void main)\b/i,
    'c++': /\b(#include|iostream|cout|cin|int main)\b/i,
    'sql': /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b/i,
    'html': /<[^>]+>/,
    'css': /\{[^}]*\}/
  }

  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      features.push(`${lang}_syntax`)
      confidence += 0.4
      language = lang
    }
  }

  // Code block indicators
  if (text.includes('```') || text.includes('```')) {
    features.push('code_block_markdown')
    confidence += 0.3
  }

  // Programming keywords
  const codingKeywords = [
    'write a function', 'implement', 'algorithm', 'debug',
    '编写函数', '实现', '算法', '调试', '代码'
  ]

  for (const keyword of codingKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('coding_keyword')
      confidence += 0.2
    }
  }

  return { confidence: Math.min(confidence, 1), features, language }
}

/**
 * Detect mathematical calculation questions
 */
function detectCalculation(text: string): {
  confidence: number;
  features: string[];
  variables: Record<string, any>;
} {
  const features: string[] = []
  const variables: Record<string, any> = {}
  let confidence = 0

  // Mathematical operators and symbols
  const mathPatterns = [
    /\d+\s*[+\-*/=]\s*\d+/,     // Basic arithmetic: 2 + 3
    /\d+\s*[+\-*/]\s*[a-z]/i,   // Variable arithmetic: 2x + 3
    /[a-z]\s*=\s*\d+/i,         // Variable assignment: x = 5
    /∫|∑|∏|√|∆/,                // Mathematical symbols
    /sin|cos|tan|log|ln/i,      // Mathematical functions
    /\^\d+|\d+\^/,              // Exponents
    /\([^)]*\)/                 // Parentheses for grouping
  ]

  for (const pattern of mathPatterns) {
    if (pattern.test(text)) {
      features.push('math_pattern')
      confidence += 0.3
    }
  }

  // Calculation keywords
  const calcKeywords = [
    'solve', 'calculate', 'compute', 'find', 'determine',
    '计算', '求解', '解', '求', '计算出'
  ]

  for (const keyword of calcKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('calculation_keyword')
      confidence += 0.2
    }
  }

  // Extract variables (simple pattern)
  const variableMatches = text.match(/([a-z])\s*=\s*(\d+)/gi)
  if (variableMatches) {
    for (const match of variableMatches) {
      const [, variable, value] = match.match(/([a-z])\s*=\s*(\d+)/i) || []
      if (variable && value) {
        variables[variable] = parseInt(value)
      }
    }
    features.push('variables_found')
    confidence += 0.2
  }

  return { confidence: Math.min(confidence, 1), features, variables }
}

/**
 * Enhanced multiple choice detection
 */
function detectMultipleChoice(text: string): {
  confidence: number;
  features: string[];
  options: string[];
  isMultiSelect: boolean;
} {
  const features: string[] = []
  const options: string[] = []
  let confidence = 0
  let isMultiSelect = false

  // Option patterns
  const optionPatterns = [
    /^[A-Z]\.\s(.+)$/gm,        // A. Option
    /^[A-Z]\)\s(.+)$/gm,        // A) Option
    /^\([A-Z]\)\s(.+)$/gm,      // (A) Option
    /^[1-9]\.\s(.+)$/gm,        // 1. Option
    /^[1-9]\)\s(.+)$/gm,        // 1) Option
  ]

  for (const pattern of optionPatterns) {
    const matches = Array.from(text.matchAll(pattern))
    if (matches.length >= 2) {
      features.push('option_pattern_found')
      confidence += 0.4
      options.push(...matches.map(match => match[1]))
    }
  }

  // Multi-select indicators
  const multiSelectKeywords = [
    'select all', 'choose all', 'multiple answers', 'all that apply',
    '全选', '多选', '选择所有'
  ]

  for (const keyword of multiSelectKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('multi_select_keyword')
      isMultiSelect = true
      confidence += 0.2
    }
  }

  return { confidence: Math.min(confidence, 1), features, options, isMultiSelect }
}

/**
 * Enhanced true/false detection
 */
function detectTrueFalse(text: string): {
  confidence: number;
  features: string[];
} {
  const features: string[] = []
  let confidence = 0

  // True/False keywords
  const tfKeywords = [
    'true or false', 'true/false', 't/f', 'correct or incorrect',
    '对错', '判断题', '正确或错误', '对或错'
  ]

  for (const keyword of tfKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('true_false_keyword')
      confidence += 0.5
    }
  }

  // Statement indicators
  const statementKeywords = [
    'statement', 'assertion', 'claim',
    '陈述', '断言', '说法'
  ]

  for (const keyword of statementKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('statement_keyword')
      confidence += 0.2
    }
  }

  return { confidence: Math.min(confidence, 1), features }
}

/**
 * Detect essay questions
 */
function detectEssay(text: string): {
  confidence: number;
  features: string[];
} {
  const features: string[] = []
  let confidence = 0

  // Essay keywords
  const essayKeywords = [
    'explain', 'describe', 'discuss', 'analyze', 'compare', 'contrast',
    'evaluate', 'justify', 'argue', 'essay',
    '解释', '描述', '讨论', '分析', '比较', '评价', '论述', '说明'
  ]

  for (const keyword of essayKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      features.push('essay_keyword')
      confidence += 0.2
    }
  }

  // Question length (essays tend to be longer)
  if (text.length > 200) {
    features.push('long_question')
    confidence += 0.1
  }

  return { confidence: Math.min(confidence, 1), features }
}