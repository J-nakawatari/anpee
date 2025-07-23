import mongoose, { Schema } from 'mongoose';
const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['response', 'no_response', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    elderlyId: {
        type: Schema.Types.ObjectId,
        ref: 'Elderly'
    },
    elderlyName: String,
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// インデックス
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
// 30日以上前の既読通知を自動削除
notificationSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { read: true }
});
export default mongoose.model('Notification', notificationSchema);
