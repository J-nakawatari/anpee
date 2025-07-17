import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import logger from './utils/logger.js'
import authRoutes from './routes/auth.js'
import testRoutes from './routes/test.js'
import elderlyRoutes from './routes/elderly.js'
import csrf from 'csurf' // TODO: csurfは非推奨。将来的に別のCSRF対策ライブラリへの移行を検討

// 環境変数の読み込み
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const result = dotenv.config({ 
  path: path.resolve(__dirname, '../.env') 
})

if (result.error) {
  logger.error('Error loading .env file:', result.error)
} else {
  logger.info(`Loaded ${Object.keys(result.parsed || {}).length} environment variables`)
}

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 4003

// ミドルウェア
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://anpee.jp', process.env.FRONTEND_URL].filter((url): url is string => !!url)
    : ['http://localhost:3003', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token', 'X-CSRF-Token']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// CSRF保護
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  } 
})

// CSRFトークン取得エンドポイント（CSRF保護の前に定義）
app.get('/api/v1/csrf-token', csrfProtection, (req: any, res) => {
  res.json({ 
    success: true,
    csrfToken: req.csrfToken()
  })
})

// CSRF保護を適用（開発環境では無効化可能）
const enableCsrf = process.env.ENABLE_CSRF === 'true';
if (enableCsrf && (process.env.NODE_ENV === 'production' || process.env.ENABLE_CSRF === 'true')) {
  // CSRFトークンエンドポイント以外に適用
  app.use((req, res, next) => {
    if (req.path === '/api/v1/csrf-token') {
      return next();
    }
    csrfProtection(req, res, next);
  });
}

// CSRF設定のログ出力
logger.info(`CSRF protection: ${enableCsrf ? 'enabled' : 'disabled'}`);
logger.info(`Environment: ${process.env.NODE_ENV}`);
logger.info(`CORS origin: ${process.env.NODE_ENV === 'production' ? 'https://anpee.jp' : 'localhost'}`)

// ルート設定
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/test', testRoutes)
app.use('/api/v1/elderly', elderlyRoutes)

// ヘルスチェック
app.get('/api/v1/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'anpee-backend'
  })
})

// MongoDB接続
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined')
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    logger.info('MongoDB connected successfully')
  } catch (error) {
    logger.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// サーバー起動
const startServer = async () => {
  await connectDB()
  
  httpServer.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  httpServer.close(async () => {
    logger.info('HTTP server closed')
    await mongoose.connection.close()
    logger.info('MongoDB connection closed')
    process.exit(0)
  })
})

startServer().catch((error) => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})