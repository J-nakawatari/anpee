import mongoose from 'mongoose'
import dotenv from 'dotenv'
import notificationServiceV2 from '../services/notificationServiceV2.js'
import logger from '../utils/logger.js'
import DailyNotification from '../models/DailyNotification.js'
import User from '../models/User.js'

// 環境変数を読み込む
dotenv.config()

async function testRetryWithNewNotification() {
  try {
    // MongoDBに接続
    await mongoose.connect(process.env.MONGODB_URI!)
    logger.info('MongoDBに接続しました')

    // ユーザーIDを指定（実際のユーザーIDに置き換える）
    const userId = '688061eb925585b7763c08a6'
    
    // ユーザー情報を取得
    const user = await User.findById(userId)
    if (!user) {
      console.error('ユーザーが見つかりません')
      return
    }
    
    console.log(`\n=== ユーザー情報 ===`)
    console.log(`名前: ${user.name}`)
    console.log(`メールアドレス: ${user.email}`)
    console.log(`再通知設定:`)
    console.log(`  最大再通知回数: ${user.notificationSettings?.retrySettings?.maxRetries}`)
    console.log(`  再通知間隔: ${user.notificationSettings?.retrySettings?.retryInterval}分`)

    // Step 1: 新しい通知を送信（これは応答しない）
    console.log('\n=== Step 1: 新しい通知を送信 ===')
    await notificationServiceV2.sendScheduledNotification(userId)
    console.log('通知を送信しました')

    // 5秒待機
    console.log('\n5秒待機します...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Step 2: 現在の状態を確認
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const latestRecord = await DailyNotification.findOne({
      userId,
      date: { $gte: today }
    }).sort({ 'notifications.sentAt': -1 })
    
    if (latestRecord) {
      console.log(`\n=== 最新レコードの状態 ===`)
      console.log(`応答: ${latestRecord.response ? 'あり' : 'なし'}`)
      console.log(`通知数: ${latestRecord.notifications.length}`)
      
      const lastNotification = latestRecord.notifications[latestRecord.notifications.length - 1]
      console.log(`最後の通知: タイプ=${lastNotification.type}, 送信時刻=${lastNotification.sentAt.toLocaleString('ja-JP')}`)
    }

    // Step 3: 再通知チェックを実行（まだ30分経過していないので、再通知されないはず）
    console.log('\n=== Step 3: 再通知チェックを実行（時間経過前） ===')
    await notificationServiceV2.checkAndSendRetryNotifications()
    
    // Step 4: 最後の通知時刻を30分前に変更して、再通知を強制的にトリガー
    console.log('\n=== Step 4: 最後の通知時刻を30分前に変更 ===')
    if (latestRecord && !latestRecord.response) {
      const lastNotification = latestRecord.notifications[latestRecord.notifications.length - 1]
      lastNotification.sentAt = new Date(Date.now() - 31 * 60 * 1000) // 31分前に設定
      await latestRecord.save()
      console.log('通知時刻を更新しました')
    }

    // Step 5: 再度再通知チェックを実行（今度は再通知されるはず）
    console.log('\n=== Step 5: 再通知チェックを実行（時間経過後） ===')
    await notificationServiceV2.checkAndSendRetryNotifications()
    
    // 最終状態を確認
    const finalRecord = await DailyNotification.findOne({
      userId,
      date: { $gte: today }
    }).sort({ 'notifications.sentAt': -1 })
    
    if (finalRecord) {
      console.log(`\n=== 最終状態 ===`)
      console.log(`応答: ${finalRecord.response ? 'あり' : 'なし'}`)
      console.log(`通知数: ${finalRecord.notifications.length}`)
      
      // 通知詳細
      finalRecord.notifications.slice(-5).forEach((notif, index) => {
        console.log(`  通知${index + 1}: タイプ=${notif.type}, 送信時刻=${notif.sentAt.toLocaleString('ja-JP')}`)
      })
    }
    
    console.log('\n完了しました')
    
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await mongoose.connection.close()
  }
}

// スクリプトを実行
testRetryWithNewNotification()