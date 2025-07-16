import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IResponseHistory extends Document {
  elderlyId: Types.ObjectId
  type: 'line_button' | 'phone_call'
  responseAt: Date
  status: 'responded' | 'no_response' | 'failed'
  twilioCallSid?: string
  duration?: number
  notes?: string
  retryCount?: number
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
      enum: ['responded', 'no_response', 'failed'],
      required: true,
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