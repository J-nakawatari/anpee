import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IResponseHistory extends Document {
  elderlyId: Types.ObjectId
  userId: Types.ObjectId  // 追加: ユーザーID
  type: 'line_button' | 'phone_call'
  responseAt: Date
  status: 'responded' | 'no_response' | 'failed' | 'pending'  // pending追加
  twilioCallSid?: string
  duration?: number
  notes?: string
  retryCount?: number
  date: Date  // 追加: 通知日（日付のみ）
  lastNotificationTime?: Date  // 追加: 最後の通知送信時刻
  adminNotified?: boolean  // 追加: 管理者通知済みフラグ
  createdAt: Date
  updatedAt: Date
}

const responseHistorySchema = new Schema<IResponseHistory>(
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
    type: {
      type: String,
      enum: ['line_button', 'phone_call'],
      required: true,
    },
    responseAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['responded', 'no_response', 'failed', 'pending'],
      required: true,
      default: 'pending',
    },
    twilioCallSid: {
      type: String,
    },
    duration: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastNotificationTime: {
      type: Date,
    },
    adminNotified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// インデックス
responseHistorySchema.index({ elderlyId: 1, responseAt: -1 })
responseHistorySchema.index({ type: 1 })
responseHistorySchema.index({ status: 1 })

export default mongoose.model<IResponseHistory>('ResponseHistory', responseHistorySchema)