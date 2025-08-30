import { NextRequest, NextResponse } from 'next/server'
import { checkUserPermission, getUserPermissions } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json()

    if (!email || !action) {
      return NextResponse.json(
        { error: '缺少必要参数：email和action' },
        { status: 400 }
      )
    }

    const result = await checkUserPermission(email, action)

    return NextResponse.json({
      success: true,
      permission: result
    })

  } catch (error) {
    console.error('检查权限失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: '缺少email参数' },
        { status: 400 }
      )
    }

    const permissions = await getUserPermissions(email)

    if (!permissions) {
      return NextResponse.json(
        { error: '用户不存在或权限获取失败' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      permissions
    })

  } catch (error) {
    console.error('获取用户权限失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}