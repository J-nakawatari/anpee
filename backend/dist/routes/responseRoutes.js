import { Router } from 'express';
import Response from '../models/Response.js';
import Elderly from '../models/Elderly.js';
import { authenticate } from '../middleware/auth.js';
import mongoose from 'mongoose';
const router = Router();
// 元気ですボタンの応答を記録（公開エンドポイント）
router.post('/genki/:token', async (req, res) => {
    try {
        const { token } = req.params;
        // トークンで応答レコードを検索
        const response = await Response.findOne({
            token,
            type: 'genki_button',
            status: 'pending'
        });
        if (!response) {
            return res.status(404).json({
                error: 'Invalid or expired token',
                message: '無効なリンクです。'
            });
        }
        // トークンの有効期限をチェック
        if (response.tokenExpiresAt && new Date() > response.tokenExpiresAt) {
            return res.status(410).json({
                error: 'Token expired',
                message: 'リンクの有効期限が切れています。'
            });
        }
        // 応答を記録
        response.status = 'success';
        response.respondedAt = new Date();
        await response.save();
        // 家族の最終応答日時を更新
        await Elderly.findByIdAndUpdate(response.elderlyId, {
            lastResponseAt: new Date()
        });
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
        const { elderlyId, type, status, startDate, endDate, page = 1, limit = 50 } = req.query;
        // クエリ構築
        const query = {};
        // ユーザーが管理する家族のみ取得
        const elderlyIds = await Elderly.find({ userId }).distinct('_id');
        query.elderlyId = { $in: elderlyIds };
        // フィルター条件
        if (elderlyId && mongoose.Types.ObjectId.isValid(elderlyId)) {
            query.elderlyId = elderlyId;
        }
        if (type) {
            query.type = type;
        }
        if (status) {
            query.status = status;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        // ページネーション
        const skip = (Number(page) - 1) * Number(limit);
        // データ取得
        const [responses, total] = await Promise.all([
            Response.find(query)
                .populate('elderlyId', 'name phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Response.countDocuments(query)
        ]);
        res.json({
            responses,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
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
        // ユーザーが管理する家族のみ
        const elderlyQuery = { userId };
        if (elderlyId && mongoose.Types.ObjectId.isValid(elderlyId)) {
            elderlyQuery._id = elderlyId;
        }
        const elderlyIds = await Elderly.find(elderlyQuery).distinct('_id');
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
        // 統計データ集計
        const stats = await Response.aggregate([
            {
                $match: {
                    elderlyId: { $in: elderlyIds },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        type: '$type',
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        // 統計を整形
        const formattedStats = {
            genki_button: {
                total: 0,
                success: 0,
                pending: 0,
                failed: 0
            },
            phone_call: {
                total: 0,
                success: 0,
                no_answer: 0,
                failed: 0
            },
            auto_call: {
                total: 0,
                success: 0,
                no_answer: 0,
                failed: 0
            }
        };
        stats.forEach((stat) => {
            const { type, status } = stat._id;
            if (type in formattedStats) {
                const typeKey = type;
                formattedStats[typeKey][status] = stat.count;
                formattedStats[typeKey].total += stat.count;
            }
        });
        res.json({
            period,
            startDate,
            endDate: now,
            stats: formattedStats
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
// 応答メモを更新（認証必要）
router.patch('/:id/notes', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const userId = req.user.userId;
        // 応答レコードを取得
        const response = await Response.findById(id).populate('elderlyId');
        if (!response) {
            return res.status(404).json({ error: 'Response not found' });
        }
        // 権限チェック
        const elderly = await Elderly.findOne({
            _id: response.elderlyId,
            userId
        });
        if (!elderly) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // メモを更新
        response.notes = notes;
        await response.save();
        res.json({ success: true, response });
    }
    catch (error) {
        console.error('Update notes error:', error);
        res.status(500).json({ error: 'Failed to update notes' });
    }
});
export default router;
