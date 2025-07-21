import { Router, Request, Response } from 'express'
import { getStripeService } from '../services/stripeService.js'
import logger from '../utils/logger.js'
import Stripe from 'stripe'

const router = Router()

// Stripe Webhookの検証とイベント処理
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !endpointSecret) {
      logger.error('Stripe webhook署名またはシークレットが不足')
      return res.status(400).send('署名またはシークレットが不足しています')
    }

    let event: Stripe.Event

    try {
      // Stripeオブジェクトを取得
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-06-30.basil'
      })

      // 生のボディバッファが必要
      const rawBody = req.body
      event = stripe.webhooks.constructEvent(rawBody, sig as string, endpointSecret)
    } catch (err: any) {
      logger.error('Webhook署名検証エラー:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // イベントを処理
    await getStripeService().handleWebhookEvent(event)

    // Stripeに成功を通知
    res.json({ received: true })
  } catch (error) {
    logger.error('Webhookエラー:', error)
    res.status(500).json({ error: 'Webhook処理に失敗しました' })
  }
})

export default router