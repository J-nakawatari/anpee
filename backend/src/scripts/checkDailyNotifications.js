import mongoose from 'mongoose'
import dotenv from 'dotenv'
import DailyNotification from '../models/DailyNotification.js'
import User from '../models/User.js'
import Elderly from '../models/Elderly.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 環境変数を読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') })

async function checkDailyNotifications() {
  try {
    // MongoDB接続
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDBに接続しました')

    // 今日の日付を取得（0時0分0秒）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    console.log(`本日の日付: ${today.toLocaleString('ja-JP')}`)

    // 本日のすべてのDailyNotificationレコードを取得
    const todayRecords = await DailyNotification.find({
      date: { $gte: today }
    }).populate('elderlyId userId')

    console.log(`\n=== 本日のDailyNotificationレコード: ${todayRecords.length}件 ===`)

    for (const record of todayRecords) {
      const elderly = record.elderlyId
      const user = record.userId
      
      console.log(`\n--- レコード詳細 ---`)
      console.log(`ID: ${record._id}`)
      console.log(`家族名: ${elderly?.name || 'N/A'}`)
      console.log(`ユーザー名: ${user?.name || 'N/A'}`)
      console.log(`作成日時: ${record.createdAt.toLocaleString('ja-JP')}`)
      console.log(`更新日時: ${record.updatedAt.toLocaleString('ja-JP')}`)
      
      // responseフィールドの状態を詳しく確認
      console.log(`\nresponseフィールドの詳細:`)
      console.log(`- typeof response: ${typeof record.response}`)
      console.log(`- response === null: ${record.response === null}`)
      console.log(`- response === undefined: ${record.response === undefined}`)
      console.log(`- response存在チェック: ${record.response ? 'あり' : 'なし'}`)
      
      if (record.response) {
        console.log(`- 応答日時: ${record.response.respondedAt.toLocaleString('ja-JP')}`)
        console.log(`- 応答トークン: ${record.response.respondedToken}`)
      }
      
      console.log(`\n通知履歴:`)
      for (const notification of record.notifications) {
        console.log(`  - タイプ: ${notification.type}`)
        console.log(`    送信日時: ${notification.sentAt.toLocaleString('ja-JP')}`)
        console.log(`    トークン: ${notification.token}`)
        console.log(`    有効期限: ${notification.tokenExpiresAt.toLocaleString('ja-JP')}`)
      }
      
      console.log(`\n管理者通知: ${record.adminNotifiedAt ? record.adminNotifiedAt.toLocaleString('ja-JP') : 'なし'}`)
      console.log(`現在のステータス: ${record.currentStatus}`)
      console.log(`再通知回数: ${record.retryCount}`)
    }

    // 未応答レコードの検索テスト
    console.log(`\n=== 未応答レコードの検索テスト ===`)
    
    // パターン1: response が存在しない
    const pattern1 = await DailyNotification.find({
      date: { $gte: today },
      response: { $exists: false }
    })
    console.log(`パターン1 (response: {$exists: false}): ${pattern1.length}件`)
    
    // パターン2: response が null
    const pattern2 = await DailyNotification.find({
      date: { $gte: today },
      response: null
    })
    console.log(`パターン2 (response: null): ${pattern2.length}件`)
    
    // パターン3: response が undefined（MongoDBでは通常nullとして保存される）
    const pattern3 = await DailyNotification.find({
      date: { $gte: today },
      response: undefined
    })
    console.log(`パターン3 (response: undefined): ${pattern3.length}件`)

    // ユーザーの通知設定を確認
    console.log(`\n=== ユーザーの通知設定 ===`)
    const users = await User.find({ 'notificationSettings.timing.morning.enabled': true })
    
    for (const user of users) {
      console.log(`\n--- ユーザー: ${user.name} ---`)
      console.log(`通知時刻: ${user.notificationSettings?.timing?.morning?.time || 'N/A'}`)
      console.log(`再通知設定:`)
      console.log(`- 最大回数: ${user.notificationSettings?.retrySettings?.maxRetries || 0}`)
      console.log(`- 間隔: ${user.notificationSettings?.retrySettings?.retryInterval || 0}分`)
      console.log(`メール通知: ${user.notificationSettings?.methods?.email?.enabled ? 'ON' : 'OFF'}`)
    }

  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nMongoDBから切断しました')
  }
}

checkDailyNotifications()