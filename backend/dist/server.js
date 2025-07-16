import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import csrf from 'csurf';
// 環境変数の読み込み
dotenv.config();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4003;
// ミドルウェア
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3003', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// CSRF保護
const csrfProtection = csrf({
    cookie: {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});
// CSRF保護を適用（開発環境では無効化可能）
if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_CSRF === 'true') {
    app.use(csrfProtection);
}
// ルート設定
app.use('/api/v1/auth', authRoutes);
// ヘルスチェック
app.get('/api/v1/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'anpee-backend'
    });
});
// CSRFトークン取得エンドポイント
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
    res.json({
        success: true,
        csrfToken: req.csrfToken()
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
        process.exit(1);
    }
};
// サーバー起動
const startServer = async () => {
    await connectDB();
    httpServer.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};
// グレースフルシャットダウン
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
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
