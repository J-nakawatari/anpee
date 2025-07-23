import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

// 通知一覧を取得
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query: any = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    logger.error('通知取得エラー:', error);
    res.status(500).json({
      success: false,
      message: '通知の取得に失敗しました'
    });
  }
};

// 通知を既読にする
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '通知が見つかりません'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error('通知既読処理エラー:', error);
    res.status(500).json({
      success: false,
      message: '通知の既読処理に失敗しました'
    });
  }
};

// すべての通知を既読にする
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'すべての通知を既読にしました'
    });
  } catch (error) {
    logger.error('通知一括既読処理エラー:', error);
    res.status(500).json({
      success: false,
      message: '通知の一括既読処理に失敗しました'
    });
  }
};

// 通知を削除
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: '通知が見つかりません'
      });
    }

    res.json({
      success: true,
      message: '通知を削除しました'
    });
  } catch (error) {
    logger.error('通知削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '通知の削除に失敗しました'
    });
  }
};

// Server-Sent Events (SSE) ストリーム
export const notificationStream = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  // SSEヘッダーを設定
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'https://anpee.jp',
    'Access-Control-Allow-Credentials': 'true'
  });

  // 接続確認
  res.write('data: {"type":"connected"}\n\n');

  // 定期的にハートビートを送信
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  // 通知を送信する関数
  const sendNotification = (notification: any) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };

  // グローバルイベントエミッターに接続（実装は後述）
  const notificationEmitter = (global as any).notificationEmitter;
  if (notificationEmitter) {
    notificationEmitter.on(`notification:${userId}`, sendNotification);
  }

  // 接続が切断されたときのクリーンアップ
  req.on('close', () => {
    clearInterval(heartbeat);
    if (notificationEmitter) {
      notificationEmitter.off(`notification:${userId}`, sendNotification);
    }
  });
};