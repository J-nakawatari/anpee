import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の読み込み
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function fixLineUserIndex() {
  try {
    // MongoDBに接続
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const db = mongoose.connection.db;
    
    // LineUserコレクションの既存インデックスを確認
    const indexes = await db.collection('lineusers').indexes();
    console.log('現在のインデックス:', indexes);

    // userId_1インデックスを削除（uniqueを外すため）
    try {
      await db.collection('lineusers').dropIndex('userId_1');
      console.log('userId_1インデックスを削除しました');
    } catch (error) {
      console.log('userId_1インデックスの削除エラー（存在しない可能性）:', error.message);
    }

    // 新しいインデックスを作成（uniqueなし）
    await db.collection('lineusers').createIndex({ userId: 1 });
    console.log('新しいuserIdインデックスを作成しました（uniqueなし）');

    // 複合インデックスは維持（userId + elderlyIdの組み合わせはユニーク）
    console.log('複合インデックス（userId + elderlyId）は維持されます');

    console.log('インデックスの修正が完了しました');
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

fixLineUserIndex();