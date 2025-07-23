import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, notificationStream } from '../controllers/appNotificationController.js';
const router = express.Router();
// 認証が必要なルート
router.use(authenticate);
// 通知一覧を取得
router.get('/', getNotifications);
// SSEストリーム
router.get('/stream', notificationStream);
// 通知を既読にする
router.put('/:id/read', markAsRead);
// すべての通知を既読にする
router.put('/read-all', markAllAsRead);
// 通知を削除
router.delete('/:id', deleteNotification);
export default router;
