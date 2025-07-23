import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  phone: string
  role: 'user' | 'admin' | 'super_admin'
  stripeCustomerId?: string
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'none'
  currentPlan?: 'standard' | 'family' | 'none'
  hasSelectedInitialPlan?: boolean
  emailVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  pendingEmail?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  notificationSettings?: {
    methods: {
      line: { enabled: boolean }
      email: { enabled: boolean; address: string }
      phone: { enabled: boolean }
    }
    timing: {
      morning: { enabled: boolean; time: string }
      evening: { enabled: boolean; time: string }
    }
    retrySettings: {
      maxRetries: number
      retryInterval: number
    }
  }
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
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
    emailVerificationExpires: {
      type: Date,
    },
    pendingEmail: {
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
  },
  {
    timestamps: true,
  }
)

// インデックス
userSchema.index({ email: 1 })
userSchema.index({ stripeCustomerId: 1 })

export default mongoose.model<IUser>('User', userSchema)