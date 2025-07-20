import * as cron from 'node-cron';
import User from '../models/User.js';
import Elderly from '../models/Elderly.js';
import Response from '../models/Response.js';
import ResponseHistory from '../models/ResponseHistory.js';
import { sendLineMessage } from './lineService.js';
import { generateResponseToken } from './tokenService.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
// 時間帯に応じた挨拶を取得
function getGreeting(hour) {
    if (hour >= 5 && hour < 10) {
        return { greeting: 'おはようございます', emoji: '☀️' };
    }
    else if (hour >= 10 && hour < 17) {
        return { greeting: 'こんにちは', emoji: '🌞' };
    }
    else if (hour >= 17 && hour < 23) {
        return { greeting: 'こんばんは', emoji: '🌙' };
    }
    else {
        return { greeting: 'こんばんは', emoji: '🌙' };
    }
}
// 再通知管理サービス
class RetryNotificationService {
    checkInterval = null;
    // サービス開始
    async start() {
        logger.info('再通知サービスを開始します');
        // 既存のタスクを停止
        this.stop();
        // 1分ごとに未応答をチェック
        this.checkInterval = cron.schedule('* * * * *', async () => {
            await this.checkAndSendRetryNotifications();
        }, {
            timezone: 'Asia/Tokyo'
        });
    }
    // 未応答チェックと再通知送信
    async checkAndSendRetryNotifications() {
        try {
            // 再通知が有効なユーザーを取得
            const users = await User.find({
                'notificationSettings.retrySettings.maxRetries': { $gt: 0 }
            }).select('_id notificationSettings');
            for (const user of users) {
                await this.checkUserResponses(user);
            }
        }
        catch (error) {
            logger.error('再通知チェックエラー:', error);
        }
    }
    // 特定ユーザーの未応答をチェック
    async checkUserResponses(user) {
        try {
            const { retrySettings } = user.notificationSettings || {};
            if (!retrySettings || retrySettings.maxRetries === 0)
                return;
            // ユーザーの家族を取得
            const elderlyList = await Elderly.find({
                userId: user._id,
                status: 'active',
                lineUserId: { $exists: true, $ne: null }
            });
            for (const elderly of elderlyList) {
                // 本日の最新の応答を確認
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const latestResponse = await Response.findOne({
                    elderlyId: elderly._id,
                    type: 'genki_button',
                    respondedAt: { $gte: today }
                }).sort({ respondedAt: -1 });
                // 最新の履歴を確認
                const latestHistory = await ResponseHistory.findOne({
                    elderlyId: elderly._id,
                    date: { $gte: today }
                }).sort({ createdAt: -1 });
                // 未応答または再通知が必要な場合
                if (this.shouldSendRetry(latestResponse, latestHistory, retrySettings)) {
                    await this.sendRetryNotification(elderly, user, latestHistory);
                }
            }
        }
        catch (error) {
            logger.error(`ユーザー ${user._id} の再通知チェックエラー:`, error);
        }
    }
    // 再通知が必要かどうか判定
    shouldSendRetry(latestResponse, latestHistory, retrySettings) {
        // 今日の応答がある場合は再通知不要
        if (latestResponse && latestResponse.status === 'success') {
            return false;
        }
        // 履歴がない場合（初回通知がまだ送信されていない）
        if (!latestHistory) {
            return false;
        }
        // 最大再通知回数に達している場合
        if (latestHistory.retryCount >= retrySettings.maxRetries) {
            return false;
        }
        // 最後の通知から指定時間が経過しているかチェック
        const lastNotificationTime = latestHistory.lastNotificationTime || latestHistory.createdAt;
        const now = new Date();
        const minutesSinceLastNotification = Math.floor((now.getTime() - new Date(lastNotificationTime).getTime()) / (1000 * 60));
        return minutesSinceLastNotification >= retrySettings.retryInterval;
    }
    // 再通知を送信
    async sendRetryNotification(elderly, user, latestHistory) {
        try {
            // 応答用トークンを生成
            const token = await generateResponseToken(elderly._id.toString());
            const responseUrl = `${process.env.FRONTEND_URL || 'https://anpee.jp'}/genki/${token}`;
            // 現在の時刻情報を取得
            const now = new Date();
            const hour = now.getHours();
            const { greeting, emoji } = getGreeting(hour);
            const dateStr = format(now, 'M月d日', { locale: ja });
            // 再通知回数に応じたメッセージ
            const retryCount = (latestHistory?.retryCount || 0) + 1;
            const urgencyMessage = retryCount > 1
                ? `\n⚠️ ${retryCount}回目の確認です。`
                : '';
            const messages = [
                {
                    type: 'text',
                    text: `${greeting}、${elderly.name}さん！${emoji}${urgencyMessage}\n\n今日（${dateStr}）の元気確認がまだです。\nお元気でお過ごしですか？\n\n下のリンクをタップして、\n「元気ですボタン」を押してください。\n\n▼ タップしてください ▼\n${responseUrl}\n\nご家族が${elderly.name}さんの元気を待っています💝`
                }
            ];
            await sendLineMessage(elderly.lineUserId || '', messages);
            // 履歴を更新または作成
            if (latestHistory) {
                latestHistory.retryCount = retryCount;
                latestHistory.lastNotificationTime = now;
                await latestHistory.save();
            }
            else {
                // 履歴がない場合は新規作成（通常は発生しないはず）
                await ResponseHistory.create({
                    elderlyId: elderly._id,
                    userId: user._id,
                    date: now,
                    retryCount: 1,
                    lastNotificationTime: now,
                    status: 'pending'
                });
            }
            logger.info(`再通知送信成功: ${elderly.name}さん (${elderly._id}), ${retryCount}回目`);
            // 最終再通知の場合、管理者に通知
            if (retryCount >= user.notificationSettings.retrySettings.maxRetries) {
                await this.notifyAdmin(user, elderly);
            }
        }
        catch (error) {
            logger.error(`再通知送信エラー: ${elderly.name}さん`, error);
        }
    }
    // 管理者（ユーザー）への通知
    async notifyAdmin(user, elderly) {
        try {
            // ユーザーのメールアドレスを取得
            const userDoc = await User.findById(user._id).select('email notificationSettings');
            if (!userDoc || !userDoc.email) {
                logger.warn(`管理者通知: ユーザーのメールアドレスが見つかりません ${user._id}`);
                return;
            }
            // メール通知が有効な場合
            if (userDoc.notificationSettings?.methods?.email?.enabled) {
                // メールサービスを使用してお知らせメールを送信
                const emailAddress = userDoc.notificationSettings.methods.email.address || userDoc.email;
                // 最後の応答時刻を取得
                const lastResponse = await Response.findOne({
                    elderlyId: elderly._id,
                    type: 'genki_button',
                    status: 'success'
                }).sort({ respondedAt: -1 });
                await emailService.sendSafetyCheckNotification(emailAddress, elderly.name, lastResponse?.respondedAt);
                logger.info(`管理者通知メール送信完了: ${emailAddress} - ${elderly.name}さんの応答なし通知`);
            }
            logger.info(`応答なし通知: ${elderly.name}さんから応答がありません（ユーザー: ${user._id}）`);
        }
        catch (error) {
            logger.error('管理者通知エラー:', error);
        }
    }
    // サービス停止
    stop() {
        if (this.checkInterval) {
            this.checkInterval.stop();
            this.checkInterval = null;
            logger.info('再通知サービスを停止しました');
        }
    }
}
export default new RetryNotificationService();
