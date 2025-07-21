import { apiClient as api } from './apiClient'
import { Plan, Invoice, PaymentMethod } from '@/types/billing'

export interface SubscriptionData {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'none'
  currentPlan: 'standard' | 'family'
  stripePriceId: string
  startDate: string
  nextBillingDate?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
  stripeCustomerId: string
  stripeSubscriptionId: string
}

export interface CheckoutResponse {
  url: string
}

export interface PortalResponse {
  url: string
}

class BillingService {
  // サブスクリプション情報を取得
  async getSubscription(): Promise<SubscriptionData | null> {
    try {
      const response = await api.get('/billing/subscription')
      return response.data.subscription
    } catch (error) {
      console.error('サブスクリプション取得エラー:', error)
      throw error
    }
  }

  // 請求履歴を取得
  async getInvoices(limit: number = 10): Promise<Invoice[]> {
    try {
      const response = await api.get('/billing/invoices', {
        params: { limit }
      })
      return response.data.invoices
    } catch (error) {
      console.error('請求履歴取得エラー:', error)
      throw error
    }
  }

  // 支払い方法を取得
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/billing/payment-methods')
      return response.data.paymentMethods
    } catch (error) {
      console.error('支払い方法取得エラー:', error)
      throw error
    }
  }

  // チェックアウトセッションを作成（新規契約/プラン変更）
  async createCheckoutSession(priceId: string): Promise<string> {
    try {
      const response = await api.post('/billing/checkout', { priceId })
      return response.data.url
    } catch (error) {
      console.error('チェックアウトセッション作成エラー:', error)
      throw error
    }
  }

  // カスタマーポータルセッションを作成（プラン管理/支払い方法変更）
  async createPortalSession(): Promise<string> {
    try {
      const response = await api.post('/billing/portal')
      return response.data.url
    } catch (error) {
      console.error('ポータルセッション作成エラー:', error)
      throw error
    }
  }

  // プランIDから表示用プラン情報を取得
  getPlanDisplayInfo(planId: string): Plan | undefined {
    const plans: Plan[] = [
      {
        id: 'standard',
        displayName: '🐥 スタンダードプラン',
        price: 1480,
        stripePriceId: 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt',
        features: {
          maxElderlyUsers: 1,
          safetyCheckFrequency: '1日1回',
          notificationMethods: ['LINE', '電話'],
          supportFeatures: ['安否確認', '通話応答記録', '再通知'],
          targetAudience: '一人暮らしの家族',
          maxRetryCount: 3
        }
      },
      {
        id: 'family',
        displayName: '🦉 ファミリープラン',
        price: 2480,
        stripePriceId: 'price_1RnLJC1qmMqgQ3qQc9t1lemY',
        features: {
          maxElderlyUsers: 3,
          safetyCheckFrequency: '1日1回×3人分',
          notificationMethods: ['LINE', '電話'],
          supportFeatures: ['家族3人まで登録可能'],
          targetAudience: '兄弟・親子など複数見守り',
          maxRetryCount: 3
        }
      }
    ]
    return plans.find(plan => plan.id === planId)
  }
}

export default new BillingService()