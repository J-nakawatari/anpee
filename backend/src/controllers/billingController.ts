import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { getStripeService } from '../services/stripeService.js'
import logger from '../utils/logger.js'

// サブスクリプション情報を取得
export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    try {
      const subscription = await getStripeService().getSubscription(userId)
      
      if (subscription) {
        return res.json({
          subscription: {
            id: subscription._id || subscription.stripeSubscriptionId,
            status: subscription.status,
            currentPlan: subscription.planId,
            stripePriceId: subscription.stripePriceId,
            startDate: subscription.createdAt,
            nextBillingDate: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            trialEnd: subscription.trialEnd,
            stripeCustomerId: subscription.stripeCustomerId,
            stripeSubscriptionId: subscription.stripeSubscriptionId
          }
        })
      }
    } catch (stripeError) {
      logger.warn('Stripeからのサブスクリプション取得に失敗、請求履歴から推測します:', stripeError)
    }
    
    // Stripeエラーの場合は請求履歴から推測
    try {
      const invoices = await getStripeService().getInvoices(userId, 1)
      
      if (invoices.length > 0 && invoices[0].status === 'paid') {
        const latestInvoice = invoices[0]
        
        // planIdまたはpriceIdからプランを判定
        let planId = latestInvoice.planId || 'standard'
        let stripePriceId = latestInvoice.priceId || 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt'
        
        // priceIdが設定されている場合は、それに基づいてplanIdを確定
        if (latestInvoice.priceId === 'price_1RnLJC1qmMqgQ3qQc9t1lemY') {
          planId = 'family'
        }
        
        return res.json({
          subscription: {
            id: 'inferred-from-invoice',
            status: 'active',
            currentPlan: planId,
            stripePriceId: stripePriceId,
            startDate: latestInvoice.period.start,
            nextBillingDate: latestInvoice.period.end,
            cancelAtPeriodEnd: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          }
        })
      }
    } catch (invoiceError) {
      logger.error('請求履歴取得エラー:', invoiceError)
    }
    
    return res.json({
      subscription: null,
      message: 'No active subscription'
    })
  } catch (error) {
    logger.error('サブスクリプション取得エラー:', error)
    res.status(500).json({ error: 'Failed to fetch subscription' })
  }
}

// 請求履歴を取得
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const limit = parseInt(req.query.limit as string) || 10
    
    const invoices = await getStripeService().getInvoices(userId, limit)
    
    res.json({ invoices })
  } catch (error) {
    logger.error('請求履歴取得エラー:', error)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
}

// 支払い方法を取得
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    const paymentMethods = await getStripeService().getPaymentMethods(userId)
    
    res.json({ paymentMethods })
  } catch (error) {
    logger.error('支払い方法取得エラー:', error)
    res.status(500).json({ error: 'Failed to fetch payment methods' })
  }
}

// チェックアウトセッションを作成
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { priceId } = req.body
    
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // 有効な価格IDかチェック
    const validPriceIds = [
      'price_1RnLHg1qmMqgQ3qQx3Mfo1rt', // スタンダード
      'price_1RnLJC1qmMqgQ3qQc9t1lemY'  // ファミリー
    ]
    
    if (!validPriceIds.includes(priceId)) {
      return res.status(400).json({ error: 'Invalid price ID' })
    }

    const successUrl = `${process.env.FRONTEND_URL}/user/billing?session_id={CHECKOUT_SESSION_ID}&success=true`
    const cancelUrl = `${process.env.FRONTEND_URL}/user/billing?canceled=true`
    
    const sessionUrl = await getStripeService().createCheckoutSession(
      userId,
      priceId,
      successUrl,
      cancelUrl
    )
    
    res.json({ url: sessionUrl })
  } catch (error) {
    logger.error('チェックアウトセッション作成エラー:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}

// カスタマーポータルセッションを作成
export const createPortalSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    const returnUrl = `${process.env.FRONTEND_URL}/user/billing`
    const portalUrl = await getStripeService().createPortalSession(userId, returnUrl)
    
    res.json({ url: portalUrl })
  } catch (error) {
    logger.error('ポータルセッション作成エラー:', error)
    res.status(500).json({ error: 'Failed to create portal session' })
  }
}