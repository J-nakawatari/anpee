import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/User.js';
import '../models/Elderly.js';
import DailyNotification from '../models/DailyNotification.js';
// 環境変数を読み込む
dotenv.config();
async function checkTodayNotifications() {
    try {
        // MongoDBに接続
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDBに接続しました');
        // 今日の日付を取得
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 今日の全レコードを取得
        const todayRecords = await DailyNotification.find({
            date: { $gte: today }
        }).populate('userId elderlyId');
        console.log(`\n=== 今日（${today.toLocaleDateString('ja-JP')}）の通知状況 ===`);
        console.log(`レコード数: ${todayRecords.length}件\n`);
        for (const record of todayRecords) {
            const user = record.userId;
            const elderly = record.elderlyId;
            console.log(`----------------------------------------`);
            console.log(`家族名: ${elderly?.name || 'Unknown'}`);
            console.log(`ユーザー名: ${user?.name || 'Unknown'}`);
            console.log(`レコードID: ${record._id}`);
            console.log(`日付: ${record.date.toLocaleDateString('ja-JP')}`);
            // 応答状況
            if (record.response) {
                console.log(`\n📱 応答あり:`);
                console.log(`  応答時刻: ${record.response.respondedAt.toLocaleString('ja-JP')}`);
                console.log(`  応答トークン: ${record.response.respondedToken.substring(0, 10)}...`);
            }
            else {
                console.log(`\n❌ 未応答`);
            }
            // 管理者通知
            if (record.adminNotifiedAt) {
                console.log(`\n📧 管理者通知済み: ${record.adminNotifiedAt.toLocaleString('ja-JP')}`);
            }
            // 通知履歴
            console.log(`\n通知履歴 (${record.notifications.length}件):`);
            record.notifications.forEach((notif, index) => {
                const timeSince = Math.floor((Date.now() - notif.sentAt.getTime()) / (1000 * 60));
                console.log(`  ${index + 1}. [${notif.type}] ${notif.sentAt.toLocaleString('ja-JP')} (${timeSince}分前)`);
                // 応答があったトークンかチェック
                if (record.response?.respondedToken === notif.token) {
                    console.log(`     ✅ このトークンで応答済み`);
                }
            });
            // 再通知の状況を分析
            console.log(`\n再通知分析:`);
            const retryNotifications = record.notifications.filter(n => n.type.startsWith('retry'));
            console.log(`  再通知回数: ${retryNotifications.length}回`);
            if (user && user.notificationSettings?.retrySettings) {
                const settings = user.notificationSettings.retrySettings;
                console.log(`  設定: 最大${settings.maxRetries}回、間隔${settings.retryInterval}分`);
                if (!record.response && !record.adminNotifiedAt) {
                    const lastNotif = record.notifications[record.notifications.length - 1];
                    const minutesSinceLast = Math.floor((Date.now() - lastNotif.sentAt.getTime()) / (1000 * 60));
                    if (retryNotifications.length < settings.maxRetries) {
                        if (minutesSinceLast >= settings.retryInterval) {
                            console.log(`  ⚠️ 再通知が必要です (次: retry${retryNotifications.length + 1})`);
                        }
                        else {
                            console.log(`  ⏰ 次の再通知まで: ${settings.retryInterval - minutesSinceLast}分`);
                        }
                    }
                    else {
                        console.log(`  ✓ 最大再通知回数に到達`);
                        if (!record.adminNotifiedAt && minutesSinceLast >= 30) {
                            console.log(`  ⚠️ 管理者通知が必要です`);
                        }
                    }
                }
                else if (record.response) {
                    console.log(`  ✓ 応答済みのため再通知は不要`);
                }
                else if (record.adminNotifiedAt) {
                    console.log(`  ✓ 管理者通知済み`);
                }
            }
        }
        console.log('\n完了しました');
    }
    catch (error) {
        console.error('エラー:', error);
    }
    finally {
        await mongoose.connection.close();
    }
}
// スクリプトを実行
checkTodayNotifications();
