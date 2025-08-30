/**
 * Unit tests for Zod schema validation
 */

import { describe, it, expect } from 'vitest'
import { 
  QuestionInputSchema, 
  AnswerSchema, 
  validateAIResponse,
  sanitizeAIResponse
} from '@/lib/ai/schema'

describe('Question Input Schema Validation', () => {
  it('should validate valid question input', () => {
    const validInput = {
      text: 'What is the capital of France?',
      meta: {
        subject: 'Geography',
        grade: 'Grade 10',
        language: 'en',
        target_language: 'en'
      }
    }

    const result = QuestionInputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.text).toBe(validInput.text)
      expect(result.data.meta?.subject).toBe(validInput.meta.subject)
    }
  })

  it('should validate input with minimal required fields', () => {
    const minimalInput = {
      text: 'Simple question?'
    }

    const result = QuestionInputSchema.safeParse(minimalInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.text).toBe(minimalInput.text)
      expect(result.data.meta).toEqual({})
    }
  })

  it('should reject empty text', () => {
    const invalidInput = {
      text: '',
      meta: {}
    }

    const result = QuestionInputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should reject missing text field', () => {
    const invalidInput = {
      meta: {
        subject: 'Math'
      }
    }

    const result = QuestionInputSchema.safeParse(invalidInput)
    expect(result.success).toBe(false)
  })

  it('should handle optional meta fields', () => {
    const inputWithPartialMeta = {
      text: 'Test question?',
      meta: {
        subject: 'Science'
        // Other fields omitted
      }
    }

    const result = QuestionInputSchema.safeParse(inputWithPartialMeta)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.meta?.subject).toBe('Science')
      expect(result.data.meta?.grade).toBeUndefined()
    }
  })
})

describe('Answer Schema Validation', () => {
  it('should validate complete valid answer', () => {
    const validAnswer = {
      language: 'en',
      question_type: 'mcq' as const,
      subject: 'Geography',
      answer: 'B',
      explanation: 'Paris is the capital city of France, located in the north-central part of the country.',
      confidence: 0.95,
      flashcards: [
        {
          front: 'What is the capital of France?',
          back: 'Paris',
          hint: 'City of Light',
          tags: ['geography', 'capitals', 'france'],
          difficulty: 2
        }
      ]
    }

    const result = AnswerSchema.safeParse(validAnswer)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.language).toBe('en')
      expect(result.data.question_type).toBe('mcq')
      expect(result.data.answer).toBe('B')
      expect(result.data.flashcards).toHaveLength(1)
    }
  })

  it('should validate minimal valid answer', () => {
    const minimalAnswer = {
      language: 'en',
      question_type: 'short' as const,
      answer: 'Photosynthesis is the process by which plants make food.',
      explanation: 'Plants use sunlight, water, and carbon dioxide to create glucose and oxygen.',
      flashcards: []
    }

    const result = AnswerSchema.safeParse(minimalAnswer)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.flashcards).toHaveLength(0)
      expect(result.data.confidence).toBeUndefined()
    }
  })

  it('should reject answer with short explanation', () => {
    const invalidAnswer = {
      language: 'en',
      question_type: 'mcq' as const,
      answer: 'A',
      explanation: 'Short',  // Too short (< 10 characters)
      flashcards: []
    }

    const result = AnswerSchema.safeParse(invalidAnswer)
    expect(result.success).toBe(false)
  })

  it('should reject answer with invalid question type', () => {
    const invalidAnswer = {
      language: 'en',
      question_type: 'invalid_type',
      answer: 'Test answer',
      explanation: 'This is a valid explanation that is long enough.',
      flashcards: []
    }

    const result = AnswerSchema.safeParse(invalidAnswer)
    expect(result.success).toBe(false)
  })

  it('should reject answer with too many flashcards', () => {
    const flashcards = Array(10).fill({
      front: 'Test question',
      back: 'Test answer',
      difficulty: 2
    })

    const invalidAnswer = {
      language: 'en',
      question_type: 'mcq' as const,
      answer: 'A',
      explanation: 'This is a valid explanation that is long enough.',
      flashcards
    }

    const result = AnswerSchema.safeParse(invalidAnswer)
    expect(result.success).toBe(false)
  })

  it('should validate flashcard with all fields', () => {
    const answerWithDetailedFlashcard = {
      language: 'en',
      question_type: 'mcq' as const,
      answer: 'C',
      explanation: 'Detailed explanation of the correct answer.',
      flashcards: [
        {
          front: 'Front of the card',
          back: 'Back of the card',
          hint: 'Helpful hint',
          tags: ['tag1', 'tag2'],
          difficulty: 3
        }
      ]
    }

    const result = AnswerSchema.safeParse(answerWithDetailedFlashcard)
    expect(result.success).toBe(true)
    if (result.success) {
      const flashcard = result.data.flashcards[0]
      expect(flashcard.front).toBe('Front of the card')
      expect(flashcard.hint).toBe('Helpful hint')
      expect(flashcard.tags).toEqual(['tag1', 'tag2'])
      expect(flashcard.difficulty).toBe(3)
    }
  })

  it('should validate flashcard with minimal fields', () => {
    const answerWithMinimalFlashcard = {
      language: 'en',
      question_type: 'short' as const,
      answer: 'Answer text',
      explanation: 'Explanation that is long enough to pass validation.',
      flashcards: [
        {
          front: 'Question',
          back: 'Answer'
        }
      ]
    }

    const result = AnswerSchema.safeParse(answerWithMinimalFlashcard)
    expect(result.success).toBe(true)
    if (result.success) {
      const flashcard = result.data.flashcards[0]
      expect(flashcard.difficulty).toBe(2) // Default value
      expect(flashcard.hint).toBeUndefined()
      expect(flashcard.tags).toEqual([])
    }
  })
})

describe('AI Response Validation and Sanitization', () => {
  it('should sanitize valid AI response', () => {
    const rawResponse = {
      language: 'en',
      question_type: 'mcq',
      answer: 'B',
      explanation: 'This is a good explanation.',
      confidence: 0.9,
      flashcards: [
        {
          front: 'Test question',
          back: 'Test answer',
          difficulty: 2
        }
      ]
    }

    const sanitized = sanitizeAIResponse(rawResponse)
    expect(sanitized).toBeDefined()
    expect(sanitized.language).toBe('en')
    expect(sanitized.question_type).toBe('mcq')
  })

  it('should validate sanitized response successfully', () => {
    const validResponse = {
      language: 'en',
      question_type: 'mcq' as const,
      answer: 'A',
      explanation: 'This explanation is long enough to pass validation.',
      flashcards: []
    }

    const validation = validateAIResponse(validResponse)
    expect(validation.success).toBe(true)
    if (validation.success) {
      expect(validation.data).toBeDefined()
    }
  })

  it('should detect validation errors', () => {
    const invalidResponse = {
      language: 'en',
      question_type: 'invalid' as any,
      answer: 'A',
      explanation: 'Short', // Too short
      flashcards: []
    }

    const validation = validateAIResponse(invalidResponse)
    expect(validation.success).toBe(false)
    if (!validation.success) {
      expect(validation.errors).toBeDefined()
      expect(validation.errors.length).toBeGreaterThan(0)
    }
  })

  it('should handle missing required fields', () => {
    const incompleteResponse = {
      language: 'en',
      // Missing required fields
    }

    const validation = validateAIResponse(incompleteResponse as any)
    expect(validation.success).toBe(false)
    if (!validation.success) {
      expect(validation.errors).toBeDefined()
    }
  })

  it('should validate confidence score range', () => {
    const responseWithInvalidConfidence = {
      language: 'en',
      question_type: 'mcq' as const,
      answer: 'A',
      explanation: 'Valid explanation that meets length requirements.',
      confidence: 1.5, // Invalid: > 1
      flashcards: []
    }

    const validation = validateAIResponse(responseWithInvalidConfidence)
    expect(validation.success).toBe(false)
  })
})