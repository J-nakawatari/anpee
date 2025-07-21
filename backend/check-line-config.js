import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { sendLineMessage } from './dist/services/lineService.js';

dotenv.config();

console.log('LINE環境変数チェック:');
console.log('- LINE_CHANNEL_ACCESS_TOKEN:', process.env.LINE_CHANNEL_ACCESS_TOKEN ? '設定済み' : '未設定');
console.log('- LINE_CHANNEL_SECRET:', process.env.LINE_CHANNEL_SECRET ? '設定済み' : '未設定');
console.log('- アクセストークン長:', process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0);

// MongoDB接続とテスト送信
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('\nMongoDB接続成功');
  
  const Elderly = (await import('./dist/models/Elderly.js')).default;
  
  // アクティブな家族を取得
  const elderly = await Elderly.findOne({
    status: 'active',
    lineUserId: { $exists: true, $ne: null }
  });
  
  if (elderly) {
    console.log('\nテスト対象:', elderly.name, 'LINE ID:', elderly.lineUserId);
    
    // テストメッセージ送信
    try {
      const result = await sendLineMessage(elderly.lineUserId, [{
        type: 'text',
        text: 'これはテストメッセージです。LINE設定が正常に動作しています。'
      }]);
      console.log('\nテスト送信成功:', result);
    } catch (error) {
      console.error('\nテスト送信エラー:', error);
    }
  } else {
    console.log('\nLINE連携済みの家族が見つかりません');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('MongoDB接続エラー:', err);
});