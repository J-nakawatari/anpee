import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import scheduledNotificationService from '../services/scheduledNotificationService.js'
import Elderly from '../models/Elderly.js'
import logger from '../utils/logger.js'

const router = Router()

// ヘルスチェック用エンドポイント（認証不要）
router.get('/health', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'Scheduled notification routes are working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    })
  }
})

// 手動で朝の通知を送信（管理者用）
router.post('/trigger/morning', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId
    logger.info('手動朝通知トリガー開始:', { userId })
    
    // デバッグ情報を追加：家族データの確認
    const elderlyList = await Elderly.find({
      userId,
      status: 'active',
      lineUserId: { $exists: true, $ne: null }
    })
    
    logger.info('デバッグ情報:', {
      userId,
      serviceExists: !!scheduledNotificationService,
      hasMethod: typeof (scheduledNotificationService as any).sendMorningNotification === 'function',
      elderlyCount: elderlyList.length,
      elderlyList: elderlyList.map(e => ({
        id: e._id,
        name: e.name,
        hasLineUserId: !!e.lineUserId
      }))
    })
    
    // scheduledNotificationServiceのプライベートメソッドを呼び出すために一時的な対応
    await (scheduledNotificationService as any).sendMorningNotification(userId)
    
    logger.info('朝の通知送信完了:', { userId })
    
    res.json({
      success: true,
      message: '朝の通知を送信しました'
    })
  } catch (error) {
    logger.error('朝の通知送信エラー:', error)
    res.status(500).json({
      success: false,
      message: '朝の通知の送信に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 手動で夜の通知を送信（管理者用）
router.post('/trigger/evening', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId
    logger.info('手動夜通知トリガー:', { userId })
    
    await (scheduledNotificationService as any).sendEveningNotification(userId)
    
    res.json({
      success: true,
      message: '夜の通知を送信しました'
    })
  } catch (error) {
    logger.error('夜の通知送信エラー:', error)
    res.status(500).json({
      success: false,
      message: '夜の通知の送信に失敗しました'
    })
  }
})

// スケジュール状態を取得
router.get('/status', authenticate, async (_req, res) => {
  try {
    const tasks = (scheduledNotificationService as any).tasks
    const status = {
      totalTasks: tasks.size,
      tasks: Array.from(tasks.keys())
    }
    
    res.json({
      success: true,
      ...status
    })
  } catch (error) {
    logger.error('スケジュール状態取得エラー:', error)
    res.status(500).json({
      success: false,
      message: 'スケジュール状態の取得に失敗しました'
    })
  }
})

export default router