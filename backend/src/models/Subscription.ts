import mongoose, { Document, Schema, Types } from 'mongoose'

export interface ISubscription extends Document {
  userId: Types.ObjectId
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  planId: 'standard' | 'family'
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  createdAt: Date
  updatedAt: Date
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    stripeCustomerId: {
      type: String,
      required: true,
      unique: true
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true
    },
    stripePriceId: {
      type: String,
      required: true
    },
    planId: {
      type: String,
      enum: ['standard', 'family'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'unpaid', 'trialing'],
      required: true
    },
    currentPeriodStart: {
      type: Date,
      required: true
    },
    currentPeriodEnd: {
      type: Date,
      required: true
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    trialEnd: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
)

// インデックス
subscriptionSchema.index({ userId: 1 })
subscriptionSchema.index({ stripeCustomerId: 1 })
subscriptionSchema.index({ stripeSubscriptionId: 1 })

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema)