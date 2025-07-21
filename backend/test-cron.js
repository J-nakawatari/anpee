import * as cron from 'node-cron';

console.log('Starting cron test...');

// 10秒ごとに実行するテスト
const task = cron.schedule('*/10 * * * * *', () => {
  console.log('Cron job executed at:', new Date().toISOString());
}, {
  timezone: 'Asia/Tokyo'
});

console.log('Cron task scheduled. Waiting for executions...');

// 1分後に停止
setTimeout(() => {
  console.log('Stopping cron task...');
  task.stop();
  process.exit(0);
}, 60000);