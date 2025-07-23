import mongoose from 'mongoose'
import dotenv from 'dotenv'
import notificationServiceV2 from '../services/notificationServiceV2.js'
import logger from '../utils/logger.js'
import DailyNotification from '../models/DailyNotification.js'
import User from '../models/User.js'

// 環境変数を読み込む
dotenv.config()

async function testRetryNotifications() {
  try {
    // MongoDBに接続
    await mongoose.connect(process.env.MONGODB_URI!)
    logger.info('MongoDBに接続しました')

    // 今日の日付を取得
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 今日の全レコードを確認
    const allTodayRecords = await DailyNotification.find({
      date: { $gte: today }
    }).populate('userId elderlyId')
    
    console.log(`\n=== 今日の全レコード: ${allTodayRecords.length}件 ===`)
    
    for (const record of allTodayRecords) {
      const user = await User.findById(record.userId)
      const elderly = record.elderlyId as any
      
      console.log(`\n--- レコード詳細 ---`)
      console.log(`家族名: ${elderly?.name || 'Unknown'}`)
      console.log(`ユーザーID: ${record.userId}`)
      console.log(`応答: ${record.response ? 'あり' : 'なし'}`)
      console.log(`管理者通知: ${record.adminNotifiedAt ? record.adminNotifiedAt.toLocaleString('ja-JP') : 'なし'}`)
      console.log(`通知数: ${record.notifications.length}`)
      
      // 通知詳細
      record.notifications.forEach((notif, index) => {
        console.log(`  通知${index + 1}: タイプ=${notif.type}, 送信時刻=${notif.sentAt.toLocaleString('ja-JP')}`)
      })
      
      // ユーザー設定
      if (user?.notificationSettings?.retrySettings) {
        console.log(`\nユーザー設定:`)
        console.log(`  最大再通知回数: ${user.notificationSettings.retrySettings.maxRetries}`)
        console.log(`  再通知間隔: ${user.notificationSettings.retrySettings.retryInterval}分`)
      }
      
      // 最後の通知からの経過時間を計算
      if (record.notifications.length > 0) {
        const lastNotification = record.notifications[record.notifications.length - 1]
        const minutesSinceLastNotification = Math.floor(
          (Date.now() - lastNotification.sentAt.getTime()) / (1000 * 60)
        )
        console.log(`\n最後の通知からの経過時間: ${minutesSinceLastNotification}分`)
        
        // 再通知が必要かチェック
        const retryCount = record.notifications.filter(n => n.type.startsWith('retry')).length
        const retrySettings = user?.notificationSettings?.retrySettings
        
        if (retrySettings && !record.response && !record.adminNotifiedAt) {
          if (minutesSinceLastNotification >= retrySettings.retryInterval) {
            if (retryCount < retrySettings.maxRetries) {
              console.log(`→ 再通知が必要です (retry${retryCount + 1})`)
            } else if (minutesSinceLastNotification >= 30) {
              console.log(`→ 管理者通知が必要です`)
            }
          } else {
            console.log(`→ 再通知まであと${retrySettings.retryInterval - minutesSinceLastNotification}分`)
          }
        }
      }
    }

    // 実際に再通知チェックを実行
    console.log('\n=== 再通知チェックを実行します ===')
    await notificationServiceV2.checkAndSendRetryNotifications()
    
    console.log('\n完了しました')
    
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await mongoose.connection.close()
  }
}

// スクリプトを実行
testRetryNotifications()