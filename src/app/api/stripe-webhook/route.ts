/**
 * /api/stripe-webhook - Handle Stripe webhook events (Node Runtime)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import Stripe from 'stripe'

// Use Node runtime for webhook verification
export const runtime = 'nodejs'

// Initialize Stripe (with fallback for demo mode)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_demo_key', {
  apiVersion: '2025-07-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret'

/**
 * POST /api/stripe-webhook - Handle Stripe webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      console.error('Missing stripe signature or webhook secret')
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    console.log(`Handling Stripe event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.user_id
    if (!userId) {
      console.error('No user_id in checkout session metadata')
      return
    }

    const supabase = await createClient()

    // Update user plan to pro
    await supabase
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('id', userId)

    // If there's a subscription, it will be handled by subscription.created event
    console.log(`Checkout completed for user ${userId}`)

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.user_id
    const customerId = subscription.customer as string

    if (!userId) {
      console.error('No user_id in subscription metadata')
      return
    }

    const supabase = await createClient()

    // Update or create subscription record
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_sub_id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      }, {
        onConflict: 'user_id'
      })

    // Update user plan based on subscription status
    const plan = ['active', 'trialing'].includes(subscription.status) ? 'pro' : 'free'
    
    await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId)

    console.log(`Subscription ${subscription.status} for user ${userId}`)

  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id in subscription metadata')
      return
    }

    const supabase = await createClient()

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('user_id', userId)

    // Downgrade user plan to free
    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', userId)

    console.log(`Subscription canceled for user ${userId}`)

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    
    if (!subscriptionId) {
      console.log('Payment succeeded but no subscription found')
      return
    }

    // Get subscription to find user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id in subscription metadata for payment')
      return
    }

    const supabase = await createClient()

    // Ensure user is on pro plan
    await supabase
      .from('profiles')
      .update({ plan: 'pro' })
      .eq('id', userId)

    // Update subscription period
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('user_id', userId)

    console.log(`Payment succeeded for user ${userId}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    
    if (!subscriptionId) {
      console.log('Payment failed but no subscription found')
      return
    }

    // Get subscription to find user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id in subscription metadata for failed payment')
      return
    }

    const supabase = await createClient()

    // Update subscription status to past_due
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('user_id', userId)

    // Note: Don't immediately downgrade to free - give them time to fix payment
    // Stripe will handle retry logic and eventual cancellation

    console.log(`Payment failed for user ${userId}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    },
  })
}