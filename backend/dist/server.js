import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import elderlyRoutes from './routes/elderly.js';
import lineRoutes from './routes/lineRoutes.js';
import responseRoutes from './routes/responseRoutesV2.js'; // V2に変更
import notificationRoutes from './routes/notificationRoutes.js';
import scheduledNotificationRoutes from './routes/scheduledNotificationRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import stripeWebhookRoutes from './routes/stripeWebhook.js';
import userRoutes from './routes/users.js';
import appNotificationRoutes from './routes/appNotifications.js';
import scheduledNotificationServiceV2 from './services/scheduledNotificationServiceV2.js'; // V2に変更
import dailySummaryService from './services/dailySummaryService.js';
import csrf from 'csurf'; // TODO: csurfは非推奨。将来的に別のCSRF対策ライブラリへの移行を検討
// 環境変数の読み込み
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const result = dotenv.config({
    path: path.resolve(__dirname, '../.env')
});
if (result.error) {
    logger.error('Error loading .env file:', result.error);
}
else {
    logger.info(`Loaded ${Object.keys(result.parsed || {}).length} environment variables`);
}
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4003;
// ミドルウェア
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://anpee.jp', process.env.FRONTEND_URL].filter((url) => !!url)
        : ['http://localhost:3003', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token', 'X-CSRF-Token']
}));
// Webhook用の条件付きミドルウェア設定
app.use((req, res, next) => {
    // LINE WebhookとStripe Webhookは生のボディが必要
    if (req.path === '/api/v1/line/webhook' || req.path === '/webhook/stripe') {
        express.raw({ type: 'application/json' })(req, res, next);
    }
    else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// CSRF保護
const csrfProtection = csrf({
    cookie: {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    }
});
// CSRFトークン取得エンドポイント（CSRF保護の前に定義）
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
    res.json({
        success: true,
        csrfToken: req.csrfToken()
    });
});
// CSRF保護を適用（開発環境では無効化可能）
const enableCsrf = process.env.ENABLE_CSRF === 'true';
if (enableCsrf && (process.env.NODE_ENV === 'production' || process.env.ENABLE_CSRF === 'true')) {
    // CSRFトークンエンドポイントとWebhookは除外
    app.use((req, res, next) => {
        if (req.path === '/api/v1/csrf-token' ||
            req.path === '/api/v1/line/webhook' ||
            req.path === '/api/v1/webhook/stripe' ||
            req.path === '/webhook/stripe' ||
            req.path.startsWith('/api/v1/test/')) {
            return next();
        }
        csrfProtection(req, res, next);
    });
}
// CSRF設定のログ出力
logger.info(`CSRF protection: ${enableCsrf ? 'enabled' : 'disabled'}`);
logger.info(`Environment: ${process.env.NODE_ENV}`);
logger.info(`CORS origin: ${process.env.NODE_ENV === 'production' ? 'https://anpee.jp' : 'localhost'}`);
// ルート設定
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/elderly', elderlyRoutes);
app.use('/api/v1/line', lineRoutes);
app.use('/api/v1/responses', responseRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/scheduled-notifications', scheduledNotificationRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/app-notifications', appNotificationRoutes);
// Stripe Webhook
app.use('/api/v1/webhook', stripeWebhookRoutes);
// Stripe Webhook用の特別なルート（charactier-ai.com用）
app.use('/webhook', stripeWebhookRoutes);
// ヘルスチェック
app.get('/api/v1/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'anpee-backend'
    });
});
// MongoDB接続
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('MongoDB connected successfully');
    }
    catch (error) {
        logger.error('MongoDB connection error:', error);
        logger.warn('サーバーはMongoDB接続なしで起動します（一部機能が制限されます）');
        // process.exit(1) をコメントアウトして、DBなしでもサーバーを起動
    }
};
// サーバー起動
const startServer = async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        // 定時通知サービスを開始
        scheduledNotificationServiceV2.start().catch(error => {
            logger.error('定時通知サービスV2の開始に失敗しました:', error);
        });
        // 再通知サービスはV2に統合されたため削除
        // 日次サマリーサービスを開始
        dailySummaryService.start().catch(error => {
            logger.error('日次サマリーサービスの開始に失敗しました:', error);
        });
    });
};
// グレースフルシャットダウン
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    // 定時通知サービスV2を停止
    scheduledNotificationServiceV2.stopAll();
    // 日次サマリーサービスを停止
    dailySummaryService.stop();
    httpServer.close(async () => {
        logger.info('HTTP server closed');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        process.exit(0);
    });
});
startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});
