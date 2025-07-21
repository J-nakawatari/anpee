import mongoose, { Schema } from 'mongoose';
const subscriptionSchema = new Schema({
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
}, {
    timestamps: true
});
// インデックス
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
export default mongoose.model('Subscription', subscriptionSchema);
