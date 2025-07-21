import stripeService from '../services/stripeService.js';
import logger from '../utils/logger.js';
// サブスクリプション情報を取得
export const getSubscription = async (req, res) => {
    try {
        const userId = req.user.userId;
        const subscription = await stripeService.getSubscription(userId);
        if (!subscription) {
            return res.json({
                subscription: null,
                message: 'No active subscription'
            });
        }
        res.json({
            subscription: {
                id: subscription.id,
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
        });
    }
    catch (error) {
        logger.error('サブスクリプション取得エラー:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
};
// 請求履歴を取得
export const getInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 10;
        const invoices = await stripeService.getInvoices(userId, limit);
        res.json({ invoices });
    }
    catch (error) {
        logger.error('請求履歴取得エラー:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};
// 支払い方法を取得
export const getPaymentMethods = async (req, res) => {
    try {
        const userId = req.user.userId;
        const paymentMethods = await stripeService.getPaymentMethods(userId);
        res.json({ paymentMethods });
    }
    catch (error) {
        logger.error('支払い方法取得エラー:', error);
        res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
};
// チェックアウトセッションを作成
export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { priceId } = req.body;
        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }
        // 有効な価格IDかチェック
        const validPriceIds = [
            'price_1RnLHg1qmMqgQ3qQx3Mfo1rt', // スタンダード
            'price_1RnLJC1qmMqgQ3qQc9t1lemY' // ファミリー
        ];
        if (!validPriceIds.includes(priceId)) {
            return res.status(400).json({ error: 'Invalid price ID' });
        }
        const successUrl = `${process.env.FRONTEND_URL}/user/billing?session_id={CHECKOUT_SESSION_ID}&success=true`;
        const cancelUrl = `${process.env.FRONTEND_URL}/user/billing?canceled=true`;
        const sessionUrl = await stripeService.createCheckoutSession(userId, priceId, successUrl, cancelUrl);
        res.json({ url: sessionUrl });
    }
    catch (error) {
        logger.error('チェックアウトセッション作成エラー:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
// カスタマーポータルセッションを作成
export const createPortalSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const returnUrl = `${process.env.FRONTEND_URL}/user/billing`;
        const portalUrl = await stripeService.createPortalSession(userId, returnUrl);
        res.json({ url: portalUrl });
    }
    catch (error) {
        logger.error('ポータルセッション作成エラー:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
};
