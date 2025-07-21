import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getSubscription, getInvoices, getPaymentMethods, createCheckoutSession, createPortalSession, handlePaymentSuccess } from '../controllers/billingController.js';
const router = Router();
// すべてのルートで認証が必要
router.use(authenticate);
// サブスクリプション情報を取得
router.get('/subscription', getSubscription);
// 請求履歴を取得
router.get('/invoices', getInvoices);
// 支払い方法を取得
router.get('/payment-methods', getPaymentMethods);
// チェックアウトセッションを作成
router.post('/checkout', createCheckoutSession);
// カスタマーポータルセッションを作成
router.post('/portal', createPortalSession);
// 支払い成功時の処理
router.post('/payment-success', handlePaymentSuccess);
export default router;
