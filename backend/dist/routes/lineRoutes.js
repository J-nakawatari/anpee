import { Router } from 'express';
import { validateSignature, handleWebhook } from '../services/lineService.js';
const router = Router();
// LINE Webhook エンドポイント
router.post('/webhook', async (req, res) => {
    try {
        // 署名検証
        const signature = req.headers['x-line-signature'];
        if (!signature) {
            return res.status(400).json({ error: 'No signature' });
        }
        // リクエストボディを文字列として取得
        const body = JSON.stringify(req.body);
        // 署名を検証
        if (!validateSignature(body, signature)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        // Webhookイベントを処理
        const webhookBody = req.body;
        await handleWebhook(webhookBody.events);
        // LINEプラットフォームに200を返す
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        // エラーが発生しても200を返す（LINEの仕様）
        res.status(200).json({ success: false });
    }
});
// Webhook URL確認用（開発用）
router.get('/webhook', (req, res) => {
    res.json({
        message: 'LINE Webhook endpoint is working',
        timestamp: new Date().toISOString()
    });
});
export default router;
