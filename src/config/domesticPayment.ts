// 国内支付配置
export const DOMESTIC_PAYMENT_CONFIG = {
  // 支付宝配置
  alipay: {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.NODE_ENV === 'production' 
      ? 'https://openapi.alipay.com/gateway.do' 
      : 'https://openapi.alipaydev.com/gateway.do',
    signType: 'RSA2',
    charset: 'utf-8',
    version: '1.0',
    format: 'json',
    notifyUrl: '/api/payment/alipay/notify',
    returnUrl: '/payment/success'
  },

  // 微信支付配置
  wechatPay: {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    certPath: process.env.WECHAT_CERT_PATH || '',
    keyPath: process.env.WECHAT_KEY_PATH || '',
    notifyUrl: '/api/payment/wechat/notify',
    tradeType: 'NATIVE' // 扫码支付
  },

  // 价格配置（人民币）
  pricing: {
    pro: {
      monthly: 2999, // 29.99元，单位：分
      yearly: 29999,  // 299.99元，单位：分
      title: 'Pro 高级版',
      description: '无限次AI解析，完整题库访问'
    }
  },

  // SMS短信配置（阿里云短信服务）
  sms: {
    accessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || '',
    signName: process.env.ALIYUN_SMS_SIGN_NAME || 'QuizMate',
    templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_123456789',
    endpoint: 'https://dysmsapi.aliyuncs.com'
  }
}

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  PHONE = 'phone'
}

// 订单状态
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid', 
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 计划类型
export enum PlanType {
  FREE = 'free',
  PRO_MONTHLY = 'pro_monthly',
  PRO_YEARLY = 'pro_yearly'
}