'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Crown, 
  Info, 
  RefreshCw,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface UsageInfo {
  plan: string
  today: {
    used: number
    remaining: number
    limit: number
    cacheHits: number
    tokensUsed: number
    costCents: number
    errors: number
    date: string
  }
  month: {
    requests: number
    tokens: number
    costCents: number
    period: string
  }
  canMakeRequest: boolean
  upgradeRequired: boolean
}

interface UsageBadgeProps {
  usage: UsageInfo | null
  onRefresh?: () => void
  className?: string
}

export default function UsageBadge({ 
  usage, 
  onRefresh,
  className = ''
}: UsageBadgeProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    
    setIsLoading(true)
    try {
      await onRefresh()
    } finally {
      setIsLoading(false)
    }
  }

  if (!usage) {
    return (
      <Badge variant="secondary" className={className}>
        <RefreshCw className="mr-1 h-3 w-3" />
        Loading usage...
      </Badge>
    )
  }

  const progressPercentage = (usage.today.used / usage.today.limit) * 100
  const isNearLimit = progressPercentage > 80
  const isPro = usage.plan === 'pro'

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main Usage Badge */}
      <Badge 
        variant={usage.canMakeRequest ? (isNearLimit ? "default" : "secondary") : "destructive"}
        className="flex items-center space-x-1"
      >
        {isPro && <Crown className="h-3 w-3" />}
        <span>
          {usage.today.remaining} / {usage.today.limit} remaining
        </span>
      </Badge>

      {/* Detailed Usage Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Info className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Usage Statistics
            </DialogTitle>
            <DialogDescription>
              Track your QuizMate usage and performance
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Today's Usage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Today's Usage
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Questions Asked</span>
                    <span className="font-medium">
                      {usage.today.used} / {usage.today.limit}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Cache Hits</div>
                    <div className="font-medium">{usage.today.cacheHits}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Errors</div>
                    <div className="font-medium">{usage.today.errors}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tokens Used</div>
                    <div className="font-medium">{usage.today.tokensUsed.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Est. Cost</div>
                    <div className="font-medium">
                      ${(usage.today.costCents / 100).toFixed(3)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  This Month ({usage.month.period})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Requests</span>
                    <span className="font-medium">{usage.month.requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tokens</span>
                    <span className="font-medium">{usage.month.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-medium">
                      ${(usage.month.costCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Info & Upgrade */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {isPro && <Crown className="mr-2 h-4 w-4 text-yellow-500" />}
                    <span className="font-medium">
                      {isPro ? 'Pro Plan' : 'Free Plan'}
                    </span>
                  </div>
                  {!isPro && (
                    <Badge variant="secondary">
                      <Zap className="mr-1 h-3 w-3" />
                      Upgrade Available
                    </Badge>
                  )}
                </div>
                
                {!isPro && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Upgrade to Pro for unlimited questions, priority processing, and advanced features.
                    </div>
                    <Link href="/settings">
                      <Button className="w-full" size="sm">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                )}
                
                {isPro && (
                  <div className="text-sm text-muted-foreground">
                    Enjoy unlimited questions and priority support!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Button for Near Limit */}
      {!isPro && isNearLimit && (
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <Crown className="mr-1 h-3 w-3" />
            Upgrade
          </Button>
        </Link>
      )}
    </div>
  )
}