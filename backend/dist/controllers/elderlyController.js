import Elderly from '../models/Elderly.js';
import logger from '../utils/logger.js';
// 家族一覧の取得
export const getElderlyList = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const elderlyList = await Elderly.find({ userId })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: elderlyList,
        });
    }
    catch (error) {
        logger.error('家族一覧取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '家族一覧の取得に失敗しました',
        });
    }
};
// 家族の詳細取得
export const getElderlyById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const elderly = await Elderly.findOne({ _id: id, userId });
        if (!elderly) {
            return res.status(404).json({
                success: false,
                message: '家族情報が見つかりません',
            });
        }
        res.json({
            success: true,
            data: elderly,
        });
    }
    catch (error) {
        logger.error('家族詳細取得エラー:', error);
        res.status(500).json({
            success: false,
            message: '家族情報の取得に失敗しました',
        });
    }
};
// 家族の新規登録
export const createElderly = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, age, gender, phone, address, emergencyContact, emergencyPhone, notes, } = req.body;
        // ユーザー情報とプランを確認
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        // 現在の家族数を確認
        const currentCount = await Elderly.countDocuments({ userId, status: 'active' });
        // プランによる制限をチェック
        const currentPlan = user.currentPlan;
        // プランが設定されていない場合はエラー
        if (!currentPlan || currentPlan === 'none') {
            return res.status(400).json({
                success: false,
                message: 'プランが選択されていません。まずプランを選択してください。'
            });
        }
        const planLimits = {
            standard: 1,
            family: 3
        };
        const limit = planLimits[currentPlan] || 0;
        if (currentCount >= limit) {
            return res.status(400).json({
                success: false,
                message: `現在のプラン（${currentPlan}）では、最大${limit}人までしか登録できません。`,
                currentCount,
                limit
            });
        }
        // 必須項目のバリデーション
        const missingFields = [];
        if (!name)
            missingFields.push('name');
        if (!age && age !== 0)
            missingFields.push('age');
        if (!phone)
            missingFields.push('phone');
        if (!address)
            missingFields.push('address');
        if (!emergencyContact)
            missingFields.push('emergencyContact');
        if (!emergencyPhone)
            missingFields.push('emergencyPhone');
        if (missingFields.length > 0) {
            logger.error('必須項目が不足:', { userId, missingFields, body: req.body });
            return res.status(400).json({
                success: false,
                message: '必須項目が不足しています',
                missingFields,
            });
        }
        const elderly = new Elderly({
            userId,
            name,
            age,
            gender: gender || 'other',
            phone,
            address,
            emergencyContact,
            emergencyPhone,
            notes: notes || '',
            callTime: '07:00', // デフォルト値
            hasGenKiButton: false,
            callEnabled: true,
            retryCount: 2,
            retryInterval: 30,
            status: 'active',
        });
        // 登録コードは保存時に自動生成される
        await elderly.save();
        res.status(201).json({
            success: true,
            message: '家族を登録しました',
            data: elderly,
        });
    }
    catch (error) {
        logger.error('家族登録エラー:', error);
        res.status(500).json({
            success: false,
            message: '家族の登録に失敗しました',
        });
    }
};
// 家族情報の更新
export const updateElderly = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const updateData = req.body;
        // 更新不可フィールドを除外
        delete updateData._id;
        delete updateData.userId;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        // 既存データを先に取得
        const existingElderly = await Elderly.findOne({ _id: id, userId });
        if (!existingElderly) {
            return res.status(404).json({
                success: false,
                message: '家族情報が見つかりません',
            });
        }
        // 登録コードがない場合はsaveメソッドを使用して自動生成
        if (!existingElderly.registrationCode) {
            await existingElderly.save(); // pre saveフックが登録コードを生成
        }
        const elderly = await Elderly.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true });
        res.json({
            success: true,
            message: '家族情報を更新しました',
            data: elderly,
        });
    }
    catch (error) {
        logger.error('家族情報更新エラー:', error);
        res.status(500).json({
            success: false,
            message: '家族情報の更新に失敗しました',
        });
    }
};
// 家族の削除
export const deleteElderly = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const elderly = await Elderly.findOneAndDelete({ _id: id, userId });
        if (!elderly) {
            return res.status(404).json({
                success: false,
                message: '家族情報が見つかりません',
            });
        }
        res.json({
            success: true,
            message: '家族を削除しました',
        });
    }
    catch (error) {
        logger.error('家族削除エラー:', error);
        res.status(500).json({
            success: false,
            message: '家族の削除に失敗しました',
        });
    }
};
// LINE連携解除
export const unlinkLine = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        // 家族情報を確認
        const elderly = await Elderly.findOne({ _id: id, userId });
        if (!elderly) {
            return res.status(404).json({
                success: false,
                message: '家族情報が見つかりません',
            });
        }
        // LineUser情報を取得して非アクティブ化
        const { LineUser } = await import('../models/LineUser.js');
        const lineUser = await LineUser.findOne({ elderlyId: elderly._id });
        if (lineUser) {
            lineUser.isActive = false;
            lineUser.lastActiveAt = new Date();
            await lineUser.save();
        }
        // 家族情報を更新し、新しい登録コードを生成
        elderly.hasGenKiButton = false;
        elderly.lineUserId = undefined;
        // 新しい登録コードを明示的に生成
        let isUnique = false;
        let newCode = '';
        while (!isUnique) {
            newCode = elderly.generateRegistrationCode();
            const existing = await Elderly.findOne({
                registrationCode: newCode,
                _id: { $ne: elderly._id }
            });
            if (!existing) {
                isUnique = true;
            }
        }
        elderly.registrationCode = newCode;
        await elderly.save();
        res.json({
            success: true,
            message: 'LINE連携を解除しました。新しい登録コードが発行されました。',
            data: elderly,
        });
    }
    catch (error) {
        logger.error('LINE連携解除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'LINE連携の解除に失敗しました',
        });
    }
};
// 週間応答状況を取得
export const getWeeklyResponses = async (req, res) => {
    try {
        const userId = req.user.userId;
        // 今週の開始日（月曜日）を取得
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
        monday.setHours(0, 0, 0, 0);
        // 今週の終了日（日曜日）を取得
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        // DailyNotificationから今週の応答を取得
        const DailyNotification = (await import('../models/DailyNotification.js')).default;
        const notifications = await DailyNotification.find({
            userId,
            date: { $gte: monday, $lte: sunday },
            'response.respondedAt': { $exists: true } // 応答があるものだけ
        }).populate('elderlyId');
        // 曜日ごとの応答数を集計
        const weeklyData = ['月', '火', '水', '木', '金', '土', '日'].map((day, index) => {
            const dayStart = new Date(monday);
            dayStart.setDate(dayStart.getDate() + index);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            dayEnd.setHours(0, 0, 0, 0);
            // その日の応答をカウント
            const dayResponses = notifications.filter((n) => {
                const notificationDate = new Date(n.date);
                return notificationDate >= dayStart && notificationDate < dayEnd;
            });
            return {
                day,
                line: dayResponses.length, // LINEでの応答数
                phone: 0 // 電話応答は現在使用していない
            };
        });
        res.json({ weeklyData });
    }
    catch (error) {
        logger.error('週間応答状況取得エラー:', error);
        res.status(500).json({ error: 'Failed to fetch weekly responses' });
    }
};
// 最新の応答記録を取得
export const getRecentResponses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 5 } = req.query;
        // DailyNotificationから最新の応答を取得
        const DailyNotification = (await import('../models/DailyNotification.js')).default;
        const notifications = await DailyNotification.find({
            userId,
            'response.respondedAt': { $exists: true } // 応答があるものだけ
        })
            .sort({ 'response.respondedAt': -1 })
            .limit(Number(limit))
            .populate('elderlyId', 'name nickname');
        // レスポンスデータを整形
        const recentResponses = notifications.map((n) => ({
            id: n._id,
            elderlyName: n.elderlyId?.nickname || n.elderlyId?.name || '不明',
            method: 'LINE',
            timestamp: n.response.respondedAt,
            responseTime: null, // 応答時間は計算が必要な場合は後で実装
            message: '元気ですボタンが押されました'
        }));
        res.json({ recentResponses });
    }
    catch (error) {
        logger.error('最新応答記録取得エラー:', error);
        res.status(500).json({ error: 'Failed to fetch recent responses' });
    }
};
// 連続安全日数を取得
export const getSafeDays = async (req, res) => {
    try {
        const userId = req.user.userId;
        // アクティブな家族を取得
        const elderlyList = await Elderly.find({ userId, status: 'active' });
        if (elderlyList.length === 0) {
            return res.json({ safeDays: 0, message: '登録されている家族がいません' });
        }
        // DailyNotificationから履歴を取得
        const DailyNotification = (await import('../models/DailyNotification.js')).default;
        // 今日から遡って、全員が応答した日が続いている日数を計算
        let safeDays = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 最大365日まで確認
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            // その日の全家族の通知を取得
            const dayNotifications = await DailyNotification.find({
                userId,
                elderlyId: { $in: elderlyList.map(e => e._id) },
                date: {
                    $gte: checkDate,
                    $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
                }
            });
            // 全員が応答しているかチェック
            let allResponded = true;
            for (const elderly of elderlyList) {
                const elderlyNotification = dayNotifications.find(n => n.elderlyId.toString() === elderly._id.toString());
                // その日の通知がないか、応答がない場合は連続記録が途切れる
                if (!elderlyNotification || !elderlyNotification.response) {
                    allResponded = false;
                    break;
                }
            }
            if (allResponded) {
                safeDays++;
            }
            else {
                // 連続記録が途切れたら終了
                break;
            }
        }
        res.json({ safeDays });
    }
    catch (error) {
        logger.error('連続安全日数取得エラー:', error);
        res.status(500).json({ error: 'Failed to fetch safe days' });
    }
};
