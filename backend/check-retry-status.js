import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('MongoDB接続成功\n');
  
  const User = (await import('./dist/models/User.js')).default;
  const Elderly = (await import('./dist/models/Elderly.js')).default;
  const Response = (await import('./dist/models/Response.js')).default;
  const ResponseHistory = (await import('./dist/models/ResponseHistory.js')).default;
  
  // 再通知が有効なユーザー
  const user = await User.findOne({
    'notificationSettings.retrySettings.maxRetries': { $gt: 0 }
  }).select('_id notificationSettings');
  
  console.log('ユーザー設定:');
  console.log('- 最大再通知回数:', user.notificationSettings.retrySettings.maxRetries);
  console.log('- 再通知間隔:', user.notificationSettings.retrySettings.retryInterval, '分');
  console.log('- 通知時間:', user.notificationSettings.timing.morning.time);
  
  // アクティブな家族
  const elderly = await Elderly.findOne({
    userId: user._id,
    status: 'active',
    lineUserId: { $exists: true, $ne: null }
  });
  
  console.log('\n家族:', elderly.name);
  
  // 本日の範囲
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 本日の成功応答
  const successResponse = await Response.findOne({
    elderlyId: elderly._id,
    type: 'genki_button',
    status: 'success',
    respondedAt: { $gte: today }
  }).sort({ respondedAt: -1 });
  
  console.log('\n本日の成功応答:', successResponse ? `あり (${new Date(successResponse.respondedAt).toLocaleTimeString('ja-JP')})` : 'なし');
  
  // 本日の履歴
  const histories = await ResponseHistory.find({
    elderlyId: elderly._id,
    date: { $gte: today }
  }).sort({ createdAt: -1 });
  
  console.log('\n本日の履歴数:', histories.length);
  
  if (histories.length > 0) {
    const latest = histories[0];
    console.log('\n最新の履歴:');
    console.log('- 再通知回数:', latest.retryCount);
    console.log('- 最終通知時刻:', new Date(latest.lastNotificationTime).toLocaleTimeString('ja-JP'));
    console.log('- 管理者通知済み:', latest.adminNotified || false);
    console.log('- ステータス:', latest.status);
    
    const now = new Date();
    const minutes = Math.floor((now - latest.lastNotificationTime) / 1000 / 60);
    console.log('- 最終通知からの経過時間:', minutes, '分');
    
    // 再通知条件チェック
    const shouldRetry = !successResponse && 
                        latest.retryCount < user.notificationSettings.retrySettings.maxRetries && 
                        minutes >= user.notificationSettings.retrySettings.retryInterval;
    
    console.log('\n再通知を送信すべき?', shouldRetry);
    
    if (!shouldRetry) {
      console.log('理由:');
      if (successResponse) console.log('- 本日の成功応答あり');
      if (latest.retryCount >= user.notificationSettings.retrySettings.maxRetries) {
        console.log('- 最大再通知回数に到達済み');
      }
      if (minutes < user.notificationSettings.retrySettings.retryInterval) {
        console.log('- 再通知間隔がまだ経過していない');
      }
    }
  } else {
    console.log('\n履歴なし - 初回通知がまだ送信されていない可能性があります');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('MongoDB接続エラー:', err);
});