import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import logger from '../utils/logger.js'
import { getStripeService } from '../services/stripeService.js'

// 請求情報を取得
export const getBillingInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    // Stripeサービスから請求情報を取得
    const billingInfo = await getStripeService().getBillingInfo(userId)
    
    res.json(billingInfo)
  } catch (error) {
    logger.error('請求情報取得エラー:', error)
    res.status(500).json({ error: 'Failed to fetch billing info' })
  }
}

// サブスクリプション履歴を取得
export const getSubscriptionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    const history = await getStripeService().getSubscriptionHistory(userId)
    
    res.json({ history })
  } catch (error) {
    logger.error('サブスクリプション履歴取得エラー:', error)
    res.status(500).json({ error: 'Failed to fetch subscription history' })
  }
}

// 請求書履歴を取得
export const getInvoiceHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { limit = 10 } = req.query
    
    const invoices = await getStripeService().getInvoiceHistory(userId, Number(limit))
    
    res.json({ invoices })
  } catch (error) {
    logger.error('請求書履歴取得エラー:', error)
    res.status(500).json({ error: 'Failed to fetch invoice history' })
  }
}

// サブスクリプションをキャンセル
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    await getStripeService().cancelSubscription(userId)
    
    res.json({ success: true, message: 'Subscription canceled successfully' })
  } catch (error) {
    logger.error('サブスクリプションキャンセルエラー:', error)
    res.status(500).json({ error: 'Failed to cancel subscription' })
  }
}

// サブスクリプションを再開
export const resumeSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    await getStripeService().resumeSubscription(userId)
    
    res.json({ success: true, message: 'Subscription resumed successfully' })
  } catch (error) {
    logger.error('サブスクリプション再開エラー:', error)
    res.status(500).json({ error: 'Failed to resume subscription' })
  }
}

// 支払い方法を追加
export const addPaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { paymentMethodId } = req.body
    
    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' })
    }
    
    await getStripeService().addPaymentMethod(userId, paymentMethodId)
    
    res.json({ success: true, message: 'Payment method added successfully' })
  } catch (error) {
    logger.error('支払い方法追加エラー:', error)
    res.status(500).json({ error: 'Failed to add payment method' })
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

// 支払い成功時の処理
export const handlePaymentSuccess = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { sessionId } = req.body
    
    logger.info(`handlePaymentSuccess開始: userId=${userId}, sessionId=${sessionId}, timestamp=${new Date().toISOString()}`)
    
    if (!sessionId) {
      logger.warn('Session IDが提供されていません')
      return res.status(400).json({ error: 'Session ID is required' })
    }
    
    // Stripeからセッション情報を取得
    const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil'
    })
    
    logger.info('Stripeセッション取得中...')
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    logger.info(`Stripeセッション取得完了: payment_status=${session.payment_status}, mode=${session.mode}`)
    
    if (session.payment_status === 'paid' && session.mode === 'subscription') {
      // サブスクリプションIDを取得
      const subscriptionId = session.subscription as string
      logger.info(`サブスクリプションID: ${subscriptionId}`)
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      // プランIDを取得
      const priceId = subscription.items.data[0].price.id
      const planId = priceId === 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt' ? 'standard' : 
                     priceId === 'price_1RnLJC1qmMqgQ3qQc9t1lemY' ? 'family' : 'standard'
      
      logger.info(`プラン判定: priceId=${priceId}, planId=${planId}`)
      
      // ユーザー情報を更新
      const User = (await import('../models/User.js')).default
      const updateResult = await User.findByIdAndUpdate(userId, {
        currentPlan: planId,
        subscriptionStatus: 'active',
        hasSelectedInitialPlan: true
      }, { new: true })
      
      logger.info(`ユーザー更新完了: userId=${userId}, plan=${planId}, timestamp=${new Date().toISOString()}, updateResult=${JSON.stringify({
        currentPlan: updateResult?.currentPlan,
        subscriptionStatus: updateResult?.subscriptionStatus,
        hasSelectedInitialPlan: updateResult?.hasSelectedInitialPlan
      })}`)
      
      res.json({
        success: true,
        data: {
          message: 'プランが正常に設定されました',
          plan: planId,
          user: {
            currentPlan: updateResult?.currentPlan,
            subscriptionStatus: updateResult?.subscriptionStatus,
            hasSelectedInitialPlan: updateResult?.hasSelectedInitialPlan
          }
        }
      })
    } else {
      logger.warn(`支払いが完了していません: payment_status=${session.payment_status}, mode=${session.mode}`)
      res.status(400).json({ error: 'Payment not completed' })
    }
  } catch (error: any) {
    logger.error('支払い成功処理エラー:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    })
    res.status(500).json({ error: 'Failed to process payment success' })
  }
}

// プラン変更のバリデーション
export const validatePlanChange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { targetPlan } = req.body
    
    if (!targetPlan || !['standard', 'family'].includes(targetPlan)) {
      return res.status(400).json({ error: '有効なプランを指定してください' })
    }
    
    // 現在のプランを取得
    const User = (await import('../models/User.js')).default
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' })
    }
    
    // スタンダードプランへのダウングレードの場合
    if (targetPlan === 'standard' && user.currentPlan === 'family') {
      // 登録されている家族の数を確認
      const Elderly = (await import('../models/Elderly.js')).default
      const activeElderly = await Elderly.countDocuments({
        userId: userId,
        status: 'active'
      })
      
      if (activeElderly > 1) {
        return res.json({
          valid: false,
          message: `現在${activeElderly}人の家族が登録されています。スタンダードプランでは1人までしか登録できません。家族管理画面で${activeElderly - 1}人を削除してからプランを変更してください。`,
          currentFamilyCount: activeElderly,
          maxAllowed: 1
        })
      }
    }
    
    // バリデーション成功
    res.json({
      valid: true,
      message: 'プラン変更可能です'
    })
    
  } catch (error) {
    logger.error('プラン変更バリデーションエラー:', error)
    res.status(500).json({ error: 'プラン変更の検証に失敗しました' })
  }
}

// プラン変更処理
export const changePlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { targetPlan } = req.body
    
    if (!targetPlan || !['standard', 'family'].includes(targetPlan)) {
      return res.status(400).json({ error: '有効なプランを指定してください' })
    }
    
    // バリデーションを再度実行
    const User = (await import('../models/User.js')).default
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' })
    }
    
    // スタンダードプランへのダウングレードの場合
    if (targetPlan === 'standard' && user.currentPlan === 'family') {
      const Elderly = (await import('../models/Elderly.js')).default
      const activeElderly = await Elderly.countDocuments({
        userId: userId,
        status: 'active'
      })
      
      if (activeElderly > 1) {
        return res.status(400).json({
          error: '家族の人数を1人に調整してからプランを変更してください',
          currentFamilyCount: activeElderly
        })
      }
    }
    
    // Stripeのサブスクリプションを更新
    const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil'
    })
    
    // 現在のサブスクリプションを取得
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId!,
      status: 'active',
      limit: 1
    })
    
    if (subscriptions.data.length === 0) {
      return res.status(400).json({ error: 'アクティブなサブスクリプションが見つかりません' })
    }
    
    const subscription = subscriptions.data[0]
    const newPriceId = targetPlan === 'standard' 
      ? 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt' 
      : 'price_1RnLJC1qmMqgQ3qQc9t1lemY'
    
    // サブスクリプションアイテムを更新
    await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations'
    })
    
    // DBを更新
    user.currentPlan = targetPlan
    await user.save()
    
    logger.info(`プラン変更完了: userId=${userId}, newPlan=${targetPlan}`)
    
    res.json({
      success: true,
      message: 'プランを変更しました',
      newPlan: targetPlan
    })
    
  } catch (error) {
    logger.error('プラン変更エラー:', error)
    res.status(500).json({ error: 'プラン変更に失敗しました' })
  }
}