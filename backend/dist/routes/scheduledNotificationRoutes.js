import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import scheduledNotificationService from '../services/scheduledNotificationService.js';
import logger from '../utils/logger.js';
const router = Router();
// 手動で朝の通知を送信（管理者用）
router.post('/trigger/morning', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        logger.info('手動朝通知トリガー:', { userId });
        // scheduledNotificationServiceのプライベートメソッドを呼び出すために一時的な対応
        await scheduledNotificationService.sendMorningNotification(userId);
        res.json({
            success: true,
            message: '朝の通知を送信しました'
        });
    }
    catch (error) {
        logger.error('朝の通知送信エラー:', error);
        res.status(500).json({
            success: false,
            message: '朝の通知の送信に失敗しました'
        });
    }
});
// 手動で夜の通知を送信（管理者用）
router.post('/trigger/evening', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        logger.info('手動夜通知トリガー:', { userId });
        await scheduledNotificationService.sendEveningNotification(userId);
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
        const tasks = scheduledNotificationService.tasks;
        const status = {
            totalTasks: tasks.size,
            tasks: Array.from(tasks.keys())
        };
        res.json({
            success: true,
            ...status
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
