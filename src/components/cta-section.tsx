import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

interface CTASectionProps {
  title?: string
  description?: string
  primaryText?: string
  primaryHref?: string
  secondaryText?: string
  secondaryHref?: string
  variant?: 'default' | 'minimal' | 'gradient'
  className?: string
}

export default function CTASection({
  title = "Ready to transform your learning?",
  description = "Join thousands of students who use QuizMate to boost their academic performance with AI-powered study tools.",
  primaryText = "Start Learning Free",
  primaryHref = "/auth/register",
  secondaryText = "View Pricing",
  secondaryHref = "/pricing",
  variant = "default",
  className = ""
}: CTASectionProps) {
  const bgClass = variant === 'gradient' 
            ? 'bg-gradient-to-r from-blue-500/10 to-blue-500/10' 
    : variant === 'minimal' 
    ? 'bg-muted/30' 
    : 'bg-muted/50'

  return (
    <section className={`py-16 lg:py-24 ${bgClass} ${className}`}>
      <div className="container px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href={primaryHref} className="flex items-center">
                {primaryText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            {secondaryText && (
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href={secondaryHref}>
                  {secondaryText}
                </Link>
              </Button>
            )}
          </div>

          {/* Social Proof */}
          {variant === 'default' && (
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Trusted by students at 100+ universities worldwide
              </p>
              <div className="flex justify-center items-center space-x-8 mt-4 opacity-60">
                {/* University logos placeholder */}
                <div className="text-xs font-semibold text-muted-foreground">MIT</div>
                <div className="text-xs font-semibold text-muted-foreground">Stanford</div>
                <div className="text-xs font-semibold text-muted-foreground">Harvard</div>
                <div className="text-xs font-semibold text-muted-foreground">Oxford</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}