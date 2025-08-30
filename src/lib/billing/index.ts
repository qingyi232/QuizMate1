/**
 * Billing utilities for Stripe integration
 */

import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

// Plan configuration
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'usd',
    interval: null,
    features: [
      '5 questions per day',
      'Basic AI explanations',
      'Standard flashcards',
      'Community support'
    ],
    limits: {
      questionsPerDay: 5,
      questionsPerMonth: 150,
      flashcardsPerQuestion: 5,
      aiModel: 'gpt-4o-mini'
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 299, // $2.99 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited daily questions',
      'Priority AI processing',
      'Advanced flashcards',
      'Detailed analytics',
      'Priority support',
      'Early access to new features'
    ],
    limits: {
      questionsPerDay: 1000,
      questionsPerMonth: 30000,
      flashcardsPerQuestion: 10,
      aiModel: 'gpt-4o-mini'
    }
  }
} as const

export type PlanType = keyof typeof PLANS

// Billing status types
export interface BillingStatus {
  plan: PlanType
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd?: boolean
  trialEnd?: Date | null
}

// Usage types
export interface UsageLimits {
  questionsToday: number
  questionsThisMonth: number
  questionsLimit: number
  isWithinLimits: boolean
  canMakeRequest: boolean
  upgradeRequired: boolean
}

/**
 * Get plan configuration by plan type
 */
export function getPlanConfig(plan: PlanType) {
  return PLANS[plan]
}

/**
 * Check if user can make request based on usage and plan
 */
export function checkUsageLimits(
  plan: PlanType,
  questionsToday: number,
  questionsThisMonth: number
): UsageLimits {
  const planConfig = getPlanConfig(plan)
  const dailyLimit = planConfig.limits.questionsPerDay
  const monthlyLimit = planConfig.limits.questionsPerMonth
  
  const isWithinDailyLimit = questionsToday < dailyLimit
  const isWithinMonthlyLimit = questionsThisMonth < monthlyLimit
  const isWithinLimits = isWithinDailyLimit && isWithinMonthlyLimit
  
  return {
    questionsToday,
    questionsThisMonth,
    questionsLimit: dailyLimit,
    isWithinLimits,
    canMakeRequest: isWithinLimits,
    upgradeRequired: plan === 'FREE' && !isWithinLimits
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amountInCents: number, currency = 'USD'): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

/**
 * Calculate cost estimate for AI usage
 */
export function estimateAICost(tokens: number, model = 'gpt-4o-mini'): number {
  // Cost per 1M tokens for different models (in cents)
  const modelCosts = {
    'gpt-4o-mini': 15, // $0.15 per 1M tokens
    'gpt-4o': 250,     // $2.50 per 1M tokens
    'deepseek-chat': 7, // $0.07 per 1M tokens  
    'qwen': 10         // $0.10 per 1M tokens (estimated)
  }
  
  const costPer1MTokens = modelCosts[model as keyof typeof modelCosts] || modelCosts['gpt-4o-mini']
  return Math.round((tokens / 1000000) * costPer1MTokens)
}

/**
 * Get subscription status from Stripe
 */
export async function getSubscriptionStatus(customerId: string): Promise<BillingStatus | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1
    })
    
    if (subscriptions.data.length === 0) {
      return {
        plan: 'FREE',
        status: 'inactive',
        currentPeriodEnd: null
      }
    }
    
    const subscription = subscriptions.data[0]
    
    return {
      plan: subscription.status === 'active' ? 'PRO' : 'FREE',
      status: subscription.status as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
    }
  } catch (error) {
    console.error('Failed to get subscription status:', error)
    return null
  }
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_update: {
      address: 'auto',
      name: 'auto'
    }
  })
}

/**
 * Create Stripe customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Create Stripe customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata
  })
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd = true
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: atPeriodEnd
  })
}

/**
 * Resume subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  })
}

/**
 * Get usage-based pricing for Pro plan
 */
export function getUsageBasedPricing(questionsThisMonth: number): {
  basePrice: number
  overagePrice: number
  totalPrice: number
  freeQuestions: number
  billableQuestions: number
} {
  const basePrice = PLANS.PRO.price // $2.99
  const freeQuestionsInPro = 1000 // First 1000 questions free in Pro
  const overagePricePerQuestion = 1 // $0.01 per question over limit
  
  const billableQuestions = Math.max(0, questionsThisMonth - freeQuestionsInPro)
  const overagePrice = billableQuestions * overagePricePerQuestion
  
  return {
    basePrice,
    overagePrice,
    totalPrice: basePrice + overagePrice,
    freeQuestions: Math.min(questionsThisMonth, freeQuestionsInPro),
    billableQuestions
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Get invoice preview for subscription changes
 */
export async function getInvoicePreview(
  customerId: string,
  subscriptionId?: string,
  priceId?: string
): Promise<Stripe.Invoice> {
  const params: Stripe.InvoiceCreateParams = {
    customer: customerId,
    subscription: subscriptionId
  }
  
  if (priceId) {
    params.subscription_items = [
      {
        price: priceId,
        quantity: 1
      }
    ]
  }
  
  return await stripe.invoices.create(params)
}

/**
 * Format billing period
 */
export function formatBillingPeriod(
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  return `${formatter.format(currentPeriodStart)} - ${formatter.format(currentPeriodEnd)}`
}

/**
 * Calculate proration amount
 */
export function calculateProration(
  oldPlanPrice: number,
  newPlanPrice: number,
  daysRemaining: number,
  totalDaysInPeriod: number
): number {
  const dailyOldPrice = oldPlanPrice / totalDaysInPeriod
  const dailyNewPrice = newPlanPrice / totalDaysInPeriod
  const dailyDifference = dailyNewPrice - dailyOldPrice
  
  return Math.round(dailyDifference * daysRemaining)
}

/**
 * Get trial period configuration
 */
export function getTrialConfig() {
  return {
    enabled: true,
    durationDays: 7,
    description: '7-day free trial, cancel anytime'
  }
}

export default {
  PLANS,
  getPlanConfig,
  checkUsageLimits,
  formatCurrency,
  estimateAICost,
  getSubscriptionStatus,
  createCheckoutSession,
  createPortalSession,
  createCustomer,
  cancelSubscription,
  resumeSubscription,
  getUsageBasedPricing,
  validateWebhookSignature,
  getInvoicePreview,
  formatBillingPeriod,
  calculateProration,
  getTrialConfig
}