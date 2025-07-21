import mongoose from 'mongoose'
import Response from '../models/Response.js'
import ResponseHistory from '../models/ResponseHistory.js'
import dotenv from 'dotenv'

dotenv.config()

async function cleanup() {
  try {
    // MongoDB接続
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anpee')
    console.log('MongoDB接続成功')

    // 既存データを削除
    const responseCount = await Response.countDocuments()
    const historyCount = await ResponseHistory.countDocuments()
    
    console.log(`削除対象:`)
    console.log(`- Response: ${responseCount}件`)
    console.log(`- ResponseHistory: ${historyCount}件`)
    
    // 確認メッセージ（本番では自動実行）
    console.log('\n削除を実行中...')
    
    await Response.deleteMany({})
    await ResponseHistory.deleteMany({})
    
    console.log('\n✅ 削除完了')
    
  } catch (error) {
    console.error('エラー:', error)
  } finally {
    await mongoose.connection.close()
  }
}

cleanup()