import dotenv from 'dotenv';

dotenv.config();

console.log('メール設定確認:');
console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `設定済み (${process.env.SENDGRID_API_KEY.length}文字)` : '未設定');
console.log('- SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '未設定');
console.log('- SENDGRID_FROM_NAME:', process.env.SENDGRID_FROM_NAME || '未設定');

// SendGridのテストメール送信
if (process.env.SENDGRID_API_KEY) {
  console.log('\nSendGridテストメール送信を試みます...');
  
  import('./dist/services/emailService.js').then(async (module) => {
    const emailService = module.default;
    
    try {
      await emailService.sendSafetyCheckNotification(
        'designroommaster@gmail.com',
        'テスト太郎',
        new Date()
      );
      console.log('✅ テストメール送信成功！');
    } catch (error) {
      console.error('❌ メール送信エラー:', error);
    }
  });
} else {
  console.log('\n❌ SENDGRID_API_KEYが設定されていないため、メール送信できません');
}