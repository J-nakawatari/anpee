import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
export const sseAuthenticate = async (req, res, next) => {
    try {
        // クエリパラメータからトークンを取得
        const token = req.query.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '認証トークンが必要です',
            });
        }
        const decoded = verifyAccessToken(token);
        // ユーザー情報を取得
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ユーザーが見つかりません',
            });
        }
        // リクエストにユーザー情報を添付
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role || 'user',
        };
        next();
    }
    catch (error) {
        logger.error('SSE認証エラー:', error);
        return res.status(401).json({
            success: false,
            message: '認証に失敗しました',
        });
    }
};
