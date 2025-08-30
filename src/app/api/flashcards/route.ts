/**
 * /api/flashcards - Manage flashcards
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'

export const runtime = 'edge'

/**
 * GET /api/flashcards - Get user's flashcards
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const dueOnly = searchParams.get('due_only') === 'true'
    const questionId = searchParams.get('question_id')

    const supabase = await createClient()
    
    let query = supabase
      .from('flashcards')
      .select(`
        *,
        questions!inner(
          id,
          content,
          subject,
          grade,
          language
        )
      `)
      .eq('questions.user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by question ID if provided
    if (questionId) {
      query = query.eq('question_id', questionId)
    }

    // Filter by due cards only
    if (dueOnly) {
      query = query.lte('spaced_due_at', new Date().toISOString())
    }

    const { data: flashcards, error } = await query

    if (error) {
      console.error('Flashcards fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch flashcards' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      flashcards: flashcards || [],
      pagination: {
        limit,
        offset,
        hasMore: (flashcards?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/flashcards - Create or update flashcards
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { questionId, flashcards } = body

    if (!questionId || !flashcards || !Array.isArray(flashcards)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the question belongs to the user
    const { data: question } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .eq('user_id', user.id)
      .single()

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare flashcards data
    const flashcardsData = flashcards.map((card: any) => ({
      question_id: questionId,
      front: card.front,
      back: card.back,
      hint: card.hint || null,
      tags: card.tags || [],
      difficulty: card.difficulty || 2,
      spaced_due_at: card.spaced_due_at || new Date().toISOString()
    }))

    // Insert flashcards
    const { data: insertedCards, error } = await supabase
      .from('flashcards')
      .insert(flashcardsData)
      .select()

    if (error) {
      console.error('Flashcards insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save flashcards' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Flashcards saved successfully',
      flashcards: insertedCards
    })

  } catch (error) {
    console.error('Flashcards POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/flashcards - Update flashcard study progress
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { flashcardId, quality, nextDueAt } = body

    if (!flashcardId || quality === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the flashcard belongs to the user
    const { data: flashcard } = await supabase
      .from('flashcards')
      .select(`
        id,
        questions!inner(user_id)
      `)
      .eq('id', flashcardId)
      .eq('questions.user_id', user.id)
      .single()

    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard not found or access denied' },
        { status: 404 }
      )
    }

    // Calculate next due date based on spaced repetition
    const now = new Date()
    let spacedDueAt = nextDueAt

    if (!spacedDueAt) {
      // Simple spaced repetition algorithm
      const intervals = [1, 3, 7, 14, 30, 60] // days
      const qualityIndex = Math.max(0, Math.min(quality, intervals.length - 1))
      const daysToAdd = intervals[qualityIndex]
      
      spacedDueAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString()
    }

    // Update flashcard
    const { error } = await supabase
      .from('flashcards')
      .update({
        spaced_due_at: spacedDueAt,
        // You could add more fields here like study count, difficulty adjustment, etc.
      })
      .eq('id', flashcardId)

    if (error) {
      console.error('Flashcard update error:', error)
      return NextResponse.json(
        { error: 'Failed to update flashcard' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Flashcard updated successfully',
      nextDueAt: spacedDueAt
    })

  } catch (error) {
    console.error('Flashcards PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/flashcards - Delete flashcards
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const flashcardId = searchParams.get('id')
    const questionId = searchParams.get('question_id')

    if (!flashcardId && !questionId) {
      return NextResponse.json(
        { error: 'Either flashcard ID or question ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase.from('flashcards').delete()

    if (flashcardId) {
      // Delete specific flashcard
      query = query.eq('id', flashcardId)
    } else if (questionId) {
      // Delete all flashcards for a question
      query = query.eq('question_id', questionId)
    }

    // Add user verification through join
    query = query.in('question_id', 
      supabase
        .from('questions')
        .select('id')
        .eq('user_id', user.id)
    )

    const { error } = await query

    if (error) {
      console.error('Flashcard delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete flashcards' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Flashcards deleted successfully'
    })

  } catch (error) {
    console.error('Flashcards DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}