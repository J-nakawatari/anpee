import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail, } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// 新規登録
router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('パスワードは8文字以上で、大文字・小文字・数字を含む必要があります'),
    body('name').trim().notEmpty().withMessage('名前を入力してください'),
    body('phone')
        .optional({ nullable: true, checkFalsy: true })
        .matches(/^[0-9-]+$/)
        .withMessage('有効な電話番号を入力してください'),
], validateRequest, register);
// ログイン
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').notEmpty().withMessage('パスワードを入力してください'),
], validateRequest, login);
// トークンリフレッシュ
router.post('/refresh', refresh);
// ログアウト
router.post('/logout', logout);
// パスワードリセット要求
router.post('/forgot-password', [body('email').isEmail().normalizeEmail().withMessage('有効なメールアドレスを入力してください')], validateRequest, forgotPassword);
// パスワードリセット
router.post('/reset-password', [
    body('token').notEmpty().withMessage('トークンが必要です'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('パスワードは8文字以上で、大文字・小文字・数字を含む必要があります'),
], validateRequest, resetPassword);
// メールアドレス確認
router.get('/verify-email/:token', verifyEmail);
// 初回プラン選択済みフラグ更新
router.post('/initial-plan-selected', authenticate, async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const userId = req.user.userId;
        await User.findByIdAndUpdate(userId, {
            hasSelectedInitialPlan: true
        });
        res.json({
            success: true,
            message: '初回プラン選択が完了しました'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'フラグ更新エラー'
        });
    }
});
// 現在のユーザー情報を取得
router.get('/me', authenticate, async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus,
                currentPlan: user.currentPlan,
                hasSelectedInitialPlan: user.hasSelectedInitialPlan
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'ユーザー情報取得エラー'
        });
    }
});
export default router;
