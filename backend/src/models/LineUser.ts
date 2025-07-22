import mongoose, { Document, Schema } from 'mongoose';

export interface ILineUser extends Document {
  userId: string; // LINE ユーザーID
  elderlyId: mongoose.Types.ObjectId; // 紐付けられた家族のID
  displayName: string; // LINE 表示名
  pictureUrl?: string; // LINE プロフィール画像URL
  registeredAt: Date; // 登録日時
  lastActiveAt?: Date; // 最終アクティブ日時
  isActive: boolean; // アクティブフラグ
}

const lineUserSchema = new Schema<ILineUser>({
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

export const LineUser = mongoose.model<ILineUser>('LineUser', lineUserSchema);