import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Elderly from '../models/Elderly.js'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 環境変数を読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') })

async function generateMissingRegistrationCodes() {
  try {
    // MongoDB接続
    await mongoose.connect(process.env.MONGODB_URI!)
    logger.info('MongoDBに接続しました')

    // 登録コードがない家族を検索
    const elderlyWithoutCode = await Elderly.find({ 
      registrationCode: { $exists: false } 
    })

    logger.info(`登録コードがない家族: ${elderlyWithoutCode.length}件`)

    // 各家族に登録コードを生成
    for (const elderly of elderlyWithoutCode) {
      await elderly.save() // pre saveフックが登録コードを生成
      logger.info(`登録コードを生成: ${elderly.name} - ${elderly.registrationCode}`)
    }

    logger.info('すべての登録コードの生成が完了しました')
  } catch (error) {
    logger.error('エラーが発生しました:', error)
  } finally {
    await mongoose.disconnect()
    logger.info('MongoDBとの接続を終了しました')
  }
}

// スクリプトを実行
generateMissingRegistrationCodes()