import User from '../models/User.js';
import Elderly from '../models/Elderly.js';
import { sendLineMessage } from '../services/lineService.js';
import emailService from '../services/emailService.js';
import { makePhoneCall } from '../services/twilioService.js';
import logger from '../utils/logger.js';
// LINE通知テスト送信
export const testLineNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        // ユーザーの家族情報を取得
        const elderlyList = await Elderly.find({
            userId,
            status: 'active',
            lineUserId: { $exists: true, $ne: null }
        });
        if (elderlyList.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'LINE連携済みの家族が見つかりません'
            });
        }
        const testMessage = {
            type: 'text',
            text: `【テスト通知】\nこれはテスト通知です。\n\n通知設定が正常に機能しています。\n実際の安否確認メッセージもこのように届きます。`
        };
        // 各家族にテストメッセージを送信
        const results = await Promise.allSettled(elderlyList.map(elderly => sendLineMessage(elderly.lineUserId, [testMessage])));
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;
        if (failCount > 0) {
            logger.error('LINE test notification failed for some users', {
                userId,
                successCount,
                failCount
            });
        }
        res.json({
            success: true,
            message: `${successCount}名の家族にテスト通知を送信しました`,
            details: {
                sent: successCount,
                failed: failCount,
                total: elderlyList.length
            }
        });
    }
    catch (error) {
        logger.error('LINE test notification error:', error);
        res.status(500).json({
            success: false,
            message: 'テスト通知の送信に失敗しました'
        });
    }
};
// メール通知テスト送信
export const testEmailNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user || !user.notificationSettings?.methods?.email?.enabled || !user.notificationSettings.methods.email.address) {
            return res.status(400).json({
                success: false,
                message: 'メール通知が設定されていません'
            });
        }
        const emailAddress = user.notificationSettings.methods.email.address;
        await emailService.sendDirectEmail({
            to: emailAddress,
            subject: '【あんぴーちゃん】テスト通知',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">テスト通知</h2>
          <p>これはテスト通知です。</p>
          <p>通知設定が正常に機能しています。</p>
          <p>実際の安否確認通知もこのメールアドレスに届きます。</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            このメールは「あんぴーちゃん」から送信されています。<br>
            心当たりがない場合は、このメールを削除してください。
          </p>
        </div>
      `
        });
        res.json({
            success: true,
            message: 'テストメールを送信しました'
        });
    }
    catch (error) {
        logger.error('Email test notification error:', error);
        res.status(500).json({
            success: false,
            message: 'テストメールの送信に失敗しました'
        });
    }
};
// 電話通知テスト送信
export const testPhoneNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        // ユーザーの家族情報を取得（電話番号が登録されているもののみ）
        const elderlyList = await Elderly.find({
            userId,
            status: 'active',
            phone: { $exists: true, $ne: null }
        });
        if (elderlyList.length === 0) {
            return res.status(400).json({
                success: false,
                message: '電話番号が登録されている家族が見つかりません'
            });
        }
        // テスト用のTwiMLメッセージ
        const testMessage = 'こちらは、あんぴーちゃんからのテスト電話です。通知設定が正常に機能しています。';
        // 各家族に電話をかける
        const results = await Promise.allSettled(elderlyList.map(elderly => makePhoneCall(elderly.phone, testMessage)));
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;
        if (failCount > 0) {
            logger.error('Phone test notification failed for some users', {
                userId,
                successCount,
                failCount
            });
        }
        res.json({
            success: true,
            message: `${successCount}名の家族にテスト電話を発信しました`,
            details: {
                sent: successCount,
                failed: failCount,
                total: elderlyList.length
            }
        });
    }
    catch (error) {
        logger.error('Phone test notification error:', error);
        res.status(500).json({
            success: false,
            message: 'テスト電話の発信に失敗しました'
        });
    }
};
// 通知設定取得
export const getNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('notificationSettings');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        res.json({
            success: true,
            settings: user.notificationSettings || {
                methods: {
                    line: { enabled: true },
                    email: { enabled: false, address: '' },
                    phone: { enabled: false }
                },
                timing: {
                    morning: { enabled: true, time: '08:00' },
                    evening: { enabled: false, time: '20:00' }
                },
                retrySettings: {
                    maxRetries: 3,
                    retryInterval: 30
                }
            }
        });
    }
    catch (error) {
        logger.error('Get notification settings error:', error);
        res.status(500).json({
            success: false,
            message: '通知設定の取得に失敗しました'
        });
    }
};
// 通知設定更新
export const updateNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { settings } = req.body;
        const user = await User.findByIdAndUpdate(userId, { notificationSettings: settings }, { new: true, runValidators: true }).select('notificationSettings');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        res.json({
            success: true,
            message: '通知設定を更新しました',
            settings: user.notificationSettings
        });
    }
    catch (error) {
        logger.error('Update notification settings error:', error);
        res.status(500).json({
            success: false,
            message: '通知設定の更新に失敗しました'
        });
    }
};
