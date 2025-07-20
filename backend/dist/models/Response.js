import mongoose, { Schema } from 'mongoose';
const responseSchema = new Schema({
    elderlyId: {
        type: Schema.Types.ObjectId,
        ref: 'Elderly',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['genki_button', 'phone_call', 'auto_call'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'no_answer', 'failed', 'expired'],
        default: 'pending',
    },
    respondedAt: {
        type: Date,
    },
    duration: {
        type: Number,
    },
    notes: {
        type: String,
    },
    token: {
        type: String,
        unique: true,
        sparse: true, // nullを許可しつつユニーク制約
    },
    tokenExpiresAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// インデックス
responseSchema.index({ elderlyId: 1, createdAt: -1 });
responseSchema.index({ token: 1 }, { sparse: true });
responseSchema.index({ type: 1, status: 1 });
responseSchema.index({ createdAt: -1 });
// トークンの有効期限チェック
responseSchema.methods.isTokenValid = function () {
    if (!this.token || !this.tokenExpiresAt)
        return false;
    return new Date() < this.tokenExpiresAt;
};
const ResponseModel = mongoose.model('Response', responseSchema);
export default ResponseModel;
