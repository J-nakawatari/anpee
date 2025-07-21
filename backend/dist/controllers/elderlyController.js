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
        const { name, age, phone, address, emergencyContact, emergencyPhone, notes, } = req.body;
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
        const planLimits = {
            standard: 1,
            family: 3,
            none: 0
        };
        const limit = planLimits[user.currentPlan || 'none'];
        if (currentCount >= limit) {
            return res.status(400).json({
                success: false,
                message: `現在のプラン（${user.currentPlan || 'なし'}）では、最大${limit}人までしか登録できません。`,
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
