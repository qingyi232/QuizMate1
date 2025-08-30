/**
 * Unit tests for parsing utilities
 */

import { describe, it, expect } from 'vitest'
import { normalize, detectLanguage } from '@/lib/parsing/normalize'
import { detectQuestionType } from '@/lib/parsing/detect'
import { extractOptions } from '@/lib/parsing/extract'
import { hashPrompt } from '@/lib/parsing/hash'

describe('Text Normalization', () => {
  it('should remove extra whitespace', () => {
    const input = '  This   is   a   test   '
    const result = normalize(input)
    expect(result).toBe('This is a test')
  })

  it('should remove HTML tags', () => {
    const input = '<p>This is a <strong>test</strong></p>'
    const result = normalize(input)
    expect(result).toBe('This is a test')
  })

  it('should handle empty strings', () => {
    const result = normalize('')
    expect(result).toBe('')
  })

  it('should handle newlines and tabs', () => {
    const input = 'Line 1\n\nLine 2\t\tLine 3'
    const result = normalize(input)
    expect(result).toBe('Line 1 Line 2 Line 3')
  })

  it('should preserve mathematical expressions', () => {
    const input = 'Solve: 2x + 3 = 7'
    const result = normalize(input)
    expect(result).toBe('Solve: 2x + 3 = 7')
  })
})

describe('Language Detection', () => {
  it('should detect English text', () => {
    const text = 'What is the capital of France?'
    const result = detectLanguage(text)
    expect(result).toBe('en')
  })

  it('should handle mixed language content', () => {
    const text = 'Hello world test content'
    const result = detectLanguage(text)
    expect(['en', 'auto']).toContain(result)
  })

  it('should handle short text gracefully', () => {
    const text = 'Hi'
    const result = detectLanguage(text)
    expect(typeof result).toBe('string')
  })
})

describe('Question Type Detection', () => {
  it('should detect multiple choice questions', () => {
    const text = `
      What is the capital of France?
      A) London
      B) Paris
      C) Berlin
      D) Madrid
    `
    const result = detectQuestionType(text)
    expect(result.type).toBe('mcq')
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it('should detect true/false questions', () => {
    const text = 'The Earth is flat. True or False?'
    const result = detectQuestionType(text)
    expect(result.type).toBe('true_false')
  })

  it('should detect short answer questions', () => {
    const text = 'Explain the process of photosynthesis.'
    const result = detectQuestionType(text)
    expect(result.type).toBe('short')
  })

  it('should handle mathematical questions', () => {
    const text = 'Solve for x: 2x + 5 = 17'
    const result = detectQuestionType(text)
    expect(['mcq', 'short']).toContain(result.type)
  })

  it('should return unknown for unclear content', () => {
    const text = 'Random text without clear question format'
    const result = detectQuestionType(text)
    expect(['unknown', 'short']).toContain(result.type)
  })
})

describe('Option Extraction', () => {
  it('should extract standard multiple choice options', () => {
    const text = `
      What is 2 + 2?
      A) 3
      B) 4
      C) 5
      D) 6
    `
    const result = extractOptions(text)
    expect(result.hasValidOptions).toBe(true)
    expect(result.options).toHaveLength(4)
    expect(result.options[0].letter).toBe('A')
    expect(result.options[0].text).toBe('3')
    expect(result.options[1].letter).toBe('B')
    expect(result.options[1].text).toBe('4')
  })

  it('should extract options with different formats', () => {
    const text = `
      Choose the correct answer:
      a. Option one
      b. Option two
      c. Option three
    `
    const result = extractOptions(text)
    expect(result.hasValidOptions).toBe(true)
    expect(result.options).toHaveLength(3)
  })

  it('should extract numbered options', () => {
    const text = `
      Select the best answer:
      1) First option
      2) Second option
      3) Third option
    `
    const result = extractOptions(text)
    expect(result.hasValidOptions).toBe(true)
    expect(result.options).toHaveLength(3)
  })

  it('should handle text without options', () => {
    const text = 'This is just a regular question without multiple choice options.'
    const result = extractOptions(text)
    expect(result.hasValidOptions).toBe(false)
    expect(result.options).toHaveLength(0)
  })

  it('should handle malformed options', () => {
    const text = `
      Incomplete question:
      A) Option one
      Something else
      C) Option three
    `
    const result = extractOptions(text)
    // Should still extract valid options
    expect(result.options.length).toBeGreaterThan(0)
  })
})

describe('Prompt Hashing', () => {
  it('should generate consistent hashes for same input', async () => {
    const prompt = 'What is the capital of France?'
    const hash1 = await hashPrompt(prompt)
    const hash2 = await hashPrompt(prompt)
    expect(hash1).toBe(hash2)
  })

  it('should generate different hashes for different inputs', async () => {
    const prompt1 = 'What is the capital of France?'
    const prompt2 = 'What is the capital of Germany?'
    const hash1 = await hashPrompt(prompt1)
    const hash2 = await hashPrompt(prompt2)
    expect(hash1).not.toBe(hash2)
  })

  it('should generate valid SHA-256 hash format', async () => {
    const prompt = 'Test prompt'
    const hash = await hashPrompt(prompt)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should handle empty strings', async () => {
    const hash = await hashPrompt('')
    expect(typeof hash).toBe('string')
    expect(hash.length).toBe(64)
  })

  it('should handle special characters', async () => {
    const prompt = 'Test with émojis 🎉 and spéciál characters!'
    const hash = await hashPrompt(prompt)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})