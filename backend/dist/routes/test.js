import { Router } from 'express';
import emailService from '../services/emailService.js';
import notificationServiceV2 from '../services/notificationServiceV2.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';
const router = Router();
/**
 * テストメール送信
 * 開発・検証用のエンドポイント
 */
router.post('/send-test-email', authenticate, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '送信先メールアドレスが必要です'
            });
        }
        // メールアドレスの簡易バリデーション
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '有効なメールアドレスを入力してください'
            });
        }
        await emailService.sendTestEmail(email);
        res.json({
            success: true,
            message: `テストメールを ${email} に送信しました`
        });
    }
    catch (error) {
        logger.error('テストメール送信エラー:', error);
        res.status(500).json({
            success: false,
            message: 'メール送信に失敗しました'
        });
    }
});
/**
 * ヘルスチェック
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Service is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
/**
 * サブスクリプションデータを確認
 * 開発・検証用のエンドポイント
 */
router.get('/check-subscription/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // ユーザー情報を取得
        const User = (await import('../models/User.js')).default;
        // すべてのユーザーを一旦リスト
        const allUsers = await User.find({}).select('email').limit(10);
        console.log('ユーザーリスト:', allUsers.map(u => u.email));
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: 'ユーザーが見つかりません',
                searchedEmail: email,
                availableUsers: allUsers.map(u => u.email)
            });
        }
        // Subscriptionコレクションを確認
        const Subscription = (await import('../models/Subscription.js')).default;
        const subscription = await Subscription.findOne({ userId: user._id });
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                stripeCustomerId: user.stripeCustomerId
            },
            subscription: subscription ? {
                id: subscription._id,
                planId: subscription.planId,
                status: subscription.status,
                stripeSubscriptionId: subscription.stripeSubscriptionId,
                stripePriceId: subscription.stripePriceId,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                createdAt: subscription.createdAt,
                updatedAt: subscription.updatedAt
            } : null
        });
    }
    catch (error) {
        logger.error('サブスクリプション確認エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サブスクリプション確認に失敗しました'
        });
    }
});
/**
 * 再通知チェックを手動実行
 * 開発・検証用のエンドポイント
 */
router.post('/check-retry-notifications', async (req, res) => {
    try {
        logger.info('手動で再通知チェックを開始');
        await notificationServiceV2.checkAndSendRetryNotifications();
        res.json({
            success: true,
            message: '再通知チェックを実行しました'
        });
    }
    catch (error) {
        logger.error('再通知チェックエラー:', error);
        res.status(500).json({
            success: false,
            message: '再通知チェックに失敗しました'
        });
    }
});
/**
 * ユーザーのプラン情報をリセット
 * 開発・検証用のエンドポイント
 */
router.post('/reset-user-plan/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const User = (await import('../models/User.js')).default;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        // プラン情報をリセット
        user.hasSelectedInitialPlan = false;
        user.currentPlan = 'none';
        await user.save();
        res.json({
            success: true,
            message: 'ユーザーのプラン情報をリセットしました',
            user: {
                id: user._id,
                email: user.email,
                hasSelectedInitialPlan: user.hasSelectedInitialPlan,
                currentPlan: user.currentPlan
            }
        });
    }
    catch (error) {
        logger.error('ユーザープランリセットエラー:', error);
        res.status(500).json({
            success: false,
            message: 'プラン情報のリセットに失敗しました'
        });
    }
});
/**
 * Stripeサブスクリプションを手動同期
 * 開発・検証用のエンドポイント
 */
router.post('/sync-stripe-subscription/:userId', async (req, res) => {
    try {
        const { getStripeService } = await import('../services/stripeService.js');
        const stripeService = getStripeService();
        const userId = req.params.userId;
        // Stripeインスタンスを取得
        const stripe = new (await import('stripe')).default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-06-30.basil'
        });
        // ユーザーのStripeカスタマーIDを取得
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId);
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({
                success: false,
                message: 'Stripeカスタマーが見つかりません'
            });
        }
        // Stripeからサブスクリプションを取得
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active'
        });
        if (subscriptions.data.length === 0) {
            return res.json({
                success: false,
                message: 'アクティブなサブスクリプションが見つかりません'
            });
        }
        // 最初のアクティブなサブスクリプションを同期
        const subscription = subscriptions.data[0];
        await stripeService.handleSubscriptionUpdate(subscription);
        res.json({
            success: true,
            message: 'サブスクリプションを同期しました',
            subscription: {
                id: subscription.id,
                status: subscription.status,
                priceId: subscription.items.data[0].price.id
            }
        });
    }
    catch (error) {
        logger.error('サブスクリプション同期エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サブスクリプション同期に失敗しました'
        });
    }
});
export default router;
