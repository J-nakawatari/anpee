import crypto from 'crypto';
import logger from '../utils/logger.js';
// 応答用トークン生成
export async function generateResponseToken(elderlyId) {
    try {
        // ランダムなトークンを生成
        const token = crypto.randomBytes(32).toString('hex');
        // 新しいDailyNotificationモデルでは、トークンはnotifications配列内に保存される
        // トークンの生成のみ行い、実際の保存は呼び出し元で行う
        return token;
    }
    catch (error) {
        logger.error('トークン生成エラー:', error);
        throw error;
    }
}
// トークン検証（新しいDailyNotificationモデルでは使用しない）
// 検証はnotificationServiceV2.recordResponseで行う
