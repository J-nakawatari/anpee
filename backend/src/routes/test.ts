import { Router, Request, Response } from 'express';
import emailService from '../services/emailService.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * テストメール送信
 * 開発・検証用のエンドポイント
 */
router.post('/send-test-email', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: '送信先メールアドレスが必要です'
      });
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '有効なメールアドレスを入力してください'
      });
    }

    await emailService.sendTestEmail(email);

    res.json({
      success: true,
      message: `テストメールを ${email} に送信しました`
    });
  } catch (error) {
    logger.error('テストメール送信エラー:', error);
    res.status(500).json({
      success: false,
      message: 'メール送信に失敗しました'
    });
  }
});

/**
 * ヘルスチェック
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;