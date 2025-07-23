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
            // まずMongoDBから取得を試みる
            const subscription = await Subscription.findOne({ userId });
            if (subscription) {
                return subscription;
            }
            // MongoDBにない場合は、Stripeから直接取得
            const user = await User.findById(userId);
            if (!user || !user.stripeCustomerId) {
                return null;
            }
            // Stripeからサブスクリプションを取得
            const subscriptions = await this.stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active',
                limit: 1
            });
            if (subscriptions.data.length === 0) {
                return null;
            }
            const stripeSubscription = subscriptions.data[0];
            // デバッグ用：Stripeから取得した実際の期間を確認
            logger.info(`Stripeサブスクリプション期間: start=${new Date(stripeSubscription.current_period_start * 1000).toISOString()}, end=${new Date(stripeSubscription.current_period_end * 1000).toISOString()}`);
            // 仮想的なサブスクリプションオブジェクトを返す
            return {
                _id: stripeSubscription.id,
                userId,
                stripeCustomerId: user.stripeCustomerId,
                stripeSubscriptionId: stripeSubscription.id,
                stripePriceId: stripeSubscription.items.data[0].price.id,
                planId: this.getPlanIdFromPriceId(stripeSubscription.items.data[0].price.id),
                status: stripeSubscription.status,
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
                createdAt: new Date(stripeSubscription.created * 1000),
                updatedAt: new Date()
            };
        }
        catch (error) {
            logger.error('サブスクリプション取得エラー:', error);
            // Stripe APIエラーの場合はnullを返す
            if (error.type === 'StripeError') {
                return null;
            }
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
            return invoices.data.map(invoice => {
                // 価格IDからプランIDを取得
                const lineItem = invoice.lines.data[0];
                const priceId = lineItem?.price?.id || '';
                const planId = this.getPlanIdFromPriceId(priceId);
                return {
                    id: invoice.id,
                    invoiceNumber: invoice.number,
                    date: new Date(invoice.created * 1000).toISOString(),
                    amount: invoice.amount_paid, // 日本円はそのまま（100で割らない）
                    status: this.mapInvoiceStatus(invoice.status),
                    planName: invoice.lines.data[0]?.description || '',
                    planId: planId, // プランIDを追加
                    priceId: priceId, // 価格IDを追加
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
                };
            });
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
        logger.info(`Webhookサブスクリプション更新開始: subscriptionId=${subscription.id}, timestamp=${new Date().toISOString()}`);
        let userId = subscription.metadata.userId;
        // メタデータにuserIdがない場合は、カスタマーIDから検索
        if (!userId) {
            const user = await User.findOne({ stripeCustomerId: subscription.customer });
            if (!user) {
                logger.error('サブスクリプションのユーザーが見つかりません', { customerId: subscription.customer });
                return;
            }
            userId = user._id.toString();
            logger.info('カスタマーIDからユーザーを特定しました', { userId, customerId: subscription.customer });
        }
        const planId = this.getPlanIdFromPriceId(subscription.items.data[0].price.id);
        // Subscriptionコレクションを更新
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
        // Userモデルも更新
        const updateResult = await User.findByIdAndUpdate(userId, {
            subscriptionStatus: subscription.status,
            currentPlan: planId,
            hasSelectedInitialPlan: true
        }, { new: true });
        logger.info(`Webhookによるユーザー更新完了: userId=${userId}, plan=${planId}, timestamp=${new Date().toISOString()}, currentPlan=${updateResult?.currentPlan}`);
    }
    // サブスクリプション削除処理
    async handleSubscriptionDeleted(subscription) {
        const sub = await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, { status: 'canceled' }, { new: true });
        // Userモデルも更新
        if (sub?.userId) {
            await User.findByIdAndUpdate(sub.userId, {
                subscriptionStatus: 'canceled',
                currentPlan: 'none'
            });
        }
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
// シングルトンインスタンスを遅延初期化
let stripeServiceInstance = null;
export const getStripeService = () => {
    if (!stripeServiceInstance) {
        stripeServiceInstance = new StripeService();
    }
    return stripeServiceInstance;
};
export default { getStripeService };
