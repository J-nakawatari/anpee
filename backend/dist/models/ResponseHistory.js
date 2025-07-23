import mongoose, { Schema } from 'mongoose';
const responseHistorySchema = new Schema({
    elderlyId: {
        type: Schema.Types.ObjectId,
        ref: 'Elderly',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },
    method: {
        type: String,
        enum: ['LINE', 'Phone'],
        required: true
    },
    status: {
        type: String,
        enum: ['responded', 'no_response', 'failed'],
        required: true
    },
    responseTime: {
        type: Number, // 秒単位
        required: false
    },
    message: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});
// 複合インデックス
responseHistorySchema.index({ elderlyId: 1, timestamp: -1 });
responseHistorySchema.index({ timestamp: -1, status: 1 });
const ResponseHistory = mongoose.model('ResponseHistory', responseHistorySchema);
export default ResponseHistory;
