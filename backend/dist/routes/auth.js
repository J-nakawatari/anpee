import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, forgotPassword, resetPassword, } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
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
export default router;
