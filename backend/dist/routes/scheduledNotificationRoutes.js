import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import notificationServiceV2 from '../services/notificationServiceV2.js';
import Elderly from '../models/Elderly.js';
import logger from '../utils/logger.js';
const router = Router();
// ヘルスチェック用エンドポイント（認証不要）
router.get('/health', async (_req, res) => {
    try {
        res.json({
            success: true,
            message: 'Scheduled notification routes are working',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed'
        });
    }
});
// 手動で朝の通知を送信（管理者用）
router.post('/trigger/morning', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        logger.info('手動朝通知トリガー開始:', { userId });
        // デバッグ情報を追加：家族データの確認
        const elderlyList = await Elderly.find({
            userId,
            status: 'active',
            lineUserId: { $exists: true, $ne: null }
        });
        logger.info('デバッグ情報:', {
            userId,
            serviceExists: !!notificationServiceV2,
            hasMethod: typeof notificationServiceV2.sendScheduledNotification === 'function',
            elderlyCount: elderlyList.length,
            elderlyList: elderlyList.map(e => ({
                id: e._id,
                name: e.name,
                hasLineUserId: !!e.lineUserId
            }))
        });
        // 通知サービスV2の定時通知を呼び出す（テストとして）
        await notificationServiceV2.sendScheduledNotificationAsTest(userId);
        logger.info('朝の通知送信完了:', { userId });
        res.json({
            success: true,
            message: '朝の通知を送信しました'
        });
    }
    catch (error) {
        logger.error('朝の通知送信エラー:', error);
        res.status(500).json({
            success: false,
            message: '朝の通知の送信に失敗しました',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// 手動で夜の通知を送信（管理者用）
router.post('/trigger/evening', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        logger.info('手動夜通知トリガー:', { userId });
        // V2では朝夜の区別がないため、同じメソッドを使用
        await notificationServiceV2.sendScheduledNotification(userId);
        res.json({
            success: true,
            message: '夜の通知を送信しました'
        });
    }
    catch (error) {
        logger.error('夜の通知送信エラー:', error);
        res.status(500).json({
            success: false,
            message: '夜の通知の送信に失敗しました'
        });
    }
});
// スケジュール状態を取得
router.get('/status', authenticate, async (_req, res) => {
    try {
        // V2ではスケジュール管理がscheduledNotificationServiceV2に移動
        res.json({
            success: true,
            message: 'Notification service is running'
        });
    }
    catch (error) {
        logger.error('スケジュール状態取得エラー:', error);
        res.status(500).json({
            success: false,
            message: 'スケジュール状態の取得に失敗しました'
        });
    }
});
export default router;
