import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateEmailVerificationToken, generatePasswordResetToken, } from '../utils/jwt.js';
import logger from '../utils/logger.js';
import emailService from '../services/emailService.js';
export const register = async (req, res) => {
    try {
        const { email, password, name, phone } = req.body;
        // ユーザーの存在確認
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'このメールアドレスは既に登録されています',
            });
        }
        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 12);
        // ユーザーの作成（一旦トークンなしで）
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone,
        });
        // メール確認トークンの生成（ユーザーIDを含む）
        const emailVerificationToken = generateEmailVerificationToken(user._id.toString());
        // トークンを保存
        user.emailVerificationToken = emailVerificationToken;
        await user.save();
        // ウェルカムメールを送信（確認リンク付き）
        try {
            await emailService.sendWelcomeEmail(user.email, user.name, emailVerificationToken);
        }
        catch (emailError) {
            logger.error('ウェルカムメール送信エラー:', emailError);
            // メール送信エラーがあっても登録は成功とする
        }
        res.status(201).json({
            success: true,
            message: '登録が完了しました。メールを確認してください。',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: '登録中にエラーが発生しました',
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // ユーザーの検索
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが正しくありません',
            });
        }
        // パスワードの確認
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが正しくありません',
            });
        }
        // メール確認の確認（開発環境ではスキップ）
        if (!user.emailVerified && process.env.NODE_ENV === 'production') {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスの確認が必要です',
            });
        }
        // トークンの生成
        const accessToken = generateAccessToken({
            _id: user._id,
            email: user.email,
            role: user.role
        });
        const refreshToken = generateRefreshToken(user._id);
        // リフレッシュトークンの保存
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt,
        });
        // HTTPOnly Cookieにリフレッシュトークンを設定
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7日
        });
        res.json({
            success: true,
            message: 'ログインに成功しました',
            data: {
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionStatus: user.subscriptionStatus,
                },
            },
        });
    }
    catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'ログイン中にエラーが発生しました',
        });
    }
};
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'リフレッシュトークンが必要です',
            });
        }
        // トークンの検証
        const decoded = verifyRefreshToken(refreshToken);
        // データベースでトークンの確認
        const storedToken = await RefreshToken.findOne({
            token: refreshToken,
            userId: decoded.userId,
        });
        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: '無効なリフレッシュトークンです',
            });
        }
        // ユーザーの取得
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ユーザーが見つかりません',
            });
        }
        // 新しいアクセストークンの生成
        const accessToken = generateAccessToken({
            _id: user._id,
            email: user.email,
            role: user.role
        });
        res.json({
            success: true,
            data: {
                accessToken,
            },
        });
    }
    catch (error) {
        logger.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'トークンの更新に失敗しました',
        });
    }
};
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            // データベースからトークンを削除
            await RefreshToken.deleteOne({ token: refreshToken });
        }
        // Cookieをクリア
        res.clearCookie('refreshToken');
        res.json({
            success: true,
            message: 'ログアウトしました',
        });
    }
    catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'ログアウト中にエラーが発生しました',
        });
    }
};
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            // セキュリティのため、ユーザーが存在しない場合も成功レスポンスを返す
            return res.json({
                success: true,
                message: 'パスワードリセットメールを送信しました',
            });
        }
        // パスワードリセットトークンの生成
        const resetToken = generatePasswordResetToken();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1);
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();
        // パスワードリセットメールを送信
        try {
            const requestIp = req.ip || req.headers['x-forwarded-for'] || '不明';
            await emailService.sendPasswordResetEmail(user.email, user.name, resetToken, requestIp);
        }
        catch (emailError) {
            logger.error('パスワードリセットメール送信エラー:', emailError);
            // メール送信エラーがあってもトークンは生成されているので、成功レスポンスを返す
        }
        res.json({
            success: true,
            message: 'パスワードリセットメールを送信しました',
        });
    }
    catch (error) {
        logger.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'パスワードリセットの処理中にエラーが発生しました',
        });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '無効または期限切れのトークンです',
            });
        }
        // 新しいパスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json({
            success: true,
            message: 'パスワードがリセットされました',
        });
    }
    catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'パスワードリセット中にエラーが発生しました',
        });
    }
};
export const verifyEmail = async (req, res) => {
    const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://anpee.jp'
        : (process.env.FRONTEND_URL || 'http://localhost:3003');
    try {
        const { token } = req.params;
        // トークンをデコード
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            return res.redirect(`${frontendUrl}/email-verified?success=false&message=${encodeURIComponent('無効または期限切れのトークンです')}`);
        }
        // トークンタイプの確認
        if (decoded.type !== 'email_verification') {
            return res.redirect(`${frontendUrl}/email-verified?success=false&message=${encodeURIComponent('無効なトークンタイプです')}`);
        }
        // ユーザーの検索とトークンの照合
        const user = await User.findOne({
            _id: decoded.userId,
            emailVerificationToken: token,
        });
        if (!user) {
            return res.redirect(`${frontendUrl}/email-verified?success=false&message=${encodeURIComponent('無効なトークンです')}`);
        }
        // すでに確認済みの場合
        if (user.emailVerified) {
            return res.redirect(`${frontendUrl}/email-verified?success=false&message=${encodeURIComponent('メールアドレスは既に確認済みです')}`);
        }
        // メールアドレスを確認済みに更新
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();
        // フロントエンドにリダイレクト
        res.redirect(`${frontendUrl}/email-verified?success=true&message=${encodeURIComponent('メールアドレスが確認されました')}`);
    }
    catch (error) {
        logger.error('Email verification error:', error);
        res.redirect(`${frontendUrl}/email-verified?success=false&message=${encodeURIComponent('メール確認中にエラーが発生しました')}`);
    }
};
