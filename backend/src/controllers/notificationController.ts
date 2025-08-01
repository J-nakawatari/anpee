import { Request, Response } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import User from '../models/User.js'
import Elderly from '../models/Elderly.js'
import { sendLineMessage } from '../services/lineService.js'
import emailService from '../services/emailService.js'
import { makePhoneCall } from '../services/twilioService.js'
import logger from '../utils/logger.js'

// LINE通知テスト送信
export const testLineNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    logger.info('LINE test notification request', { userId });

    // デバッグ用：すべての家族データを確認
    const allElderly = await Elderly.find({ userId });
    logger.info('All elderly for user', { 
      userId, 
      count: allElderly.length,
      elderly: allElderly.map(e => ({ 
        id: e._id, 
        name: e.name, 
        status: e.status,
        lineUserId: e.lineUserId,
        hasLineUserId: !!e.lineUserId
      }))
    });

    // ユーザーの家族情報を取得
    const elderlyList = await Elderly.find({ 
      userId, 
      status: 'active',
      lineUserId: { $exists: true, $ne: null }
    })

    logger.info('Found elderly for LINE test', { 
      userId, 
      count: elderlyList.length,
      elderly: elderlyList.map(e => ({ id: e._id, name: e.name, lineUserId: e.lineUserId }))
    });

    if (elderlyList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'LINE連携済みの家族が見つかりません'
      })
    }

    const testMessage = {
      type: 'text' as const,
      text: `【テスト通知】\nこれはテスト通知です。\n\n通知設定が正常に機能しています。\n実際の安否確認メッセージもこのように届きます。`
    }

    // 各家族にテストメッセージを送信
    const results = await Promise.allSettled(
      elderlyList.map(elderly => 
        sendLineMessage(elderly.lineUserId!, [testMessage])
      )
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length

    if (failCount > 0) {
      logger.error('LINE test notification failed for some users', { 
        userId, 
        successCount, 
        failCount 
      })
    }

    res.json({
      success: true,
      message: `${successCount}名の家族にテスト通知を送信しました`,
      details: {
        sent: successCount,
        failed: failCount,
        total: elderlyList.length
      }
    })
  } catch (error) {
    logger.error('LINE test notification error:', error)
    res.status(500).json({
      success: false,
      message: 'テスト通知の送信に失敗しました'
    })
  }
}

// メール通知テスト送信
export const testEmailNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const user = await User.findById(userId)

    if (!user || !user.notificationSettings?.methods?.email?.enabled || !user.notificationSettings.methods.email.address) {
      return res.status(400).json({
        success: false,
        message: 'メール通知が設定されていません'
      })
    }

    const emailAddress = user.notificationSettings.methods.email.address

    await emailService.sendDirectEmail({
      to: emailAddress,
      subject: '【あんぴーちゃん】テスト通知',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">テスト通知</h2>
          <p>これはテスト通知です。</p>
          <p>通知設定が正常に機能しています。</p>
          <p>実際の安否確認通知もこのメールアドレスに届きます。</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            このメールは「あんぴーちゃん」から送信されています。<br>
            心当たりがない場合は、このメールを削除してください。
          </p>
        </div>
      `
    })

    res.json({
      success: true,
      message: 'テストメールを送信しました'
    })
  } catch (error) {
    logger.error('Email test notification error:', error)
    res.status(500).json({
      success: false,
      message: 'テストメールの送信に失敗しました'
    })
  }
}

// 電話通知テスト送信
export const testPhoneNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId

    // ユーザーの家族情報を取得（電話番号が登録されているもののみ）
    const elderlyList = await Elderly.find({ 
      userId, 
      status: 'active',
      phone: { $exists: true, $ne: null }
    })

    if (elderlyList.length === 0) {
      return res.status(400).json({
        success: false,
        message: '電話番号が登録されている家族が見つかりません'
      })
    }

    // テスト用のTwiMLメッセージ
    const testMessage = 'こちらは、あんぴーちゃんからのテスト電話です。通知設定が正常に機能しています。'

    // 各家族に電話をかける
    const results = await Promise.allSettled(
      elderlyList.map(elderly => 
        makePhoneCall(elderly.phone!, testMessage)
      )
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length

    if (failCount > 0) {
      logger.error('Phone test notification failed for some users', { 
        userId, 
        successCount, 
        failCount 
      })
    }

    res.json({
      success: true,
      message: `${successCount}名の家族にテスト電話を発信しました`,
      details: {
        sent: successCount,
        failed: failCount,
        total: elderlyList.length
      }
    })
  } catch (error) {
    logger.error('Phone test notification error:', error)
    res.status(500).json({
      success: false,
      message: 'テスト電話の発信に失敗しました'
    })
  }
}

// 通知設定取得
export const getNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const user = await User.findById(userId).select('notificationSettings')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }

    res.json({
      success: true,
      settings: user.notificationSettings || {
        methods: {
          line: { enabled: true },
          email: { enabled: false, address: '' },
          phone: { enabled: false }
        },
        timing: {
          morning: { enabled: true, time: '08:00' },
          evening: { enabled: false, time: '20:00' }
        },
        retrySettings: {
          maxRetries: 3,
          retryInterval: 30
        }
      }
    })
  } catch (error) {
    logger.error('Get notification settings error:', error)
    res.status(500).json({
      success: false,
      message: '通知設定の取得に失敗しました'
    })
  }
}

// 通知設定更新
export const updateNotificationSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const { settings } = req.body
    
    // 現在の設定を取得して時間変更をチェック
    const currentUser = await User.findById(userId).select('notificationSettings')
    const oldSettings = currentUser?.notificationSettings
    
    const timeChanged = oldSettings?.timing?.morning?.time !== settings.timing?.morning?.time ||
                       oldSettings?.timing?.evening?.time !== settings.timing?.evening?.time
    
    // 通知時間が変更された場合の処理
    if (timeChanged) {
      const DailyNotification = (await import('../models/DailyNotification.js')).default
      const Elderly = (await import('../models/Elderly.js')).default
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 本日の通知設定をリセット（応答済みは維持）
      await DailyNotification.updateMany(
        {
          userId: userId,
          date: { $gte: today },
          response: { $exists: false }  // 未応答のもののみ
        },
        {
          $set: {
            adminNotifiedAt: null,
            notifications: []  // 通知履歴をクリア
          }
        }
      )
      
      logger.info(`通知時間変更により本日の履歴をリセット、未応答のみ期限切れに変更: ユーザー ${userId}`)
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings: settings },
      { new: true, runValidators: true }
    ).select('notificationSettings')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }

    res.json({
      success: true,
      message: timeChanged ? '通知設定を更新し、本日の履歴をリセットしました' : '通知設定を更新しました',
      settings: user.notificationSettings
    })
  } catch (error) {
    logger.error('Update notification settings error:', error)
    res.status(500).json({
      success: false,
      message: '通知設定の更新に失敗しました'
    })
  }
}

// 招待メール送信
export const sendInvitationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    const userId = (req as any).user.userId
    
    // バリデーション
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスを入力してください'
      })
    }
    
    // メールアドレスの形式をチェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスの形式が正しくありません'
      })
    }
    
    // ユーザー情報を取得
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      })
    }
    
    // LINE友だち追加URLを取得
    const lineAddUrl = process.env.LINE_ADD_FRIEND_URL || 'https://lin.ee/vxjKXkX'
    
    // 招待メールを送信
    const result = await emailService.sendInvitationEmail(
      email,
      user.name || 'あんぴーちゃんユーザー',
      lineAddUrl
    )
    
    if (result) {
      res.json({
        success: true,
        message: '招待メールを送信しました'
      })
    } else {
      res.status(500).json({
        success: false,
        message: '招待メールの送信に失敗しました'
      })
    }
  } catch (error) {
    logger.error('Send invitation email error:', error)
    res.status(500).json({
      success: false,
      message: '招待メールの送信に失敗しました'
    })
  }
}