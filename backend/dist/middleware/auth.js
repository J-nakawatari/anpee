import { verifyAccessToken } from '../utils/jwt';
import User from '../models/User';
import logger from '../utils/logger';
export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '認証トークンが必要です',
            });
        }
        const decoded = verifyAccessToken(token);
        // ユーザーの存在確認
        const user = await User.findById(decoded.userId).select('email role subscriptionStatus');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ユーザーが見つかりません',
            });
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        logger.error('Authentication error:', error);
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'トークンの有効期限が切れています',
            });
        }
        return res.status(401).json({
            success: false,
            message: '無効なトークンです',
        });
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '認証が必要です',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'このリソースへのアクセス権限がありません',
            });
        }
        next();
    };
};
export const checkSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '認証が必要です',
            });
        }
        const user = await User.findById(req.user.userId).select('subscriptionStatus');
        if (!user || user.subscriptionStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: '有効なサブスクリプションが必要です',
            });
        }
        next();
    }
    catch (error) {
        logger.error('Subscription check error:', error);
        return res.status(500).json({
            success: false,
            message: 'サブスクリプションの確認中にエラーが発生しました',
        });
    }
};
