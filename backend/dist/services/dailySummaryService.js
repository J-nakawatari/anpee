import * as cron from 'node-cron';
import User from '../models/User.js';
import Elderly from '../models/Elderly.js';
import Response from '../models/Response.js';
import ResponseHistory from '../models/ResponseHistory.js';
import emailService from './emailService.js';
import logger from '../utils/logger.js';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
// 日次サマリー通知サービス
class DailySummaryService {
    summaryTask = null;
    // サービス開始
    async start() {
        logger.info('日次サマリーサービスを開始します');
        // 既存のタスクを停止
        this.stop();
        // 毎日21時に日次サマリーを送信
        this.summaryTask = cron.schedule('0 21 * * *', async () => {
            await this.sendDailySummaries();
        }, {
            timezone: 'Asia/Tokyo'
        });
    }
    // 全ユーザーに日次サマリーを送信
    async sendDailySummaries() {
        try {
            logger.info('日次サマリー送信処理を開始');
            // サマリーメールが有効なユーザーを取得
            const users = await User.find({
                'notificationSettings.methods.email.enabled': true,
                'notificationSettings.methods.email.address': { $exists: true, $ne: '' }
            });
            for (const user of users) {
                await this.sendUserSummary(user);
            }
            logger.info(`日次サマリー送信完了: ${users.length}人のユーザーに送信`);
        }
        catch (error) {
            logger.error('日次サマリー送信エラー:', error);
        }
    }
    // 特定ユーザーのサマリーを送信
    async sendUserSummary(user) {
        try {
            const today = new Date();
            const todayStart = startOfDay(today);
            const todayEnd = endOfDay(today);
            const dateStr = format(today, 'yyyy年M月d日', { locale: ja });
            // ユーザーの家族リストを取得
            const elderlyList = await Elderly.find({
                userId: user._id,
                status: 'active'
            });
            if (elderlyList.length === 0) {
                return; // 家族が登録されていない場合はスキップ
            }
            // 各家族の今日の応答状況を集計
            const summaryData = await Promise.all(elderlyList.map(async (elderly) => {
                // 今日の応答を確認
                const todayResponse = await Response.findOne({
                    elderlyId: elderly._id,
                    type: 'genki_button',
                    status: 'success',
                    respondedAt: { $gte: todayStart, $lte: todayEnd }
                }).sort({ respondedAt: -1 });
                // 今日の通知履歴を確認
                const todayHistory = await ResponseHistory.findOne({
                    elderlyId: elderly._id,
                    date: { $gte: todayStart, $lte: todayEnd }
                }).sort({ createdAt: -1 });
                return {
                    name: elderly.name,
                    hasResponded: !!todayResponse,
                    responseTime: todayResponse ? format(todayResponse.respondedAt, 'HH:mm', { locale: ja }) : null,
                    notificationCount: todayHistory?.retryCount || 0,
                    status: todayResponse ? 'responded' : (todayHistory ? 'pending' : 'not_sent')
                };
            }));
            // サマリーHTMLを生成
            const html = this.generateSummaryHtml(dateStr, summaryData);
            // メール送信
            const emailAddress = user.notificationSettings.methods.email.address || user.email;
            await emailService.sendDirectEmail({
                to: emailAddress,
                subject: `【あんぴーちゃん】${dateStr}の安否確認サマリー`,
                html
            });
            logger.info(`日次サマリー送信成功: ${user.email}`);
        }
        catch (error) {
            logger.error(`ユーザー ${user._id} のサマリー送信エラー:`, error);
        }
    }
    // サマリーHTMLを生成
    generateSummaryHtml(dateStr, summaryData) {
        const respondedCount = summaryData.filter(d => d.hasResponded).length;
        const pendingCount = summaryData.filter(d => d.status === 'pending').length;
        const totalCount = summaryData.length;
        let statusRows = summaryData.map(data => {
            let statusIcon = '';
            let statusText = '';
            let statusColor = '';
            if (data.hasResponded) {
                statusIcon = '✅';
                statusText = `応答済み (${data.responseTime})`;
                statusColor = '#10b981';
            }
            else if (data.status === 'pending') {
                statusIcon = '⚠️';
                statusText = '応答待ち';
                statusColor = '#f59e0b';
            }
            else {
                statusIcon = '➖';
                statusText = '未送信';
                statusColor = '#6b7280';
            }
            return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${data.name}さん</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${statusIcon}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: ${statusColor};">
            ${statusText}
          </td>
        </tr>
      `;
        }).join('');
        return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">本日の安否確認サマリー</h2>
        <p style="color: #374151; font-size: 16px;">${dateStr}</p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px;">
            <strong>本日の応答状況</strong><br>
            応答済み: ${respondedCount}人 / 全体: ${totalCount}人
            ${pendingCount > 0 ? `<br><span style="color: #f59e0b;">応答待ち: ${pendingCount}人</span>` : ''}
          </p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; font-weight: 600;">お名前</th>
              <th style="padding: 12px; text-align: center; font-weight: 600;">状態</th>
              <th style="padding: 12px; text-align: left; font-weight: 600;">詳細</th>
            </tr>
          </thead>
          <tbody>
            ${statusRows}
          </tbody>
        </table>
        
        <p style="margin-top: 30px;">
          詳細は管理画面でご確認いただけます：<br>
          <a href="https://anpee.jp/user/dashboard" style="color: #f97316;">https://anpee.jp/user/dashboard</a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
          このメールは「あんぴーちゃん」から自動送信されています。<br>
          サマリーメールの配信停止は<a href="https://anpee.jp/user/notifications" style="color: #f97316;">通知設定</a>から行えます。
        </p>
      </div>
    `;
    }
    // サービス停止
    stop() {
        if (this.summaryTask) {
            this.summaryTask.stop();
            this.summaryTask = null;
            logger.info('日次サマリーサービスを停止しました');
        }
    }
}
export default new DailySummaryService();
