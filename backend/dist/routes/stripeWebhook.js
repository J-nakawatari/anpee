import { Router } from 'express';
import { getStripeService } from '../services/stripeService.js';
import logger from '../utils/logger.js';
import Stripe from 'stripe';
const router = Router();
// Webhook処理の共通関数
const webhookHandler = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!sig || !endpointSecret) {
            logger.error('Stripe webhook署名またはシークレットが不足');
            return res.status(400).send('署名またはシークレットが不足しています');
        }
        let event;
        try {
            // Stripeオブジェクトを取得
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-06-20'
            });
            // 生のボディバッファが必要
            const rawBody = req.body;
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        }
        catch (err) {
            logger.error('Webhook署名検証エラー:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // イベントを処理
        await getStripeService().handleWebhookEvent(event);
        // Stripeに成功を通知
        res.json({ received: true });
    }
    catch (error) {
        logger.error('Webhookエラー:', error);
        res.status(500).json({ error: 'Webhook処理に失敗しました' });
    }
};
// L4L6互換のルート構成
router.post('/webhook', webhookHandler);
router.post('/stripe', webhookHandler);
export default router;
