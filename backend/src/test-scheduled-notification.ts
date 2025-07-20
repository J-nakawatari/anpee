import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import scheduledNotificationService from './services/scheduledNotificationService.js'
import logger from './utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 環境変数を読み込み
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function testScheduledNotification() {
  try {
    // MongoDB接続
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined')
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('MongoDB connected for test')
    
    // 定時通知サービスを開始
    await scheduledNotificationService.start()
    logger.info('定時通知サービスのテストを開始しました')
    
    // 10秒後に停止
    setTimeout(() => {
      scheduledNotificationService.stopAll()
      logger.info('定時通知サービスを停止しました')
      mongoose.connection.close()
      process.exit(0)
    }, 10000)
    
  } catch (error) {
    logger.error('テストエラー:', error)
    process.exit(1)
  }
}

testScheduledNotification()