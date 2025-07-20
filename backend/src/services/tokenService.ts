import crypto from 'crypto'
import Response from '../models/Response.js'
import logger from '../utils/logger.js'

// 応答用トークン生成
export async function generateResponseToken(elderlyId: string): Promise<string> {
  try {
    // ランダムなトークンを生成
    const token = crypto.randomBytes(32).toString('hex')
    
    // 既存の未使用トークンを無効化
    await Response.updateMany(
      { elderlyId, status: 'pending' },
      { status: 'expired' }
    )
    
    // 新しい応答レコードを作成
    await Response.create({
      elderlyId,
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
    })
    
    return token
  } catch (error) {
    logger.error('トークン生成エラー:', error)
    throw error
  }
}

// トークン検証
export async function validateResponseToken(token: string): Promise<{ elderlyId: string } | null> {
  try {
    const response = await Response.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
    
    if (!response) {
      return null
    }
    
    return { elderlyId: response.elderlyId.toString() }
  } catch (error) {
    logger.error('トークン検証エラー:', error)
    return null
  }
}