'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Settings as SettingsIcon, 
  User, 
  CreditCard, 
  BarChart3, 
  Crown, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Calendar,
  DollarSign,
  Zap,
  Shield,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Types
interface UserProfile {
  id: string
  email: string
  display_name: string
  plan: 'free' | 'pro'
  locale: string
  created_at: string
}

interface Subscription {
  status: string
  current_period_end: string | null
  stripe_customer_id: string | null
}

interface UsageStats {
  today: {
    used: number
    limit: number
    cacheHits: number
    tokensUsed: number
    costCents: number
  }
  month: {
    requests: number
    tokens: number
    costCents: number
    period: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [selectedLocale, setSelectedLocale] = useState('en')

  // Load settings data on mount
  useEffect(() => {
    loadSettingsData()
  }, [])

  // Load all settings data
  const loadSettingsData = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await Promise.all([
        loadUserProfile(),
        loadSubscription(),
        loadUsageStats()
      ])
    } catch (err) {
      console.error('Settings load error:', err)
      setError('Failed to load settings data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load user profile
  const loadUserProfile = async () => {
    try {
      // For now, return mock data - in real implementation, call API
      const mockProfile: UserProfile = {
        id: '123',
        email: 'user@example.com',
        display_name: 'John Doe',
        plan: 'free',
        locale: 'en',
        created_at: new Date('2025-01-15').toISOString()
      }
      setProfile(mockProfile)
      setDisplayName(mockProfile.display_name)
      setSelectedLocale(mockProfile.locale)
    } catch (err) {
      console.error('Load profile error:', err)
    }
  }

  // Load subscription info
  const loadSubscription = async () => {
    try {
      // For now, return mock data - in real implementation, call API
      const mockSubscription: Subscription = {
        status: 'inactive',
        current_period_end: null,
        stripe_customer_id: null
      }
      setSubscription(mockSubscription)
    } catch (err) {
      console.error('Load subscription error:', err)
    }
  }

  // Load usage statistics
  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
      }
    } catch (err) {
      console.error('Load usage stats error:', err)
    }
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // For now, just simulate save - in real implementation, call API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (profile) {
        setProfile({
          ...profile,
          display_name: displayName,
          locale: selectedLocale
        })
      }
      
      setSuccess('Profile updated successfully!')
    } catch (err) {
      console.error('Save profile error:', err)
      setError('Failed to save profile changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle upgrade to Pro
  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setError('')
    
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      })
      
      const data = await response.json()
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      console.error('Upgrade error:', err)
      setError('Failed to start upgrade process')
    } finally {
      setIsUpgrading(false)
    }
  }

  // Handle manage billing
  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe', {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (data.url) {
        // Open Stripe customer portal
        window.open(data.url, '_blank')
      } else {
        setError(data.error || 'Failed to access billing portal')
      }
    } catch (err) {
      console.error('Billing portal error:', err)
      setError('Failed to open billing portal')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format currency
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center h-64">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <SettingsIcon className="inline-block mr-3 h-10 w-10 text-blue-600" />
              Settings
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account, billing, and preferences
            </p>
          </div>
          
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}
        
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Usage
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Name
                    </label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Globe className="inline mr-1 h-4 w-4" />
                      Language / Locale
                    </label>
                    <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="fil">Filipino</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Member Since
                    </label>
                    <Input
                      value={profile ? formatDate(profile.created_at) : ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="min-w-[120px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Subscription & Billing
                  </span>
                  <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'}>
                    {profile?.plan === 'pro' ? (
                      <>
                        <Crown className="mr-1 h-3 w-3" />
                        Pro Plan
                      </>
                    ) : (
                      'Free Plan'
                    )}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile?.plan === 'free' ? (
                  /* Free Plan - Upgrade Section */
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          <Crown className="inline mr-2 h-5 w-5 text-yellow-500" />
                          Upgrade to Pro
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Get unlimited questions, priority AI processing, and advanced features.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Unlimited daily questions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Priority processing</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Advanced analytics</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Priority support</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl font-bold">$2.99</div>
                          <div className="text-muted-foreground">/ month</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        size="lg"
                        className="min-w-[160px]"
                      >
                        {isUpgrading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Pro Plan - Management Section */
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        <Crown className="inline mr-2 h-5 w-5 text-yellow-500" />
                        Pro Plan Active
                      </h3>
                      <Badge variant="default">
                        {subscription?.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-medium capitalize">{subscription?.status}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Next Billing Date</div>
                        <div className="font-medium">
                          {subscription?.current_period_end 
                            ? formatDate(subscription.current_period_end)
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={handleManageBilling}
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Billing
                    </Button>
                  </div>
                )}

                {/* Current Plan Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <div className="font-semibold">Daily Questions</div>
                        <div className="text-2xl font-bold">
                          {profile?.plan === 'pro' ? '∞' : '5'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile?.plan === 'pro' ? 'Unlimited' : 'Per day'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="font-semibold">AI Model</div>
                        <div className="text-xl font-bold">GPT-4o-mini</div>
                        <div className="text-sm text-muted-foreground">
                          {profile?.plan === 'pro' ? 'Priority access' : 'Standard access'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Usage Statistics
                  </span>
                  <Button variant="outline" size="sm" onClick={loadUsageStats}>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Monitor your API usage and costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {usageStats ? (
                  <>
                    {/* Today's Usage */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Today's Usage
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {usageStats.today.used}
                            </div>
                            <div className="text-sm text-muted-foreground">Questions</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {usageStats.today.cacheHits}
                            </div>
                            <div className="text-sm text-muted-foreground">Cache Hits</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {usageStats.today.tokensUsed.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Tokens</div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {formatCurrency(usageStats.today.costCents)}
                            </div>
                            <div className="text-sm text-muted-foreground">Cost</div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Monthly Usage */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Monthly Usage ({usageStats.month.period})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Total Requests</div>
                                <div className="text-2xl font-bold">{usageStats.month.requests}</div>
                              </div>
                              <BarChart3 className="h-8 w-8 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Total Tokens</div>
                                <div className="text-2xl font-bold">{usageStats.month.tokens.toLocaleString()}</div>
                              </div>
                              <Zap className="h-8 w-8 text-purple-500" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Total Cost</div>
                                <div className="text-2xl font-bold">{formatCurrency(usageStats.month.costCents)}</div>
                              </div>
                              <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No usage data available
                    </h3>
                    <p className="text-gray-600">
                      Start using QuizMate to see your usage statistics here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}