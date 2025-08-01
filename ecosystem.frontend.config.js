// フロントエンドのみの設定ファイル
module.exports = {
  apps: [
    {
      name: 'anpee-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/var/log/anpee/frontend-error.log',
      out_file: '/var/log/anpee/frontend-out.log',
      log_file: '/var/log/anpee/frontend-combined.log',
      time: true
    }
  ]
};