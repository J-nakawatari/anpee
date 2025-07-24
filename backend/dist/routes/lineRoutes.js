import { Router } from 'express';
import express from 'express';
import { validateSignature, handleWebhook } from '../services/lineService.js';
const router = Router();
// LINE Webhook エンドポイント - 生のボディを処理
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
    console.log('LINE Webhook受信 - Headers:', req.headers);
    console.log('LINE Webhook受信 - Body Type:', typeof req.body);
    console.log('LINE Webhook受信 - Body is Buffer:', Buffer.isBuffer(req.body));
    try {
        // 署名検証
        const signature = req.headers['x-line-signature'];
        if (!signature) {
            console.error('署名がありません');
            return res.status(400).json({ error: 'No signature' });
        }
        // リクエストボディを文字列として取得
        let body;
        if (Buffer.isBuffer(req.body)) {
            body = req.body.toString('utf8');
        }
        else if (typeof req.body === 'string') {
            body = req.body;
        }
        else {
            body = JSON.stringify(req.body);
        }
        console.log('LINE Webhook受信 - Raw Body:', body);
        // 署名を検証
        if (!validateSignature(body, signature)) {
            console.error('署名が無効です');
            return res.status(401).json({ error: 'Invalid signature' });
        }
        console.log('署名検証成功');
        // Webhookイベントを処理
        const webhookBody = JSON.parse(body);
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
