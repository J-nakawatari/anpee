import mongoose, { Schema } from 'mongoose';
const notificationSettingsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    lineNotifyEnabled: {
        type: Boolean,
        default: false,
    },
    emailNotifyEnabled: {
        type: Boolean,
        default: true,
    },
    notifyEmails: {
        type: [String],
        default: [],
    },
    notifyTime: {
        type: String,
        default: '09:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    retryCount: {
        type: Number,
        default: 2,
        min: 0,
        max: 5,
    },
    retryInterval: {
        type: Number,
        default: 30,
        min: 5,
        max: 120,
    },
    notifyOnNoResponse: {
        type: Boolean,
        default: true,
    },
    notifyOnSystemError: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// インデックス
notificationSettingsSchema.index({ userId: 1 });
export default mongoose.model('NotificationSettings', notificationSettingsSchema);
