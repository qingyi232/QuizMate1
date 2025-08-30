import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { getCurrentUser } from '@/lib/auth/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    
    // 获取当前用户
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    
    // 查询订单状态
    const { data: order, error } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id) // 确保只能查看自己的订单
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: order.payment_method,
      planType: order.plan_type,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      transactionId: order.transaction_id
    })

  } catch (error) {
    console.error('订单状态查询失败:', error)
    return NextResponse.json(
      { error: '查询失败' },
      { status: 500 }
    )
  }
}