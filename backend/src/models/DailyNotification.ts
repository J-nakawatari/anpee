import mongoose, { Document, Schema, Types } from 'mongoose'

// 通知記録
interface INotificationRecord {
  sentAt: Date
  type: 'scheduled' | 'retry1' | 'retry2' | 'retry3' | 'test'
  token: string
  tokenExpiresAt: Date
  isTest?: boolean  // テスト通知かどうか
}

// 応答記録
interface IResponseRecord {
  respondedAt: Date
  respondedToken: string
}

export interface IDailyNotification extends Document {
  elderlyId: Types.ObjectId
  userId: Types.ObjectId
  date: Date  // YYYY-MM-DD 00:00:00
  
  // 通知履歴（配列で管理）
  notifications: INotificationRecord[]
  
  // 応答情報（あれば）
  response?: IResponseRecord
  
  // 管理者通知
  adminNotifiedAt?: Date
  
  // メモ
  notes?: string
  
  // 計算プロパティ
  currentStatus?: 'pending' | 'responded' | 'expired' | 'admin_notified'
  retryCount?: number
  
  createdAt: Date
  updatedAt: Date
}

const notificationRecordSchema = new Schema<INotificationRecord>({
  sentAt: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['scheduled', 'retry1', 'retry2', 'retry3', 'test'],
    required: true
  },
  token: {
    type: String,
    required: true
  },
  tokenExpiresAt: {
    type: Date,
    required: true
  }
}, { _id: false })

const responseRecordSchema = new Schema<IResponseRecord>({
  respondedAt: {
    type: Date,
    required: true
  },
  respondedToken: {
    type: String,
    required: true
  }
}, { _id: false })

const dailyNotificationSchema = new Schema<IDailyNotification>(
  {
    elderlyId: {
      type: Schema.Types.ObjectId,
      ref: 'Elderly',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // 時間を00:00:00に正規化
      set: (v: Date) => {
        const d = new Date(v)
        d.setHours(0, 0, 0, 0)
        return d
      }
    },
    notifications: {
      type: [notificationRecordSchema],
      default: []
    },
    response: {
      type: responseRecordSchema,
      required: false
    },
    adminNotifiedAt: {
      type: Date,
      required: false
    },
    notes: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  }
)

// 仮想プロパティ：現在の状態
dailyNotificationSchema.virtual('currentStatus').get(function() {
  if (this.response) return 'responded'
  if (this.adminNotifiedAt) return 'admin_notified'
  
  // すべての通知が期限切れかチェック
  const now = new Date()
  const hasValidToken = this.notifications.some(n => n.tokenExpiresAt > now)
  
  if (!hasValidToken && this.notifications.length > 0) return 'expired'
  return 'pending'
})

// 仮想プロパティ：再通知回数
dailyNotificationSchema.virtual('retryCount').get(function() {
  // scheduled以外の通知数をカウント
  return this.notifications.filter(n => n.type !== 'scheduled').length
})

// インデックス
dailyNotificationSchema.index({ elderlyId: 1, date: -1 })
dailyNotificationSchema.index({ userId: 1, date: -1 })
dailyNotificationSchema.index({ date: -1 })

// 複合ユニークインデックス（1日1家族1レコード）
dailyNotificationSchema.index({ elderlyId: 1, date: 1 }, { unique: true })

// JSONに仮想プロパティを含める
dailyNotificationSchema.set('toJSON', {
  virtuals: true
})

export default mongoose.model<IDailyNotification>('DailyNotification', dailyNotificationSchema)