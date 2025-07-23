import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ILoginHistory extends Document {
  userId: Types.ObjectId
  action: 'login' | 'logout' | 'password_change' | 'email_change' | 'failed_login'
  ipAddress: string
  userAgent: string
  location?: string
  createdAt: Date
}

const loginHistorySchema = new Schema<ILoginHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'password_change', 'email_change', 'failed_login'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

// インデックス
loginHistorySchema.index({ userId: 1, createdAt: -1 })
loginHistorySchema.index({ createdAt: -1 })

// 古いログを自動削除（90日以上前）
loginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', loginHistorySchema)

export default LoginHistory