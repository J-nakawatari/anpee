import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('タイムライン確認\n');
  
  const Response = (await import('./dist/models/Response.js')).default;
  const ResponseHistory = (await import('./dist/models/ResponseHistory.js')).default;
  const Elderly = (await import('./dist/models/Elderly.js')).default;
  
  const elderly = await Elderly.findOne({
    status: 'active',
    lineUserId: { $exists: true, $ne: null }
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 本日のすべての応答を取得
  const responses = await Response.find({
    elderlyId: elderly._id,
    createdAt: { $gte: today }
  }).sort({ createdAt: 1 });
  
  console.log('本日の応答一覧:');
  responses.forEach(r => {
    console.log(`- ${new Date(r.createdAt).toLocaleTimeString('ja-JP')} - ${r.type} - ${r.status}${r.respondedAt ? ' (応答: ' + new Date(r.respondedAt).toLocaleTimeString('ja-JP') + ')' : ''}`);
  });
  
  // 本日の履歴を取得
  const histories = await ResponseHistory.find({
    elderlyId: elderly._id,
    date: { $gte: today }
  }).sort({ createdAt: 1 });
  
  console.log('\n本日の通知履歴:');
  histories.forEach(h => {
    console.log(`- 作成: ${new Date(h.createdAt).toLocaleTimeString('ja-JP')} - 再通知回数: ${h.retryCount} - 最終通知: ${new Date(h.lastNotificationTime).toLocaleTimeString('ja-JP')} - ステータス: ${h.status}`);
  });
  
  // 現在時刻
  console.log('\n現在時刻:', new Date().toLocaleTimeString('ja-JP'));
  
  mongoose.disconnect();
}).catch(err => {
  console.error('エラー:', err);
});