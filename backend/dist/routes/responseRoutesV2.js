import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import notificationServiceV2 from '../services/notificationServiceV2.js';
import DailyNotification from '../models/DailyNotification.js';
import mongoose from 'mongoose';
const router = Router();
// 元気ですボタンの応答を記録（公開エンドポイント）
router.post('/genki/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const result = await notificationServiceV2.recordResponse(token);
        if (!result.success) {
            const statusCode = result.error === 'Token expired' ? 410 : 404;
            const message = result.error === 'Token expired'
                ? 'リンクの有効期限が切れています。'
                : '無効なリンクです。';
            return res.status(statusCode).json({
                error: result.error,
                message
            });
        }
        res.json({
            success: true,
            message: '元気ですボタンが押されました！'
        });
    }
    catch (error) {
        console.error('Genki button error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'エラーが発生しました。'
        });
    }
});
// 応答履歴を取得（認証必要）
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { elderlyId, startDate, endDate, page = 1, limit = 50 } = req.query;
        const options = {
            page: Number(page),
            limit: Number(limit)
        };
        if (elderlyId && mongoose.Types.ObjectId.isValid(elderlyId)) {
            options.elderlyId = elderlyId;
        }
        if (startDate) {
            options.startDate = new Date(startDate);
        }
        if (endDate) {
            options.endDate = new Date(endDate);
        }
        const result = await notificationServiceV2.getHistory(userId, options);
        res.json(result);
    }
    catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});
// 統計情報を取得（認証必要）
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { elderlyId, period = '7d' } = req.query;
        // 期間計算
        const now = new Date();
        let startDate = new Date();
        switch (period) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }
        // クエリ構築
        const query = { userId, date: { $gte: startDate } };
        if (elderlyId && mongoose.Types.ObjectId.isValid(elderlyId)) {
            query.elderlyId = elderlyId;
        }
        // 統計データ集計
        const records = await DailyNotification.find(query);
        const stats = {
            genki_button: {
                total: 0,
                success: 0,
                pending: 0,
                expired: 0
            }
        };
        // レコードから統計を計算
        records.forEach(record => {
            record.notifications.forEach(notification => {
                stats.genki_button.total++;
                if (record.response?.respondedToken === notification.token) {
                    stats.genki_button.success++;
                }
                else if (notification.tokenExpiresAt < now) {
                    stats.genki_button.expired++;
                }
                else {
                    stats.genki_button.pending++;
                }
            });
        });
        res.json({
            period,
            startDate,
            endDate: now,
            stats
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
// 応答メモを更新（認証必要）
router.patch('/:recordId/notes', authenticate, async (req, res) => {
    try {
        const { recordId } = req.params;
        const { notes } = req.body;
        const userId = req.user.userId;
        // レコードを取得して権限チェック
        const record = await DailyNotification.findOne({
            _id: recordId,
            userId
        });
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        // メモを更新
        record.notes = notes;
        await record.save();
        res.json({ success: true });
    }
    catch (error) {
        console.error('Update notes error:', error);
        res.status(500).json({ error: 'Failed to update notes' });
    }
});
export default router;
