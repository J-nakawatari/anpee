import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import User from '../models/User.js'
import LoginHistory from '../models/LoginHistory.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import emailService from '../services/emailService.js'
import logger from '../utils/logger.js'

// ユーザープロフィール取得
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }

    // 最終ログイン日時を取得
    const lastLogin = await LoginHistory.findOne({ userId })
      .sort({ createdAt: -1 })
      .limit(1)

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: lastLogin?.createdAt || user.createdAt,
        currentPlan: user.currentPlan,
        subscriptionStatus: user.subscriptionStatus
      }
    })
  } catch (error) {
    logger.error('ユーザープロフィール取得エラー:', error)
    res.status(500).json({
      success: false,
      message: 'プロフィールの取得に失敗しました'
    })
  }
}

// ユーザープロフィール更新（電話番号のみ）
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { phone } = req.body

    // 電話番号のバリデーション
    if (phone && !/^[0-9-]+$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '有効な電話番号を入力してください'
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { phone },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }

    res.json({
      success: true,
      message: 'プロフィールを更新しました',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    })
  } catch (error) {
    logger.error('ユーザープロフィール更新エラー:', error)
    res.status(500).json({
      success: false,
      message: 'プロフィールの更新に失敗しました'
    })
  }
}

// メールアドレス変更リクエスト
export const requestEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { newEmail } = req.body

    // メールアドレスのバリデーション
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: '有効なメールアドレスを入力してください'
      })
    }

    // 既存のメールアドレスチェック
    const existingUser = await User.findOne({ email: newEmail })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に使用されています'
      })
    }

    // トークン生成
    const token = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // ユーザーに一時的にトークンを保存
    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: hashedToken,
      pendingEmail: newEmail,
      emailVerificationExpires: new Date(Date.now() + 60 * 60 * 1000) // 1時間有効
    })

    // 確認メール送信
    const user = await User.findById(userId)
    if (user) {
      await emailService.sendEmailChangeVerification(
        newEmail,
        user.name,
        `${process.env.FRONTEND_URL}/verify-email?token=${token}`
      )
    }

    res.json({
      success: true,
      message: '確認メールを送信しました。メールをご確認ください。'
    })
  } catch (error) {
    logger.error('メールアドレス変更リクエストエラー:', error)
    res.status(500).json({
      success: false,
      message: 'メールアドレス変更の処理に失敗しました'
    })
  }
}

// メールアドレス変更確認
export const verifyEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'トークンが必要です'
      })
    }

    // トークンをハッシュ化
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // トークンでユーザーを検索
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user || !user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: '無効または期限切れのトークンです'
      })
    }

    // メールアドレスを更新
    user.email = user.pendingEmail
    user.emailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    user.pendingEmail = undefined
    await user.save()

    res.json({
      success: true,
      message: 'メールアドレスを変更しました'
    })
  } catch (error) {
    logger.error('メールアドレス変更確認エラー:', error)
    res.status(500).json({
      success: false,
      message: 'メールアドレス変更の確認に失敗しました'
    })
  }
}

// パスワード変更
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { currentPassword, newPassword } = req.body

    // バリデーション
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'すべての項目を入力してください'
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは8文字以上で設定してください'
      })
    }

    // パスワードの複雑さチェック
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは大文字・小文字・数字を含む必要があります'
      })
    }

    // ユーザー取得
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }

    // 現在のパスワード確認
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '現在のパスワードが正しくありません'
      })
    }

    // 新しいパスワードをハッシュ化して保存
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    // パスワード変更をログに記録
    await LoginHistory.create({
      userId,
      action: 'password_change',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || ''
    })

    res.json({
      success: true,
      message: 'パスワードを変更しました'
    })
  } catch (error) {
    logger.error('パスワード変更エラー:', error)
    res.status(500).json({
      success: false,
      message: 'パスワードの変更に失敗しました'
    })
  }
}

// ログイン履歴取得
export const getLoginHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const limit = parseInt(req.query.limit as string) || 10

    const history = await LoginHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)

    res.json({
      success: true,
      data: history.map(log => ({
        id: log._id,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.createdAt
      }))
    })
  } catch (error) {
    logger.error('ログイン履歴取得エラー:', error)
    res.status(500).json({
      success: false,
      message: 'ログイン履歴の取得に失敗しました'
    })
  }
}

// アカウント削除
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'パスワードが必要です'
      })
    }

    // ユーザー取得
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }

    // パスワード確認
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'パスワードが正しくありません'
      })
    }

    // 関連データの削除
    const Elderly = (await import('../models/Elderly.js')).default
    const DailyNotification = (await import('../models/DailyNotification.js')).default
    const ResponseHistory = (await import('../models/ResponseHistory.js')).default

    // トランザクション的に削除
    await Promise.all([
      // 家族情報削除
      Elderly.deleteMany({ userId }),
      // 通知履歴削除
      DailyNotification.deleteMany({ userId }),
      // 応答履歴削除（家族経由）
      (async () => {
        const elderlyIds = await Elderly.find({ userId }).select('_id')
        await ResponseHistory.deleteMany({ 
          elderlyId: { $in: elderlyIds.map(e => e._id) } 
        })
      })(),
      // ログイン履歴削除
      LoginHistory.deleteMany({ userId }),
      // ユーザー削除
      User.findByIdAndDelete(userId)
    ])

    res.json({
      success: true,
      message: 'アカウントを削除しました'
    })
  } catch (error) {
    logger.error('アカウント削除エラー:', error)
    res.status(500).json({
      success: false,
      message: 'アカウントの削除に失敗しました'
    })
  }
}