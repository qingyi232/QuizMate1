/**
 * AI prompt templates for question answering and flashcard generation
 */

import { QuestionType } from '../parsing/detect'

/**
 * System prompt for the AI assistant
 */
export function getSystemPrompt(targetLanguage: string = 'en'): string {
  const languageInstructions = targetLanguage === 'zh' ? 
    '请用中文回答。答案要简洁明了，解释要详细易懂，包含解题步骤。' :
    'Answer in English. Be clear and educational with step-by-step explanations.'
  
  return `You are QuizMate, an educational AI tutor that helps students understand questions and problems.

CORE MISSION:
${languageInstructions}

OUTPUT FORMAT:
1. Return valid JSON exactly matching the schema
2. NO extra text outside JSON structure
3. Make answers educational and easy to understand
4. Include detailed explanations with clear steps

FOR MATH PROBLEMS:
- Show complete step-by-step solution
- Explain each step clearly
- Include final answer prominently

FOR CONCEPTUAL QUESTIONS:
- Provide clear, accurate answers
- Include helpful explanations
- Add relevant examples when useful

RESPONSE LANGUAGE: ${targetLanguage}

JSON REQUIREMENTS:
- "answer": Direct, clear answer to the question
- "explanation": Detailed step-by-step explanation
- "flashcards": 2-3 relevant study cards
- All text in ${targetLanguage === 'zh' ? '中文' : 'the target language'}

Remember: Be educational, accurate, and helpful. Output JSON only.`
}

/**
 * Generate user prompt based on question and metadata
 */
export function getUserPrompt(
  questionText: string,
  metadata: {
    inputLanguage?: string
    subject?: string
    grade?: string
    targetLanguage?: string
  } = {}
): string {
  const {
    inputLanguage = 'auto',
    subject = 'general',
    grade = 'unknown',
    targetLanguage = 'en'
  } = metadata

  const exampleFormat = targetLanguage === 'zh' ? {
    language: "zh",
    question_type: "mcq",
    subject: subject,
    answer: "2+2等于4",
    explanation: "这是一个简单的加法运算。第一步：将第一个数字2和第二个数字2相加。第二步：2+2=4。所以答案是4。",
    confidence: 0.95,
    flashcards: [
      {
        front: "2+2等于多少？",
        back: "4",
        hint: "想想基本的加法运算",
        tags: ["数学", "加法"],
        difficulty: 1
      }
    ]
  } : {
    language: targetLanguage,
    question_type: "mcq", 
    subject: subject,
    answer: "B",
    explanation: "Step-by-step explanation here...",
    confidence: 0.95,
    flashcards: [
      {
        front: "What is...?",
        back: "The answer is...",
        hint: "Think about...",
        tags: ["concept", "definition"],
        difficulty: 2
      }
    ]
  }

  return `Input language: ${inputLanguage}
Target output language: ${targetLanguage}
Subject: ${subject}
Grade level: ${grade}

Question text:
"""
${questionText.trim()}
"""

Expected JSON format:
${JSON.stringify(exampleFormat, null, 2)}

Requirements:
- Answer should be clear and direct
- Explanation should include step-by-step reasoning
- Use ${targetLanguage === 'zh' ? '中文' : 'the target language'} for all text content
- Generate educational flashcards

Respond with JSON only:`
}

/**
 * Get language-specific prompt adjustments
 */
export function getLanguageAdjustments(language: string): string {
  const adjustments = {
    id: 'Use Indonesian language conventions and educational terminology appropriate for Indonesian students.',
    fil: 'Use Filipino/Tagalog language conventions and educational terminology familiar to Filipino students.',
    sw: 'Use Kiswahili language conventions and educational terminology appropriate for East African students.',
    en: 'Use clear, international English suitable for non-native speakers.'
  }

  return adjustments[language as keyof typeof adjustments] || adjustments.en
}

/**
 * Generate subject-specific prompt enhancements
 */
export function getSubjectPrompt(subject: string): string {
  const subjectPrompts = {
    mathematics: `For mathematical problems:
- Show all calculation steps clearly
- Use proper mathematical notation
- Explain the reasoning behind each step
- Include formula references when applicable`,

    science: `For science questions:
- Use scientific terminology appropriately
- Explain concepts with real-world examples
- Reference scientific principles and laws
- Include relevant units and measurements`,

    history: `For history questions:
- Provide context and dates when relevant
- Explain cause and effect relationships
- Reference key historical figures and events
- Consider multiple perspectives when appropriate`,

    language: `For language questions:
- Focus on grammar rules and usage
- Provide examples of correct usage
- Explain language patterns
- Include pronunciation guides when helpful`,

    general: `For general questions:
- Adapt explanation style to the topic
- Use clear, educational language
- Provide practical examples
- Make content accessible to students`
  }

  return subjectPrompts[subject as keyof typeof subjectPrompts] || subjectPrompts.general
}

/**
 * Get grade-appropriate language adjustments
 */
export function getGradePrompt(grade: string): string {
  // Extract numeric grade level
  const gradeNum = parseInt(grade.replace(/\D/g, ''), 10)
  
  if (gradeNum <= 6) {
    return 'Use simple, clear language appropriate for elementary students. Avoid complex terminology.'
  } else if (gradeNum <= 9) {
    return 'Use intermediate language suitable for middle school students. Introduce key terminology with explanations.'
  } else if (gradeNum <= 12) {
    return 'Use advanced language appropriate for high school students. Include sophisticated concepts and terminology.'
  } else {
    return 'Use college-level language with professional terminology and complex concepts.'
  }
}

/**
 * Generate question type specific instructions
 */
export function getQuestionTypePrompt(questionType: QuestionType): string {
  const typePrompts = {
    mcq: `Multiple Choice Question (Single Answer):
- Analyze each option carefully
- Select the ONE best answer
- Explain why the chosen option is correct
- Briefly explain why other options are incorrect`,

    multi: `Multiple Choice Question (Multiple Answers):
- Identify ALL correct options
- Return answer as comma-separated letters (e.g., "A,C,D")
- Explain why each selected option is correct
- Explain why unselected options are incorrect`,

    true_false: `True/False Question:
- Determine if the statement is true or false
- Answer with "True" or "False"
- Explain the reasoning clearly
- Address any nuances or exceptions`,

    short: `Short Answer Question:
- Provide a concise but complete answer
- Show reasoning or calculation steps
- Include key concepts and principles
- Use appropriate academic language`,

    unknown: `Unknown Question Type:
- Ask for clarification about what is being asked
- Suggest how the question could be reformulated
- Provide helpful guidance for the student`
  }

  return typePrompts[questionType] || typePrompts.unknown
}

/**
 * Generate moderation prompt for content filtering
 */
export function getModerationPrompt(): string {
  return `Check this content for appropriateness:

REJECT if content contains:
- Medical advice or diagnosis
- Legal advice or interpretation  
- Harmful, violent, or inappropriate content
- Personal information requests
- Commercial or promotional content

ACCEPT educational content including:
- Academic questions and problems
- Learning exercises and examples
- General knowledge questions
- Study materials and explanations

Return: {"appropriate": true/false, "reason": "explanation if rejected"}`
}

/**
 * Generate flashcard-specific prompts
 */
export function getFlashcardPrompt(concept: string, context: string): string {
  return `Create educational flashcards for: ${concept}

Context: ${context}

Generate 3-4 flashcards that:
1. Test key concepts and definitions
2. Include practical applications
3. Use progressive difficulty levels
4. Reinforce learning through repetition

Each flashcard should:
- Have a clear, specific question on the front
- Provide a complete but concise answer on the back
- Include helpful hints when appropriate
- Use tags for categorization
- Set appropriate difficulty (1-5)`
}

/**
 * Generate error recovery prompts
 */
export function getErrorRecoveryPrompt(error: string, originalPrompt: string): string {
  return `Previous attempt failed with error: ${error}

Original request: ${originalPrompt}

Please:
1. Fix the JSON format error
2. Ensure all required fields are present
3. Follow the exact schema provided
4. Return only valid JSON, no extra text

Try again with corrected format:`
}

/**
 * Build complete prompt by combining components
 */
export function buildCompletePrompt(
  questionText: string,
  options: {
    targetLanguage?: string
    inputLanguage?: string
    subject?: string
    grade?: string
    questionType?: QuestionType
  } = {}
): { systemPrompt: string; userPrompt: string } {
  const {
    targetLanguage = 'en',
    inputLanguage = 'auto',
    subject = 'general',
    grade = 'unknown',
    questionType
  } = options

  // Build system prompt
  let systemPrompt = getSystemPrompt(targetLanguage)
  
  // Add language adjustments
  systemPrompt += '\n\n' + getLanguageAdjustments(targetLanguage)
  
  // Add subject-specific instructions
  systemPrompt += '\n\n' + getSubjectPrompt(subject)
  
  // Add grade-appropriate instructions
  systemPrompt += '\n\n' + getGradePrompt(grade)
  
  // Add question type specific instructions if known
  if (questionType && questionType !== 'unknown') {
    systemPrompt += '\n\n' + getQuestionTypePrompt(questionType)
  }

  // Build user prompt
  const userPrompt = getUserPrompt(questionText, {
    inputLanguage,
    subject,
    grade,
    targetLanguage
  })

  return { systemPrompt, userPrompt }
}

/**
 * Template for retry with schema correction
 */
export function getSchemaFixPrompt(invalidJSON: string, schemaError: string): string {
  return `The JSON response was invalid. Error: ${schemaError}

Invalid JSON:
${invalidJSON}

Please fix and return valid JSON that matches this exact schema:
{
  "language": "string (required)",
  "question_type": "mcq|multi|short|true_false|unknown",
  "subject": "string (optional)",
  "answer": "string (required, min 1 char)",
  "explanation": "string (required, min 10 chars)",
  "confidence": "number 0-1 (optional)",
  "flashcards": [
    {
      "front": "string (required)",
      "back": "string (required)",
      "hint": "string (optional)",
      "tags": ["array of strings (optional)"],
      "difficulty": "integer 1-5 (default 2)"
    }
  ]
}

Return only the corrected JSON:`
}

/**
 * Generate prompts for different educational levels
 */
export const EDUCATION_LEVELS = {
  elementary: 'elementary school (ages 6-11)',
  middle: 'middle school (ages 12-14)',
  high: 'high school (ages 15-18)',
  college: 'college/university level',
  adult: 'adult learning/professional development'
} as const

/**
 * Get prompts optimized for different languages/regions
 */
export const REGION_PROMPTS = {
  en: 'International English for global students',
  id: 'Indonesian educational context and terminology',
  fil: 'Filipino educational system and cultural context',
  sw: 'East African educational context (Kenya, Tanzania, Uganda)'
} as const