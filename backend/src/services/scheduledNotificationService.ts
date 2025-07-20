import * as cron from 'node-cron'
import User from '../models/User.js'
import Elderly from '../models/Elderly.js'
import Response from '../models/Response.js'
import ResponseHistory from '../models/ResponseHistory.js'
import { sendLineMessage } from './lineService.js'
import { generateResponseToken } from './tokenService.js'
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
    // 深夜帯（23時～5時）
    return { greeting: 'こんばんは', emoji: '🌙' }
  }
}

// 通知送信サービス
class ScheduledNotificationService {
  private tasks: Map<string, cron.ScheduledTask> = new Map()

  // サービス開始
  async start() {
    logger.info('定時通知サービスを開始します')
    
    // 既存のタスクをすべて停止
    this.stopAll()
    
    // すべてのユーザーの通知設定を読み込んでスケジュール設定
    await this.scheduleAllUsers()
    
    // 1分ごとに設定をチェックして更新
    cron.schedule('* * * * *', async () => {
      await this.checkAndUpdateSchedules()
    })
  }

  // すべてのユーザーの通知をスケジュール
  private async scheduleAllUsers() {
    try {
      const users = await User.find({
        'notificationSettings.timing.morning.enabled': true
      }).select('_id notificationSettings')

      for (const user of users) {
        await this.scheduleUserNotifications(user)
        
        // 初回設定を保存
        const { timing } = user.notificationSettings || {}
        const morningTime = timing?.morning?.enabled ? timing.morning.time : null
        
        this.userSettings.set((user._id as any).toString(), {
          morning: morningTime
        })
      }
      
      logger.info(`${users.length}人のユーザーの通知をスケジュールしました`)
    } catch (error) {
      logger.error('通知スケジュール設定エラー:', error)
    }
  }

  // 特定ユーザーの通知をスケジュール
  private async scheduleUserNotifications(user: any) {
    const { timing } = user.notificationSettings || {}
    
    // 通知設定
    if (timing?.morning?.enabled && timing.morning.time) {
      const [hour, minute] = timing.morning.time.split(':')
      const cronExpression = `${minute} ${hour} * * *`
      
      const taskId = `${user._id}-morning`
      this.cancelTask(taskId)
      
      const task = cron.schedule(cronExpression, async () => {
        await this.sendMorningNotification(user._id.toString())
      }, {
        timezone: 'Asia/Tokyo'
      })
      
      this.tasks.set(taskId, task)
      logger.info(`通知をスケジュール: ユーザー ${user._id}, 時刻 ${timing.morning.time}`)
    }
  }

  // 通知送信
  async sendMorningNotification(userId: string) {
    try {
      logger.info(`通知送信開始: ユーザー ${userId}`)
      
      // ユーザーの家族情報を取得
      const elderlyList = await Elderly.find({
        userId,
        status: 'active',
        lineUserId: { $exists: true, $ne: null }
      })

      if (elderlyList.length === 0) {
        logger.warn(`LINE連携済みの家族が見つかりません: ユーザー ${userId}`)
        return
      }

      // 各家族に元気確認メッセージを送信
      for (const elderly of elderlyList) {
        try {
          // 応答用トークンを生成
          const token = await generateResponseToken((elderly._id as any).toString())
          const responseUrl = `${process.env.FRONTEND_URL || 'https://anpee.jp'}/genki/${token}`

          // 今日の日付を日本語形式で取得
          const today = new Date()
          const dateStr = format(today, 'M月d日', { locale: ja })
          
          // 現在の時間帯に応じた挨拶を取得
          const hour = today.getHours()
          const { greeting, emoji } = getGreeting(hour)

          const messages = [
            {
              type: 'text' as const,
              text: `${greeting}、${elderly.name}さん！${emoji}\n\n今日は${dateStr}です。\nお元気でお過ごしですか？\n\n下のリンクをタップして、\n「元気ですボタン」を押してください。\n\n▼ タップしてください ▼\n${responseUrl}\n\nご家族が${elderly.name}さんの元気を待っています💝`
            }
          ]

          await sendLineMessage(elderly.lineUserId || '', messages)
          logger.info(`通知送信成功: ${elderly.name}さん (${elderly._id})`)
          
          // 通知履歴を作成
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          
          // 今日の履歴があるか確認
          let history = await ResponseHistory.findOne({
            elderlyId: elderly._id,
            userId,
            date: { $gte: todayStart }
          })
          
          if (!history) {
            // 新規作成
            await ResponseHistory.create({
              elderlyId: elderly._id,
              userId,
              type: 'line_button',
              responseAt: new Date(),
              status: 'pending',
              retryCount: 0,
              date: new Date(),
              lastNotificationTime: new Date()
            })
          } else {
            // 既存の履歴を更新（再通知の場合）
            history.lastNotificationTime = new Date()
            await history.save()
          }
          
        } catch (error) {
          logger.error(`通知送信エラー: ${elderly.name}さん`, error)
        }
      }
      
    } catch (error) {
      logger.error(`通知処理エラー: ユーザー ${userId}`, error)
    }
  }

  // タスク設定を保存するマップ
  private userSettings: Map<string, {morning?: string | null}> = new Map()

  // スケジュールの更新チェック
  private async checkAndUpdateSchedules() {
    try {
      // 通知設定が変更されたユーザーを再スケジュール
      const users = await User.find({
        'notificationSettings.timing.morning.enabled': true
      }).select('_id notificationSettings updatedAt')

      for (const user of users) {
        const userId = (user._id as any).toString()
        const currentSettings = this.userSettings.get(userId) || {}
        const { timing } = user.notificationSettings || {}
        
        // 設定が変更されたかチェック
        const morningTime = timing?.morning?.enabled ? timing.morning.time : null
        
        const hasChanged = currentSettings.morning !== morningTime
        
        if (hasChanged) {
          logger.info(`ユーザー ${userId} の通知設定が変更されました`)
          await this.scheduleUserNotifications(user)
          
          // 新しい設定を保存
          this.userSettings.set(userId, {
            morning: morningTime
          })
        }
      }
    } catch (error) {
      logger.error('スケジュール更新チェックエラー:', error)
    }
  }

  // タスクをキャンセル
  private cancelTask(taskId: string) {
    const task = this.tasks.get(taskId)
    if (task) {
      task.stop()
      this.tasks.delete(taskId)
    }
  }

  // すべてのタスクを停止
  stopAll() {
    this.tasks.forEach((task, taskId) => {
      task.stop()
      logger.info(`タスク停止: ${taskId}`)
    })
    this.tasks.clear()
  }
}

export default new ScheduledNotificationService()