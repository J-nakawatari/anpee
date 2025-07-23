import express from 'express'
import {
  getElderlyList,
  getElderlyById,
  createElderly,
  updateElderly,
  deleteElderly,
  unlinkLine,
  getWeeklyResponses,
  getRecentResponses,
  getSafeDays,
} from '../controllers/elderlyController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// すべてのルートに認証を適用
router.use(authenticate)

// 家族一覧の取得
router.get('/', getElderlyList)

// 週間応答状況の取得
router.get('/weekly-responses', getWeeklyResponses)

// 最新の応答記録の取得
router.get('/recent-responses', getRecentResponses)

// 連続安全日数の取得
router.get('/safe-days', getSafeDays)

// 家族の詳細取得
router.get('/:id', getElderlyById)

// 家族の新規登録
router.post('/', createElderly)

// 家族情報の更新
router.put('/:id', updateElderly)

// 家族の削除
router.delete('/:id', deleteElderly)

// LINE連携解除
router.post('/:id/unlink-line', unlinkLine)

export default router