import mongoose, { Schema } from 'mongoose';
const lineUserSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    elderlyId: {
        type: Schema.Types.ObjectId,
        ref: 'Elderly',
        required: true,
        index: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    pictureUrl: {
        type: String,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
    lastActiveAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// 複合インデックス
lineUserSchema.index({ userId: 1, elderlyId: 1 }, { unique: true });
export const LineUser = mongoose.model('LineUser', lineUserSchema);
