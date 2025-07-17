import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: false,
        trim: true,
        default: '',
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user',
    },
    stripeCustomerId: {
        type: String,
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'none'],
        default: 'none',
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
}, {
    timestamps: true,
});
// インデックス
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });
export default mongoose.model('User', userSchema);
