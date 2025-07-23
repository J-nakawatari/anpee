import DailyNotification from '../models/DailyNotification.js';
import Elderly from '../models/Elderly.js';
import User from '../models/User.js';
import { sendLineMessage } from './lineService.js';
import { generateResponseToken } from './tokenService.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import notificationService from './notificationService.js';
// date-fnsの代わりにネイティブのDateメソッドを使用
// 時間帯に応じた挨拶を取得
function getGreeting(hour) {
    if (hour >= 5 && hour < 10) {
        return { greeting: 'おはようございます', emoji: '☀️' };
    }
    else if (hour >= 10 && hour < 17) {
        return { greeting: 'こんにちは', emoji: '🌞' };
    }
    else {
        return { greeting: 'こんばんは', emoji: '🌙' };
    }
}
export class NotificationServiceV2 {
    // 定時通知を送信
    async sendScheduledNotification(userId) {
        try {
            logger.info(`定時通知開始: ユーザー ${userId}`);
            const elderlyList = await Elderly.find({
                userId,
                status: 'active',
                lineUserId: { $exists: true, $ne: null }
            });
            if (elderlyList.length === 0) {
                logger.warn(`LINE連携済みの家族が見つかりません: ユーザー ${userId}`);
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const elderly of elderlyList) {
                await this.sendNotificationToElderly(elderly, userId, today, 'scheduled');
            }
        }
        catch (error) {
            logger.error(`定時通知エラー: ユーザー ${userId}`, error);
        }
    }
    // テスト用の定時通知を送信
    async sendScheduledNotificationAsTest(userId) {
        try {
            logger.info(`テスト通知開始: ユーザー ${userId}`);
            const elderlyList = await Elderly.find({
                userId,
                status: 'active',
                lineUserId: { $exists: true, $ne: null }
            });
            if (elderlyList.length === 0) {
                logger.warn(`LINE連携済みの家族が見つかりません: ユーザー ${userId}`);
                return;
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const elderly of elderlyList) {
                await this.sendNotificationToElderly(elderly, userId, today, 'test');
            }
        }
        catch (error) {
            logger.error(`テスト通知エラー: ユーザー ${userId}`, error);
        }
    }
    // 個別の家族に通知を送信
    async sendNotificationToElderly(elderly, userId, date, notificationType) {
        try {
            // トークン生成
            const token = await generateResponseToken(elderly._id.toString());
            const responseUrl = `${process.env.FRONTEND_URL || 'https://anpee.jp'}/genki/${token}`;
            // メッセージ作成
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const dateStr = `${month}月${day}日`;
            const { greeting, emoji } = getGreeting(now.getHours());
            let urgencyMessage = '';
            if (notificationType === 'retry1')
                urgencyMessage = '\n⚠️ 2回目の確認です。';
            else if (notificationType === 'retry2')
                urgencyMessage = '\n⚠️ 3回目の確認です。';
            else if (notificationType === 'retry3')
                urgencyMessage = '\n🚨 最後の確認です。';
            // テスト送信の場合は明確に表示
            const testPrefix = notificationType === 'test' ? '【テスト送信】\n' : '';
            const messages = [{
                    type: 'text',
                    text: `${testPrefix}${greeting}、${elderly.name}さん！${emoji}${urgencyMessage}\n\n今日（${dateStr}）の元気確認${notificationType === 'test' ? 'テスト' : 'がまだ'}です。\nお元気でお過ごしですか？\n\n下のリンクをタップして、\n「元気ですボタン」を押してください。\n\n▼ タップしてください ▼\n${responseUrl}\n\nご家族が${elderly.name}さんの元気を待っています💝`
                }];
            // LINE送信
            await sendLineMessage(elderly.lineUserId, messages);
            logger.info(`LINE送信成功: ${elderly.name}さん (${elderly._id})`);
            // DailyNotificationレコードを更新
            const notification = {
                sentAt: now,
                type: notificationType,
                token,
                tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            const updatedRecord = await DailyNotification.findOneAndUpdate({
                elderlyId: elderly._id,
                date: date
            }, {
                $setOnInsert: {
                    userId,
                    elderlyId: elderly._id,
                    date
                },
                $push: { notifications: notification }
            }, { upsert: true, new: true });
            logger.info(`通知記録を保存: ${elderly.name}さん, タイプ: ${notificationType}`);
            logger.info(`保存されたトークン: ${token}`);
            logger.info(`レコードID: ${updatedRecord._id}, 通知数: ${updatedRecord.notifications.length}`);
        }
        catch (error) {
            logger.error(`通知送信エラー: ${elderly.name}さん`, error);
            throw error;
        }
    }
    // 再通知をチェックして送信
    async checkAndSendRetryNotifications() {
        try {
            logger.info('再通知チェック開始');
            // 24時間前の時刻を取得（日付をまたいだ通知にも対応）
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
            // デバッグ用：過去24時間のレコードを取得して確認
            const allRecentRecords = await DailyNotification.find({
                date: { $gte: twentyFourHoursAgo }
            });
            logger.info(`過去24時間の全レコード数: ${allRecentRecords.length}`);
            for (const record of allRecentRecords) {
                logger.info(`レコード詳細: ID=${record._id}, date=${record.date.toISOString()}, response=${record.response ? 'あり' : 'なし'}, adminNotifiedAt=${record.adminNotifiedAt || 'なし'}`);
            }
            // 過去24時間の未応答レコードを取得（複数のクエリ方法で確認）
            const query1 = await DailyNotification.find({
                date: { $gte: twentyFourHoursAgo },
                response: { $exists: false },
                adminNotifiedAt: { $exists: false }
            });
            logger.info(`クエリ1 (response: {$exists: false}): ${query1.length}件`);
            const query2 = await DailyNotification.find({
                date: { $gte: twentyFourHoursAgo },
                response: null,
                adminNotifiedAt: null
            });
            logger.info(`クエリ2 (response: null): ${query2.length}件`);
            const query3 = await DailyNotification.find({
                date: { $gte: twentyFourHoursAgo },
                $and: [
                    {
                        $or: [
                            { response: null },
                            { response: { $exists: false } }
                        ]
                    },
                    {
                        $or: [
                            { adminNotifiedAt: null },
                            { adminNotifiedAt: { $exists: false } }
                        ]
                    }
                ]
            });
            logger.info(`クエリ3 ($orを使用): ${query3.length}件`);
            const pendingRecordsWithoutPopulate = query1; // $exists: falseを使用
            logger.info(`populate前のチェック対象履歴数: ${pendingRecordsWithoutPopulate.length}`);
            // populateありで取得（存在しないフィールドをチェック）
            const pendingRecords = await DailyNotification.find({
                date: { $gte: twentyFourHoursAgo },
                response: { $exists: false },
                adminNotifiedAt: { $exists: false }
            }).populate('userId elderlyId');
            logger.info(`populate後のチェック対象履歴数: ${pendingRecords.length}`);
            for (const record of pendingRecords) {
                const user = await User.findById(record.userId);
                if (!user?.notificationSettings?.retrySettings?.maxRetries)
                    continue;
                const { retrySettings } = user.notificationSettings;
                const elderly = record.elderlyId;
                // 最後の通知から経過時間を計算
                const lastNotification = record.notifications[record.notifications.length - 1];
                if (!lastNotification)
                    continue;
                const minutesSinceLastNotification = Math.floor((Date.now() - lastNotification.sentAt.getTime()) / (1000 * 60));
                // 現在の再通知回数を計算（retryタイプの通知数をカウント）
                const retryCount = record.notifications.filter(n => n.type.startsWith('retry')).length;
                logger.info(`再通知チェック: ${elderly.name}さん - 最後の通知から${minutesSinceLastNotification}分経過, 再通知回数: ${retryCount}`);
                // 初回の応答なし通知を送信（まだ再通知が0回で、設定した間隔が経過した場合）
                if (retryCount === 0 && minutesSinceLastNotification >= retrySettings.retryInterval) {
                    // 初回の応答なし通知を作成
                    await notificationService.notifyNoResponse(user._id.toString(), elderly._id.toString(), elderly.name, 0);
                }
                // 再通知が必要かチェック
                if (minutesSinceLastNotification >= retrySettings.retryInterval) {
                    if (retryCount < retrySettings.maxRetries) {
                        // 再通知を送信
                        const retryType = `retry${retryCount + 1}`;
                        logger.info(`再通知送信: ${elderly.name}さん - タイプ: ${retryType}`);
                        await this.sendNotificationToElderly(elderly, user._id.toString(), record.date, retryType);
                        // アプリ内通知を作成
                        await notificationService.notifyNoResponse(user._id.toString(), elderly._id.toString(), elderly.name, retryCount + 1);
                    }
                    else if (!record.adminNotifiedAt && minutesSinceLastNotification >= 30) {
                        // 管理者通知を送信
                        logger.info(`管理者通知条件満たす: ${elderly.name}さん`);
                        await this.notifyAdmin(user, elderly, record);
                    }
                }
            }
        }
        catch (error) {
            logger.error('再通知チェックエラー:', error);
        }
    }
    // 管理者への通知
    async notifyAdmin(user, elderly, record) {
        try {
            if (user.notificationSettings?.methods?.email?.enabled) {
                const emailAddress = user.notificationSettings.methods.email.address || user.email;
                // 最後の通知時刻を取得
                const lastNotification = record.notifications[record.notifications.length - 1];
                const lastNotificationTime = lastNotification?.sentAt;
                await emailService.sendSafetyCheckNotification(emailAddress, elderly.name, lastNotificationTime);
                // 管理者通知済みフラグを設定
                record.adminNotifiedAt = new Date();
                await record.save();
                // アプリ内通知を作成
                await notificationService.notifyAdmin(user._id.toString(), elderly._id.toString(), elderly.name);
                logger.info(`管理者通知送信: ${emailAddress} - ${elderly.name}さん`);
            }
        }
        catch (error) {
            logger.error('管理者通知エラー:', error);
        }
    }
    // 元気ボタンの応答を記録
    async recordResponse(token) {
        try {
            logger.info(`元気ボタン応答処理開始: トークン=${token}`);
            // トークンで該当するレコードを検索（responseが存在しないことを確認）
            const record = await DailyNotification.findOne({
                'notifications.token': token,
                response: { $exists: false }
            }).populate('elderlyId');
            if (!record) {
                // デバッグ用：すべてのDailyNotificationレコードを確認
                const allRecords = await DailyNotification.find({
                    date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                });
                logger.error(`トークンに該当するレコードが見つかりません: ${token}`);
                logger.error(`本日のレコード数: ${allRecords.length}`);
                for (const r of allRecords) {
                    logger.error(`レコード: elderlyId=${r.elderlyId}, notifications=${r.notifications.map(n => n.token).join(', ')}`);
                }
                return { success: false, error: 'Invalid or expired token' };
            }
            // トークンの有効期限をチェック
            const notification = record.notifications.find(n => n.token === token);
            if (!notification || new Date() > notification.tokenExpiresAt) {
                return { success: false, error: 'Token expired' };
            }
            // 応答を記録
            record.response = {
                respondedAt: new Date(),
                respondedToken: token
            };
            await record.save();
            // 家族の最終応答日時を更新
            const elderly = record.elderlyId;
            elderly.lastResponseAt = new Date();
            await elderly.save();
            // アプリ内通知を作成
            if (record.userId) {
                await notificationService.notifyResponse(record.userId, elderly._id, elderly.name);
            }
            logger.info(`元気ボタン応答記録: ${elderly.name}さん`);
            return { success: true, elderlyName: elderly.name };
        }
        catch (error) {
            logger.error('応答記録エラー:', error);
            return { success: false, error: 'Internal error' };
        }
    }
    // 履歴を取得（新しいフォーマット）
    async getHistory(userId, options) {
        const { elderlyId, startDate, endDate, page = 1, limit = 50 } = options;
        // クエリ構築
        const query = { userId };
        if (elderlyId)
            query.elderlyId = elderlyId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = startDate;
            if (endDate)
                query.date.$lte = endDate;
        }
        // データ取得
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
            DailyNotification.find(query)
                .populate('elderlyId', 'name phone')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            DailyNotification.countDocuments(query)
        ]);
        // 履歴形式に変換（後方互換性のため）
        const history = records.flatMap(record => {
            const elderly = record.elderlyId;
            return record.notifications.map(notification => {
                const isResponded = record.response?.respondedToken === notification.token;
                const status = isResponded ? 'success' :
                    notification.tokenExpiresAt < new Date() ? 'expired' : 'pending';
                // 応答時間を計算（応答があった場合のみ）
                let duration = undefined;
                if (isResponded && record.response?.respondedAt) {
                    duration = Math.floor((new Date(record.response.respondedAt).getTime() -
                        new Date(notification.sentAt).getTime()) / 1000); // 秒単位
                }
                return {
                    _id: `${record._id}-${notification.token}`,
                    elderlyId: elderly,
                    type: 'genki_button',
                    status,
                    token: notification.token,
                    createdAt: notification.sentAt,
                    respondedAt: isResponded ? record.response?.respondedAt : undefined,
                    duration,
                    notes: record.notes,
                    notificationType: notification.type
                };
            });
        });
        return {
            responses: history,
            pagination: {
                page,
                limit,
                total: history.length,
                pages: Math.ceil(total / limit)
            }
        };
    }
}
export default new NotificationServiceV2();
