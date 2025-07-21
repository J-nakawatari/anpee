import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('テスト用に本日の成功応答をクリアします...\n');
  
  const Response = (await import('./dist/models/Response.js')).default;
  const Elderly = (await import('./dist/models/Elderly.js')).default;
  const ResponseHistory = (await import('./dist/models/ResponseHistory.js')).default;
  
  // アクティブな家族を取得
  const elderly = await Elderly.findOne({
    status: 'active',
    lineUserId: { $exists: true, $ne: null }
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 本日の成功応答を削除（テスト用）
  const result = await Response.updateMany(
    {
      elderlyId: elderly._id,
      type: 'genki_button',
      status: 'success',
      respondedAt: { $gte: today }
    },
    { status: 'expired' }
  );
  
  console.log('成功応答をexpiredに変更:', result.modifiedCount, '件');
  
  // テスト用の履歴を作成（10分前に初回通知を送信したことにする）
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const history = await ResponseHistory.create({
    elderlyId: elderly._id,
    userId: elderly.userId,
    type: 'line_button',
    responseAt: tenMinutesAgo,
    date: new Date(),
    retryCount: 0,
    lastNotificationTime: tenMinutesAgo,
    status: 'pending'
  });
  
  console.log('\nテスト用履歴を作成しました:');
  console.log('- 最終通知時刻:', tenMinutesAgo.toLocaleTimeString('ja-JP'));
  console.log('- 再通知回数:', 0);
  console.log('\n再通知サービスが2分間隔で設定されているため、次の分に再通知が送信されるはずです。');
  
  mongoose.disconnect();
}).catch(err => {
  console.error('エラー:', err);
});