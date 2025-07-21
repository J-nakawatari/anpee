import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('管理者通知済みフラグをリセットします...\n');
  
  const ResponseHistory = (await import('./dist/models/ResponseHistory.js')).default;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await ResponseHistory.updateMany(
    {
      date: { $gte: today },
      adminNotified: true
    },
    { adminNotified: false }
  );
  
  console.log('リセット結果:', result.modifiedCount, '件');
  
  mongoose.disconnect();
}).catch(err => {
  console.error('エラー:', err);
});