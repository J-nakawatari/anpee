import { Request, Response } from 'express'
import Elderly from '../models/Elderly.js'
import logger from '../utils/logger.js'

// 家族一覧の取得
export const getElderlyList = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId

    const elderlyList = await Elderly.find({ userId })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: elderlyList,
    })
  } catch (error) {
    logger.error('家族一覧取得エラー:', error)
    res.status(500).json({
      success: false,
      message: '家族一覧の取得に失敗しました',
    })
  }
}

// 家族の詳細取得
export const getElderlyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const elderly = await Elderly.findOne({ _id: id, userId })

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '家族情報が見つかりません',
      })
    }

    res.json({
      success: true,
      data: elderly,
    })
  } catch (error) {
    logger.error('家族詳細取得エラー:', error)
    res.status(500).json({
      success: false,
      message: '家族情報の取得に失敗しました',
    })
  }
}

// 家族の新規登録
export const createElderly = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId
    const {
      name,
      age,
      phone,
      address,
      emergencyContact,
      emergencyPhone,
      notes,
    } = req.body

    // 必須項目のバリデーション
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!age && age !== 0) missingFields.push('age')
    if (!phone) missingFields.push('phone')
    if (!address) missingFields.push('address')
    if (!emergencyContact) missingFields.push('emergencyContact')
    if (!emergencyPhone) missingFields.push('emergencyPhone')
    
    if (missingFields.length > 0) {
      logger.error('必須項目が不足:', { userId, missingFields, body: req.body })
      return res.status(400).json({
        success: false,
        message: '必須項目が不足しています',
        missingFields,
      })
    }

    const elderly = new Elderly({
      userId,
      name,
      age,
      phone,
      address,
      emergencyContact,
      emergencyPhone,
      notes: notes || '',
      callTime: '07:00', // デフォルト値
      hasGenKiButton: false,
      callEnabled: true,
      retryCount: 2,
      retryInterval: 30,
      status: 'active',
    })

    // 登録コードを生成
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    elderly.registrationCode = code
    
    await elderly.save()

    res.status(201).json({
      success: true,
      message: '家族を登録しました',
      data: elderly,
    })
  } catch (error) {
    logger.error('家族登録エラー:', error)
    res.status(500).json({
      success: false,
      message: '家族の登録に失敗しました',
    })
  }
}

// 家族情報の更新
export const updateElderly = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId
    const updateData = req.body

    // 更新不可フィールドを除外
    delete updateData._id
    delete updateData.userId
    delete updateData.createdAt
    delete updateData.updatedAt

    const elderly = await Elderly.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    )

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '家族情報が見つかりません',
      })
    }

    res.json({
      success: true,
      message: '家族情報を更新しました',
      data: elderly,
    })
  } catch (error) {
    logger.error('家族情報更新エラー:', error)
    res.status(500).json({
      success: false,
      message: '家族情報の更新に失敗しました',
    })
  }
}

// 家族の削除
export const deleteElderly = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.userId

    const elderly = await Elderly.findOneAndDelete({ _id: id, userId })

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: '家族情報が見つかりません',
      })
    }

    res.json({
      success: true,
      message: '家族を削除しました',
    })
  } catch (error) {
    logger.error('家族削除エラー:', error)
    res.status(500).json({
      success: false,
      message: '家族の削除に失敗しました',
    })
  }
}