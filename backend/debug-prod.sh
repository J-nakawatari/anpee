#!/bin/bash
cd /var/www/anpee/backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('MongoDB接続成功');
  
  const User = require('./dist/models/User.js').default;
  const Elderly = require('./dist/models/Elderly.js').default;
  const Response = require('./dist/models/Response.js').default;
  const ResponseHistory = require('./dist/models/ResponseHistory.js').default;
  
  // 再通知が有効なユーザー
  const user = await User.findOne({
    'notificationSettings.retrySettings.maxRetries': { \$gt: 0 }
  }).select('_id notificationSettings');
  
  console.log('\\nユーザー設定:');
  console.log('- 最大再通知回数:', user.notificationSettings.retrySettings.maxRetries);
  console.log('- 再通知間隔:', user.notificationSettings.retrySettings.retryInterval, '分');
  
  // アクティブな家族
  const elderly = await Elderly.findOne({
    userId: user._id,
    status: 'active',
    lineUserId: { \$exists: true, \$ne: null }
  });
  
  console.log('\\n家族:', elderly.name);
  
  // 本日の範囲
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 本日の成功応答
  const successResponse = await Response.findOne({
    elderlyId: elderly._id,
    type: 'genki_button',
    status: 'success',
    respondedAt: { \$gte: today }
  }).sort({ respondedAt: -1 });
  
  console.log('\\n本日の成功応答:', successResponse ? '済み' : 'なし');
  
  // 本日の履歴
  const history = await ResponseHistory.findOne({
    elderlyId: elderly._id,
    date: { \$gte: today }
  }).sort({ createdAt: -1 });
  
  if (history) {
    console.log('\\n履歴情報:');
    console.log('- 再通知回数:', history.retryCount);
    console.log('- 最終通知時刻:', new Date(history.lastNotificationTime).toLocaleTimeString('ja-JP'));
    console.log('- 管理者通知済み:', history.adminNotified || false);
    
    const now = new Date();
    const minutes = Math.floor((now - history.lastNotificationTime) / 1000 / 60);
    console.log('- 最終通知からの経過時間:', minutes, '分');
    
    // 再通知条件チェック
    const shouldRetry = !successResponse && 
                        history.retryCount < user.notificationSettings.retrySettings.maxRetries && 
                        minutes >= user.notificationSettings.retrySettings.retryInterval;
    
    console.log('\\n再通知を送信すべき?', shouldRetry);
    
    // 管理者通知条件チェック
    const shouldNotifyAdmin = !successResponse && 
                              history.retryCount >= user.notificationSettings.retrySettings.maxRetries && 
                              !history.adminNotified &&
                              minutes >= 2;
    
    console.log('管理者通知を送信すべき?', shouldNotifyAdmin);
  } else {
    console.log('\\n履歴なし');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
"