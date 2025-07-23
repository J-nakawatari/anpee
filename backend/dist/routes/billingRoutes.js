import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getBillingInfo, getSubscriptionHistory, getInvoiceHistory, cancelSubscription, resumeSubscription, addPaymentMethod, getPaymentMethods, createCheckoutSession, createPortalSession, handlePaymentSuccess, validatePlanChange, changePlan } from '../controllers/billingController.js';
const router = Router();
// すべてのルートで認証が必要
router.use(authenticate);
// 請求情報を取得
router.get('/info', getBillingInfo);
// サブスクリプション履歴を取得
router.get('/subscription-history', getSubscriptionHistory);
// 請求履歴を取得
router.get('/invoice-history', getInvoiceHistory);
// サブスクリプションをキャンセル
router.post('/cancel', cancelSubscription);
// サブスクリプションを再開
router.post('/resume', resumeSubscription);
// 支払い方法を追加
router.post('/payment-methods', addPaymentMethod);
// 支払い方法を取得
router.get('/payment-methods', getPaymentMethods);
// チェックアウトセッションを作成
router.post('/checkout', createCheckoutSession);
// カスタマーポータルセッションを作成
router.post('/portal', createPortalSession);
// 支払い成功時の処理
router.post('/payment-success', handlePaymentSuccess);
// プラン変更のバリデーション
router.post('/validate-plan-change', validatePlanChange);
// プラン変更
router.post('/change-plan', changePlan);
export default router;
