import express from 'express';
import { getUserProfile, updateUserProfile, requestEmailChange, verifyEmailChange, changePassword, getLoginHistory, deleteAccount } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// すべてのルートに認証を適用
router.use(authenticate);
// ユーザープロフィール
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
// メールアドレス変更
router.post('/change-email', requestEmailChange);
router.post('/verify-email', verifyEmailChange);
// パスワード変更
router.post('/change-password', changePassword);
// ログイン履歴
router.get('/login-history', getLoginHistory);
// アカウント削除
router.delete('/account', deleteAccount);
export default router;
