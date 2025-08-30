'use client'

import { useEffect, useRef } from 'react'
import { loadScript } from '@paypal/paypal-js'
import { Button } from '@/components/ui/button'

interface PayPalSubscriptionButtonProps {
  planId: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onCancel?: () => void
  className?: string
  disabled?: boolean
}

export default function PayPalSubscriptionButton({
  planId,
  onSuccess,
  onError,
  onCancel,
  className,
  disabled = false
}: PayPalSubscriptionButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<any>(null)

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        if (!planId || disabled) return

        // 加载PayPal脚本
        const paypal = await loadScript({
          'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          vault: true,
          intent: 'subscription',
          currency: 'USD'
        })

        if (paypal && paypalRef.current) {
          // 如果已经有按钮，先销毁
          if (buttonsRef.current) {
            buttonsRef.current.close?.()
          }

          // 创建PayPal按钮
          buttonsRef.current = paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'blue',
              layout: 'vertical',
              label: 'subscribe',
              height: 40
            },
            createSubscription: (data: any, actions: any) => {
              return actions.subscription.create({
                'plan_id': planId
              })
            },
            onApprove: async (data: any, actions: any) => {
              try {
                console.log('订阅成功:', data)
                
                // 调用成功回调
                if (onSuccess) {
                  onSuccess(data)
                } else {
                  alert(`订阅成功！订阅ID: ${data.subscriptionID}`)
                }

                // 可以在这里调用后端API来保存订阅信息
                await fetch('/api/paypal/save-subscription', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    subscriptionId: data.subscriptionID,
                    planId: planId
                  })
                })

              } catch (error) {
                console.error('处理订阅成功时出错:', error)
                if (onError) {
                  onError(error)
                }
              }
            },
            onCancel: (data: any) => {
              console.log('用户取消订阅:', data)
              if (onCancel) {
                onCancel()
              }
            },
            onError: (err: any) => {
              console.error('PayPal订阅错误:', err)
              if (onError) {
                onError(err)
              } else {
                alert('订阅过程中出现错误，请稍后重试')
              }
            }
          })

          // 渲染按钮到DOM
          if (buttonsRef.current.isEligible()) {
            buttonsRef.current.render(paypalRef.current)
          }
        }
      } catch (error) {
        console.error('加载PayPal脚本失败:', error)
        if (onError) {
          onError(error)
        }
      }
    }

    loadPayPalScript()

    // 清理函数
    return () => {
      if (buttonsRef.current) {
        buttonsRef.current.close?.()
      }
    }
  }, [planId, disabled])

  if (disabled) {
    return (
      <Button disabled className={className}>
        请先登录
      </Button>
    )
  }

  if (!planId) {
    return (
      <Button disabled className={className}>
        计划ID未提供
      </Button>
    )
  }

  return (
    <div className={`paypal-subscription-button ${className}`}>
      <div ref={paypalRef} />
    </div>
  )
}