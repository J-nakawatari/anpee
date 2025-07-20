import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notificationController.js';
const router = Router();
// 通知テスト送信エンドポイント
router.post('/test/line', authenticate, notificationController.testLineNotification);
router.post('/test/email', authenticate, notificationController.testEmailNotification);
router.post('/test/phone', authenticate, notificationController.testPhoneNotification);
// 通知設定取得・更新
router.get('/settings', authenticate, notificationController.getNotificationSettings);
router.put('/settings', authenticate, notificationController.updateNotificationSettings);
export default router;
