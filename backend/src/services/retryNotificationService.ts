import * as cron from 'node-cron'
import User from '../models/User.js'
import Elderly from '../models/Elderly.js'
import Response from '../models/Response.js'
import ResponseHistory from '../models/ResponseHistory.js'
import { sendLineMessage } from './lineService.js'
import { generateResponseToken } from './tokenService.js'
import emailService from './emailService.js'
import logger from '../utils/logger.js'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

// 時間帯に応じた挨拶を取得
function getGreeting(hour: number): { greeting: string; emoji: string } {
  if (hour >= 5 && hour < 10) {
    return { greeting: 'おはようございます', emoji: '☀️' }
  } else if (hour >= 10 && hour < 17) {
    return { greeting: 'こんにちは', emoji: '🌞' }
  } else if (hour >= 17 && hour < 23) {
    return { greeting: 'こんばんは', emoji: '🌙' }
  } else {
    return { greeting: 'こんばんは', emoji: '🌙' }
  }
}

// 再通知管理サービス
class RetryNotificationService {
  private checkInterval: cron.ScheduledTask | null = null

  // サービス開始
  async start() {
    logger.info('再通知サービスを開始します')
    
    // 既存のタスクを停止
    this.stop()
    
    // 1分ごとに未応答をチェック
    this.checkInterval = cron.schedule('* * * * *', async () => {
      // 非同期でエラーハンドリング
      this.checkAndSendRetryNotifications().catch(error => {
        logger.error('再通知チェック実行エラー:', error)
      })
    }, {
      timezone: 'Asia/Tokyo'
    })
  }

  // 未応答チェックと再通知送信
  private async checkAndSendRetryNotifications() {
    try {
      logger.info('再通知チェック開始')
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 本日の履歴で再通知が必要なものを直接取得（効率化）
      const histories = await ResponseHistory.find({
        date: { $gte: today },
        $or: [
          { status: 'pending' },
          { adminNotified: { $ne: true } }
        ]
      }).populate('userId elderlyId')
      
      logger.info(`チェック対象履歴数: ${histories.length}`)
      
      // 履歴をユーザーごとにグループ化
      const userHistories = new Map<string, any[]>()
      
      for (const history of histories) {
        const userId = (history.userId as any)._id.toString()
        if (!userHistories.has(userId)) {
          userHistories.set(userId, [])
        }
        userHistories.get(userId)!.push(history)
      }
      
      // 各ユーザーの履歴をチェック
      for (const [userId, userHistory] of userHistories) {
        const user = await User.findById(userId).select('notificationSettings')
        if (!user || !user.notificationSettings?.retrySettings?.maxRetries) continue
        
        for (const history of userHistory) {
          await this.checkHistoryAndSendNotification(history, user)
        }
      }
    } catch (error) {
      logger.error('再通知チェックエラー:', error)
    }
  }

  // 履歴をチェックして通知を送信
  private async checkHistoryAndSendNotification(history: any, user: any) {
    try {
      const { retrySettings } = user.notificationSettings || {}
      if (!retrySettings || retrySettings.maxRetries === 0) return
      
      const elderly = history.elderlyId
      if (!elderly || elderly.status !== 'active' || !elderly.lineUserId) return
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 本日の成功応答を確認（効率化のため必要な場合のみ）
      const latestResponse = await Response.findOne({
        elderlyId: elderly._id,
        type: 'genki_button',
        status: 'success',
        respondedAt: { $gte: today }
      }).sort({ respondedAt: -1 })
      
      // 再通知が必要かチェック
      if (this.shouldSendRetry(latestResponse, history, retrySettings)) {
        await this.sendRetryNotification(elderly, user, history)
      }
      // 管理者通知が必要かチェック
      else if (this.shouldNotifyAdmin(latestResponse, history, retrySettings)) {
        await this.notifyAdmin(user, elderly)
        // 管理者通知済みフラグを設定
        history.adminNotified = true
        await history.save()
      }
    } catch (error) {
      logger.error(`履歴 ${history._id} の再通知チェックエラー:`, error)
    }
  }

  // 再通知が必要かどうか判定
  private shouldSendRetry(
    latestResponse: any,
    latestHistory: any,
    retrySettings: any
  ): boolean {
    // 今日の応答がある場合は再通知不要
    if (latestResponse && latestResponse.status === 'success') {
      return false
    }

    // 履歴がない場合（初回通知がまだ送信されていない）
    if (!latestHistory) {
      return false
    }

    // 最大再通知回数に達している場合
    if (latestHistory.retryCount >= retrySettings.maxRetries) {
      return false
    }

    // 最後の通知から指定時間が経過しているかチェック
    const lastNotificationTime = latestHistory.lastNotificationTime || latestHistory.createdAt
    const now = new Date()
    const minutesSinceLastNotification = Math.floor(
      (now.getTime() - new Date(lastNotificationTime).getTime()) / (1000 * 60)
    )

    return minutesSinceLastNotification >= retrySettings.retryInterval
  }

  // 再通知を送信
  private async sendRetryNotification(elderly: any, user: any, latestHistory: any) {
    try {
      // 応答用トークンを生成
      const token = await generateResponseToken((elderly._id as any).toString())
      const responseUrl = `${process.env.FRONTEND_URL || 'https://anpee.jp'}/genki/${token}`

      // 現在の時刻情報を取得
      const now = new Date()
      const hour = now.getHours()
      const { greeting, emoji } = getGreeting(hour)
      const dateStr = format(now, 'M月d日', { locale: ja })

      // 再通知回数に応じたメッセージ
      const retryCount = (latestHistory?.retryCount || 0) + 1
      const urgencyMessage = retryCount > 1 
        ? `\n⚠️ ${retryCount}回目の確認です。` 
        : ''

      const messages = [
        {
          type: 'text' as const,
          text: `${greeting}、${elderly.name}さん！${emoji}${urgencyMessage}\n\n今日（${dateStr}）の元気確認がまだです。\nお元気でお過ごしですか？\n\n下のリンクをタップして、\n「元気ですボタン」を押してください。\n\n▼ タップしてください ▼\n${responseUrl}\n\nご家族が${elderly.name}さんの元気を待っています💝`
        }
      ]

      try {
        await sendLineMessage(elderly.lineUserId || '', messages)
        logger.info(`LINE送信成功: ${elderly.name}さん (${elderly._id}), ${retryCount}回目`)
        
        // 履歴を更新または作成
        if (latestHistory) {
          latestHistory.retryCount = retryCount
          latestHistory.lastNotificationTime = now
          await latestHistory.save()
        } else {
          // 履歴がない場合は新規作成（通常は発生しないはず）
          await ResponseHistory.create({
            elderlyId: elderly._id,
            userId: user._id,
            type: 'line_button',
            responseAt: now,
            date: now,
            retryCount: 1,
            lastNotificationTime: now,
            status: 'pending'
          })
        }

        logger.info(`再通知送信成功: ${elderly.name}さん (${elderly._id}), ${retryCount}回目`)
      } catch (lineError: any) {
        logger.error(`LINE送信エラー: ${elderly.name}さん`, {
          elderlyId: elderly._id,
          lineUserId: elderly.lineUserId,
          error: lineError.message,
          statusCode: lineError.statusCode || lineError.response?.status
        })
        // エラーがあっても履歴の更新は続行しない（再試行されるように）
        throw lineError
      }
      
    } catch (error) {
      logger.error(`再通知送信エラー: ${elderly.name}さん`, error)
    }
  }

  // 管理者（ユーザー）への通知
  private async notifyAdmin(user: any, elderly: any) {
    try {
      // ユーザーのメールアドレスを取得
      const userDoc = await User.findById(user._id).select('email notificationSettings')
      
      if (!userDoc || !userDoc.email) {
        logger.warn(`管理者通知: ユーザーのメールアドレスが見つかりません ${user._id}`)
        return
      }

      // メール通知が有効な場合
      if (userDoc.notificationSettings?.methods?.email?.enabled) {
        // メールサービスを使用してお知らせメールを送信
        const emailAddress = userDoc.notificationSettings.methods.email.address || userDoc.email
        
        // 最後の応答時刻を取得
        const lastResponse = await Response.findOne({
          elderlyId: elderly._id,
          type: 'genki_button',
          status: 'success'
        }).sort({ respondedAt: -1 })
        
        await emailService.sendSafetyCheckNotification(
          emailAddress,
          elderly.name,
          lastResponse?.respondedAt
        )
        
        logger.info(`管理者通知メール送信完了: ${emailAddress} - ${elderly.name}さんの応答なし通知`)
      }

      logger.info(`応答なし通知: ${elderly.name}さんから応答がありません（ユーザー: ${user._id}）`)
    } catch (error) {
      logger.error('管理者通知エラー:', error)
    }
  }

  // 管理者通知が必要かどうか判定
  private shouldNotifyAdmin(
    latestResponse: any,
    latestHistory: any,
    retrySettings: any
  ): boolean {
    // 今日の応答がある場合は通知不要
    if (latestResponse && latestResponse.status === 'success') {
      return false
    }

    // 履歴がない、または最大再通知回数に達していない場合
    if (!latestHistory || latestHistory.retryCount < retrySettings.maxRetries) {
      return false
    }

    // 管理者通知が既に送信済みかチェック
    if (latestHistory.adminNotified) {
      return false
    }

    // 最後の通知から30分経過しているかチェック
    const lastNotificationTime = latestHistory.lastNotificationTime || latestHistory.createdAt
    const now = new Date()
    const minutesSinceLastNotification = Math.floor(
      (now.getTime() - new Date(lastNotificationTime).getTime()) / (1000 * 60)
    )

    // 最後の通知から2分経過していれば管理者に通知（テスト用に一時的に2分）
    return minutesSinceLastNotification >= 2
  }

  // サービス停止
  stop() {
    if (this.checkInterval) {
      this.checkInterval.stop()
      this.checkInterval = null
      logger.info('再通知サービスを停止しました')
    }
  }
}

export default new RetryNotificationService()