import mongoose, { Document, Schema } from 'mongoose';

export interface IResponse extends Document {
  elderlyId: mongoose.Types.ObjectId; // 家族のID
  type: 'genki_button' | 'phone_call' | 'auto_call'; // 応答タイプ
  status: 'pending' | 'success' | 'no_answer' | 'failed' | 'expired'; // ステータス
  respondedAt?: Date; // 応答日時
  duration?: number; // 通話時間（秒）
  notes?: string; // メモ
  token?: string; // ワンタイムトークン（元気ボタン用）
  tokenExpiresAt?: Date; // トークン有効期限
  expiresAt?: Date; // レスポンスの有効期限
  metadata?: any; // その他のメタデータ
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new Schema<IResponse>({
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
responseSchema.methods.isTokenValid = function(): boolean {
  if (!this.token || !this.tokenExpiresAt) return false;
  return new Date() < this.tokenExpiresAt;
};

const ResponseModel = mongoose.model<IResponse>('Response', responseSchema);
export default ResponseModel;