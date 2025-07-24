import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
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


// スケジュール状態を取得
router.get('/status', authenticate, async (_req, res) => {
  try {
    // V2ではスケジュール管理がscheduledNotificationServiceV2に移動
    res.json({
      success: true,
      message: 'Notification service is running'
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