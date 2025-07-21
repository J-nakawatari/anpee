import * as cron from 'node-cron'
import User from '../models/User.js'
import notificationServiceV2 from './notificationServiceV2.js'
import logger from '../utils/logger.js'

class ScheduledNotificationServiceV2 {
  private tasks: Map<string, cron.ScheduledTask> = new Map()
  private retryCheckTask: cron.ScheduledTask | null = null

  // サービス開始
  async start() {
    logger.info('定時通知サービスV2を開始します')
    
    // 既存のタスクをすべて停止
    this.stopAll()
    
    // すべてのユーザーの通知設定を読み込んでスケジュール設定
    await this.scheduleAllUsers()
    
    // 1分ごとに再通知をチェック
    this.retryCheckTask = cron.schedule('* * * * *', async () => {
      try {
        await notificationServiceV2.checkAndSendRetryNotifications()
      } catch (error) {
        logger.error('再通知チェックエラー:', error)
      }
    }, {
      timezone: 'Asia/Tokyo'
    })
    
    // 1分ごとに設定変更をチェック
    cron.schedule('* * * * *', async () => {
      await this.checkAndUpdateSchedules()
    }, {
      timezone: 'Asia/Tokyo'
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
      }
      
      logger.info(`${users.length}人のユーザーの通知をスケジュールしました`)
    } catch (error) {
      logger.error('通知スケジュール設定エラー:', error)
    }
  }

  // 特定ユーザーの通知をスケジュール
  private async scheduleUserNotifications(user: any) {
    const { timing } = user.notificationSettings || {}
    
    if (timing?.morning?.enabled && timing.morning.time) {
      const [hour, minute] = timing.morning.time.split(':')
      const cronExpression = `${minute} ${hour} * * *`
      
      const taskId = `${user._id}-morning`
      this.cancelTask(taskId)
      
      const task = cron.schedule(cronExpression, async () => {
        await notificationServiceV2.sendScheduledNotification(user._id.toString())
      }, {
        timezone: 'Asia/Tokyo'
      })
      
      this.tasks.set(taskId, task)
      logger.info(`通知をスケジュール: ユーザー ${user._id}, 時刻 ${timing.morning.time}`)
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

  // スケジュールの更新チェック
  private async checkAndUpdateSchedules() {
    try {
      const users = await User.find({
        'notificationSettings.timing.morning.enabled': true
      }).select('_id notificationSettings updatedAt')

      for (const user of users) {
        await this.scheduleUserNotifications(user)
      }
    } catch (error) {
      logger.error('スケジュール更新チェックエラー:', error)
    }
  }

  // サービス停止
  stopAll() {
    // 定時通知タスクを停止
    this.tasks.forEach(task => task.stop())
    this.tasks.clear()
    
    // 再通知チェックタスクを停止
    if (this.retryCheckTask) {
      this.retryCheckTask.stop()
      this.retryCheckTask = null
    }
    
    logger.info('定時通知サービスV2を停止しました')
  }
}

export default new ScheduledNotificationServiceV2()