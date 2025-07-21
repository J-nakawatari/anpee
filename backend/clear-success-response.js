import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('16:38の成功応答をクリアします...\n');
  
  const Response = (await import('./dist/models/Response.js')).default;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 16:38の成功応答を期限切れに変更
  const result = await Response.updateOne(
    {
      createdAt: {
        $gte: new Date('2025-07-21T07:38:00.000Z'),
        $lt: new Date('2025-07-21T07:39:00.000Z')
      },
      status: 'success'
    },
    { status: 'expired' }
  );
  
  console.log('更新結果:', result.modifiedCount, '件');
  
  mongoose.disconnect();
}).catch(err => {
  console.error('エラー:', err);
});