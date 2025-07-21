import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
export class StripeService {
    stripe;
    constructor() {
        // コンストラクタ内で初期化することで、環境変数が読み込まれた後に実行される
        if (!process.env.STRIPE_SECRET_KEY) {
            logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
            throw new Error('STRIPE_SECRET_KEY is required');
        }
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-06-30.basil'
        });
    }
    // Stripeカスタマーを作成
    async createCustomer(userId, email) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                metadata: {
                    userId
                }
            });
            // ユーザーにカスタマーIDを保存
            await User.findByIdAndUpdate(userId, {
                stripeCustomerId: customer.id
            });
            return customer.id;
        }
        catch (error) {
            logger.error('Stripeカスタマー作成エラー:', error);
            throw error;
        }
    }
    // チェックアウトセッションを作成
    async createCheckoutSession(userId, priceId, successUrl, cancelUrl) {
        try {
            const user = await User.findById(userId);
            if (!user)
                throw new Error('User not found');
            // カスタマーIDがなければ作成
            let customerId = user.stripeCustomerId;
            if (!customerId) {
                customerId = await this.createCustomer(userId, user.email);
            }
            const session = await this.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [{
                        price: priceId,
                        quantity: 1
                    }],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId
                }
            });
            return session.url;
        }
        catch (error) {
            logger.error('チェックアウトセッション作成エラー:', error);
            throw error;
        }
    }
    // カスタマーポータルセッションを作成
    async createPortalSession(userId, returnUrl) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.stripeCustomerId) {
                throw new Error('Stripe customer not found');
            }
            const session = await this.stripe.billingPortal.sessions.create({
                customer: user.stripeCustomerId,
                return_url: returnUrl
            });
            return session.url;
        }
        catch (error) {
            logger.error('ポータルセッション作成エラー:', error);
            throw error;
        }
    }
    // サブスクリプション情報を取得
    async getSubscription(userId) {
        try {
            const subscription = await Subscription.findOne({ userId });
            return subscription;
        }
        catch (error) {
            logger.error('サブスクリプション取得エラー:', error);
            throw error;
        }
    }
    // 請求履歴を取得
    async getInvoices(userId, limit = 10) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.stripeCustomerId) {
                return [];
            }
            const invoices = await this.stripe.invoices.list({
                customer: user.stripeCustomerId,
                limit
            });
            return invoices.data.map(invoice => ({
                id: invoice.id,
                invoiceNumber: invoice.number,
                date: new Date(invoice.created * 1000).toISOString(),
                amount: invoice.amount_paid / 100, // 円に変換
                status: this.mapInvoiceStatus(invoice.status),
                planName: invoice.lines.data[0]?.description || '',
                period: {
                    start: new Date(invoice.period_start * 1000).toISOString(),
                    end: new Date(invoice.period_end * 1000).toISOString()
                },
                paymentMethod: {
                    type: 'card',
                    last4: '****',
                    brand: 'unknown'
                },
                downloadUrl: invoice.invoice_pdf
            }));
        }
        catch (error) {
            logger.error('請求履歴取得エラー:', error);
            throw error;
        }
    }
    // 支払い方法を取得
    async getPaymentMethods(userId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.stripeCustomerId) {
                return [];
            }
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: user.stripeCustomerId,
                type: 'card'
            });
            // デフォルトの支払い方法を取得
            const customer = await this.stripe.customers.retrieve(user.stripeCustomerId);
            const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;
            return paymentMethods.data.map(pm => ({
                id: pm.id,
                type: 'card',
                isDefault: pm.id === defaultPaymentMethodId,
                card: pm.card ? {
                    brand: pm.card.brand,
                    last4: pm.card.last4,
                    expMonth: pm.card.exp_month,
                    expYear: pm.card.exp_year
                } : undefined
            }));
        }
        catch (error) {
            logger.error('支払い方法取得エラー:', error);
            throw error;
        }
    }
    // Webhookイベントを処理
    async handleWebhookEvent(event) {
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdate(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                default:
                    logger.info(`未処理のWebhookイベント: ${event.type}`);
            }
        }
        catch (error) {
            logger.error('Webhookイベント処理エラー:', error);
            throw error;
        }
    }
    // サブスクリプション更新処理
    async handleSubscriptionUpdate(subscription) {
        const userId = subscription.metadata.userId;
        if (!userId) {
            logger.warn('サブスクリプションにuserIdがありません');
            return;
        }
        const planId = this.getPlanIdFromPriceId(subscription.items.data[0].price.id);
        await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, {
            userId,
            stripeCustomerId: subscription.customer,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            planId,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date(),
            currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined
        }, { upsert: true });
    }
    // サブスクリプション削除処理
    async handleSubscriptionDeleted(subscription) {
        await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, { status: 'canceled' });
    }
    // 請求書支払い成功処理
    async handleInvoicePaymentSucceeded(invoice) {
        logger.info(`請求書支払い成功: ${invoice.id}`);
    }
    // ステータスマッピング
    mapInvoiceStatus(status) {
        switch (status) {
            case 'paid':
                return 'paid';
            case 'open':
            case 'draft':
                return 'pending';
            default:
                return 'failed';
        }
    }
    // 価格IDからプランIDを取得
    getPlanIdFromPriceId(priceId) {
        switch (priceId) {
            case 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt':
                return 'standard';
            case 'price_1RnLJC1qmMqgQ3qQc9t1lemY':
                return 'family';
            default:
                logger.warn(`Unknown price ID: ${priceId}`);
                return 'standard';
        }
    }
}
export default new StripeService();
