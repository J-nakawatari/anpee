import mongoose, { Schema } from 'mongoose';
const elderlySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 150,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    emergencyContact: {
        type: String,
        required: true,
        trim: true,
    },
    emergencyPhone: {
        type: String,
        required: true,
        trim: true,
    },
    hasGenKiButton: {
        type: Boolean,
        default: false,
    },
    lineUserId: {
        type: String,
        unique: true,
        sparse: true,
    },
    registrationCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    callTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    callEnabled: {
        type: Boolean,
        default: true,
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
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },
    notes: {
        type: String,
        default: '',
    },
    lastResponseAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// インデックス
elderlySchema.index({ userId: 1 });
elderlySchema.index({ status: 1 });
elderlySchema.index({ callTime: 1 });
elderlySchema.index({ registrationCode: 1 });
// 登録コード生成メソッド
elderlySchema.methods.generateRegistrationCode = function () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
export default mongoose.model('Elderly', elderlySchema);
