import * as cron from 'node-cron'
import User from '../models/User.js'
import Elderly from '../models/Elderly.js'
import Response from '../models/Response.js'
import { sendLineMessage } from './lineService.js'
import { generateResponseToken } from './tokenService.js'
import logger from '../utils/logger.js'

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
        'notificationSettings.timing.morning.enabled': true,
        'notificationSettings.timing.evening.enabled': true
      }).select('_id notificationSettings')

      for (const user of users) {
        await this.scheduleUserNotifications(user)
      }
      
      logger.info(`${users.length}人のユーザーの通知をスケジュールしました`)
    } catch (error) {
      logger.error('通知スケジュール設定エラー:', error)
    }
  }

  // 特定ユーザーの通知をスケジュール
  private async scheduleUserNotifications(user: any) {
    const { timing } = user.notificationSettings || {}
    
    // 朝の通知
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
      logger.info(`朝の通知をスケジュール: ユーザー ${user._id}, 時刻 ${timing.morning.time}`)
    }
    
    // 夜の通知
    if (timing?.evening?.enabled && timing.evening.time) {
      const [hour, minute] = timing.evening.time.split(':')
      const cronExpression = `${minute} ${hour} * * *`
      
      const taskId = `${user._id}-evening`
      this.cancelTask(taskId)
      
      const task = cron.schedule(cronExpression, async () => {
        await this.sendEveningNotification(user._id.toString())
      }, {
        timezone: 'Asia/Tokyo'
      })
      
      this.tasks.set(taskId, task)
      logger.info(`夜の通知をスケジュール: ユーザー ${user._id}, 時刻 ${timing.evening.time}`)
    }
  }

  // 朝の通知送信
  async sendMorningNotification(userId: string) {
    try {
      logger.info(`朝の通知送信開始: ユーザー ${userId}`)
      
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

          const messages = [
            {
              type: 'text' as const,
              text: `おはようございます、${elderly.name}さん！\n今日も元気にお過ごしですか？\n\n下の「元気です」ボタンを押して、ご家族に元気をお知らせください。`
            },
            {
              type: 'template' as const,
              altText: '元気確認ボタン',
              template: {
                type: 'buttons' as const,
                text: '本日の元気確認',
                actions: [
                  {
                    type: 'uri' as const,
                    label: '元気です！',
                    uri: responseUrl
                  }
                ]
              }
            }
          ]

          await sendLineMessage(elderly.lineUserId || '', messages)
          logger.info(`朝の通知送信成功: ${elderly.name}さん (${elderly._id})`)
          
        } catch (error) {
          logger.error(`朝の通知送信エラー: ${elderly.name}さん`, error)
        }
      }
      
    } catch (error) {
      logger.error(`朝の通知処理エラー: ユーザー ${userId}`, error)
    }
  }

  // 夜の通知送信
  async sendEveningNotification(userId: string) {
    try {
      logger.info(`夜の通知送信開始: ユーザー ${userId}`)
      
      // 今日の応答状況を確認
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const elderlyList = await Elderly.find({
        userId,
        status: 'active'
      })

      let respondedCount = 0
      let notRespondedCount = 0
      const notRespondedNames: string[] = []

      for (const elderly of elderlyList) {
        const todayResponse = await Response.findOne({
          elderlyId: elderly._id,
          createdAt: { $gte: today }
        })

        if (todayResponse) {
          respondedCount++
        } else {
          notRespondedCount++
          notRespondedNames.push(elderly.name)
        }
      }

      // 管理者（ユーザー）にサマリーを送信
      const user = await User.findById(userId)
      if (!user) return

      let summaryMessage = `本日の見守り結果\n\n`
      summaryMessage += `✅ 応答あり: ${respondedCount}名\n`
      
      if (notRespondedCount > 0) {
        summaryMessage += `❌ 応答なし: ${notRespondedCount}名\n`
        summaryMessage += `\n【応答がなかった方】\n`
        notRespondedNames.forEach(name => {
          summaryMessage += `・${name}さん\n`
        })
        summaryMessage += `\n応答がなかった方には、明日の朝に再度確認メッセージが送信されます。`
      } else {
        summaryMessage += `\n本日は全員から応答がありました！`
      }

      // TODO: 管理者へのLINE通知実装（管理者のLINE連携機能が必要）
      logger.info(`夜のサマリー: ${summaryMessage}`)
      
    } catch (error) {
      logger.error(`夜の通知処理エラー: ユーザー ${userId}`, error)
    }
  }

  // スケジュールの更新チェック
  private async checkAndUpdateSchedules() {
    try {
      // 通知設定が変更されたユーザーを再スケジュール
      const users = await User.find({
        $or: [
          { 'notificationSettings.timing.morning.enabled': true },
          { 'notificationSettings.timing.evening.enabled': true }
        ]
      }).select('_id notificationSettings updatedAt')

      for (const user of users) {
        // 既存のタスクと設定を比較して、変更があれば更新
        const morningTaskId = `${user._id}-morning`
        const eveningTaskId = `${user._id}-evening`
        
        const hasMorningTask = this.tasks.has(morningTaskId)
        const hasEveningTask = this.tasks.has(eveningTaskId)
        
        const shouldHaveMorning = user.notificationSettings?.timing?.morning?.enabled || false
        const shouldHaveEvening = user.notificationSettings?.timing?.evening?.enabled || false
        
        if (hasMorningTask !== shouldHaveMorning || hasEveningTask !== shouldHaveEvening) {
          await this.scheduleUserNotifications(user)
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