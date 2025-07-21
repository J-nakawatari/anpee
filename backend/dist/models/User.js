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
    currentPlan: {
        type: String,
        enum: ['standard', 'family', 'none'],
        default: 'none',
    },
    hasSelectedInitialPlan: {
        type: Boolean,
        default: false,
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
    notificationSettings: {
        type: {
            methods: {
                line: { enabled: { type: Boolean, default: true } },
                email: {
                    enabled: { type: Boolean, default: false },
                    address: { type: String, default: '' }
                },
                phone: { enabled: { type: Boolean, default: false } }
            },
            timing: {
                morning: {
                    enabled: { type: Boolean, default: true },
                    time: { type: String, default: '08:00' }
                },
                evening: {
                    enabled: { type: Boolean, default: false },
                    time: { type: String, default: '20:00' }
                }
            },
            retrySettings: {
                maxRetries: { type: Number, default: 3 },
                retryInterval: { type: Number, default: 30 }
            }
        },
        default: {}
    }
}, {
    timestamps: true,
});
// インデックス
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });
export default mongoose.model('User', userSchema);
