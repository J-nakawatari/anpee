// プラン情報
export interface Plan {
  id: string
  displayName: string
  price: number
  stripePriceId: string
  features: {
    maxElderlyUsers: number
    safetyCheckFrequency: string
    notificationMethods: string[]
    supportFeatures: string[]
    targetAudience: string
    maxRetryCount: number
  }
}

// 請求書情報
export interface Invoice {
  id: string
  invoiceNumber?: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  planName: string
  period: {
    start: string
    end: string
  }
  paymentMethod?: {
    type: string
    last4?: string
    brand?: string
  }
  downloadUrl?: string
}

// 支払い方法
export interface PaymentMethod {
  id: string
  type: 'card'
  isDefault: boolean
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
}