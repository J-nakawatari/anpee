import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IRefreshToken extends Document {
  userId: Types.ObjectId
  token: string
  expiresAt: Date
  createdAt: Date
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// インデックス
refreshTokenSchema.index({ userId: 1 })
refreshTokenSchema.index({ token: 1 })
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema)