import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { sseAuthenticate } from '../middleware/sseAuth.js';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, notificationStream } from '../controllers/appNotificationController.js';
const router = express.Router();
// 通知一覧を取得（通常の認証）
router.get('/', authenticate, getNotifications);
// SSEストリーム（クエリパラメータからの認証）
router.get('/stream', sseAuthenticate, notificationStream);
// 通知を既読にする（通常の認証）
router.put('/:id/read', authenticate, markAsRead);
// すべての通知を既読にする（通常の認証）
router.put('/read-all', authenticate, markAllAsRead);
// 通知を削除（通常の認証）
router.delete('/:id', authenticate, deleteNotification);
export default router;
