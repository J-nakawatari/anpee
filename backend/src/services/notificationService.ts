import { EventEmitter } from 'events';
import Notification from '../models/Notification.js';
import { Types } from 'mongoose';
import logger from '../utils/logger.js';

// グローバルイベントエミッター
const notificationEmitter = new EventEmitter();
(global as any).notificationEmitter = notificationEmitter;

interface CreateNotificationData {
  userId: string | Types.ObjectId;
  type: 'response' | 'no_response' | 'system';
  title: string;
  message: string;
  elderlyId?: string | Types.ObjectId;
  elderlyName?: string;
}

class NotificationService {
  // 通知を作成して送信
  async createNotification(data: CreateNotificationData) {
    try {
      // MongoDBに保存
      const notification = await Notification.create({
        ...data,
        userId: data.userId.toString(),
        elderlyId: data.elderlyId ? data.elderlyId.toString() : undefined,
      });

      // リアルタイムで送信
      notificationEmitter.emit(
        `notification:${data.userId.toString()}`,
        notification.toObject()
      );

      logger.info('通知を作成しました', {
        userId: data.userId.toString(),
        type: data.type,
        title: data.title,
      });

      return notification;
    } catch (error) {
      logger.error('通知作成エラー:', error);
      throw error;
    }
  }

  // 応答があったときの通知
  async notifyResponse(
    userId: string | Types.ObjectId,
    elderlyId: string | Types.ObjectId,
    elderlyName: string
  ) {
    return this.createNotification({
      userId,
      type: 'response',
      title: '応答がありました',
      message: `${elderlyName}さんが元気ですボタンを押しました`,
      elderlyId,
      elderlyName,
    });
  }

  // 応答がなかったときの通知
  async notifyNoResponse(
    userId: string | Types.ObjectId,
    elderlyId: string | Types.ObjectId,
    elderlyName: string,
    retryCount: number
  ) {
    const message =
      retryCount === 0
        ? `${elderlyName}さんから応答がありません`
        : `${elderlyName}さんから応答がありません（${retryCount}回目の再通知）`;

    return this.createNotification({
      userId,
      type: 'no_response',
      title: '応答がありません',
      message,
      elderlyId,
      elderlyName,
    });
  }

  // システム通知
  async notifySystem(
    userId: string | Types.ObjectId,
    title: string,
    message: string
  ) {
    return this.createNotification({
      userId,
      type: 'system',
      title,
      message,
    });
  }

  // 管理者への通知
  async notifyAdmin(
    userId: string | Types.ObjectId,
    elderlyId: string | Types.ObjectId,
    elderlyName: string
  ) {
    return this.createNotification({
      userId,
      type: 'no_response',
      title: '緊急：管理者通知',
      message: `${elderlyName}さんから長時間応答がありません。確認してください。`,
      elderlyId,
      elderlyName,
    });
  }
}

export default new NotificationService();