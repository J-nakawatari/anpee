import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IElderly extends Document {
  userId: Types.ObjectId
  name: string
  age: number
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  hasGenKiButton: boolean
  lineUserId?: string
  registrationCode?: string
  callTime: string
  callEnabled: boolean
  retryCount: number
  retryInterval: number
  status: 'active' | 'inactive' | 'suspended'
  notes: string
  lastResponseAt?: Date
  createdAt: Date
  updatedAt: Date
  generateRegistrationCode(): string
}

const elderlySchema = new Schema<IElderly>(
  {
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
  },
  {
    timestamps: true,
  }
)

// インデックス
elderlySchema.index({ userId: 1 })
elderlySchema.index({ status: 1 })
elderlySchema.index({ callTime: 1 })
elderlySchema.index({ registrationCode: 1 })

// 登録コード生成メソッド
elderlySchema.methods.generateRegistrationCode = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 保存前に登録コードを自動生成
elderlySchema.pre('save', async function(next) {
  if (!this.registrationCode) {
    // ユニークな登録コードを生成
    let isUnique = false
    let code = ''
    
    while (!isUnique) {
      code = this.generateRegistrationCode()
      const existing = await mongoose.model('Elderly').findOne({ registrationCode: code })
      if (!existing) {
        isUnique = true
      }
    }
    
    this.registrationCode = code
  }
  next()
})

export default mongoose.model<IElderly>('Elderly', elderlySchema)