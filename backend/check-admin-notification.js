import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('管理者通知の状況確認\n');
  
  const User = (await import('./dist/models/User.js')).default;
  const ResponseHistory = (await import('./dist/models/ResponseHistory.js')).default;
  
  // ユーザー設定を確認
  const user = await User.findOne({
    'notificationSettings.retrySettings.maxRetries': { $gt: 0 }
  });
  
  console.log('ユーザー情報:');
  console.log('- メールアドレス:', user.email);
  console.log('- メール通知有効?:', user.notificationSettings?.methods?.email?.enabled || false);
  if (user.notificationSettings?.methods?.email?.enabled) {
    console.log('- 通知先メール:', user.notificationSettings.methods.email.address || user.email);
  }
  
  // 最新の履歴を確認
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const history = await ResponseHistory.findOne({
    date: { $gte: today }
  }).sort({ createdAt: -1 });
  
  if (history) {
    console.log('\n履歴情報:');
    console.log('- 再通知回数:', history.retryCount);
    console.log('- 最大再通知回数:', user.notificationSettings.retrySettings.maxRetries);
    console.log('- 最終通知時刻:', new Date(history.lastNotificationTime).toLocaleTimeString('ja-JP'));
    console.log('- 管理者通知済み?:', history.adminNotified || false);
    
    const now = new Date();
    const minutes = Math.floor((now - history.lastNotificationTime) / 1000 / 60);
    console.log('- 最終通知からの経過時間:', minutes, '分');
    
    // 管理者通知の条件
    const shouldNotifyAdmin = 
      history.retryCount >= user.notificationSettings.retrySettings.maxRetries &&
      !history.adminNotified &&
      minutes >= 2;
    
    console.log('\n管理者通知を送信すべき?', shouldNotifyAdmin);
    
    if (!shouldNotifyAdmin) {
      console.log('理由:');
      if (history.retryCount < user.notificationSettings.retrySettings.maxRetries) {
        console.log('- 最大再通知回数に達していない');
      }
      if (history.adminNotified) {
        console.log('- 既に管理者通知済み');
      }
      if (minutes < 2) {
        console.log('- 最終通知から2分経過していない');
      }
    }
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('エラー:', err);
});