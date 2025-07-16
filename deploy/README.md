# Anpee デプロイメント手順

## 初回セットアップ（本番サーバーで実行）

### 1. リポジトリのクローン
```bash
cd /home/your-user
git clone https://github.com/J-nakawatari/anpee.git
cd anpee
```

### 2. 環境変数の設定
```bash
# フロントエンド
cp frontend/.env.example frontend/.env.production.local
nano frontend/.env.production.local
# NEXT_PUBLIC_API_URL=https://anpee.jp/api/v1 など設定

# バックエンド  
cp backend/.env.example backend/.env
nano backend/.env
# 本番環境の設定を記入
```

### 3. Git Hooksの設定
```bash
./deploy/setup-git-hooks.sh
```

### 4. 初回ビルドとデプロイ
```bash
# フロントエンド
cd frontend
npm ci
npm run build

# バックエンド
cd ../backend
npm ci
npm run build

# PM2で起動
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 自動起動設定
```

### 5. Nginx設定
```nginx
# /etc/nginx/sites-available/anpee
server {
    listen 80;
    server_name anpee.jp www.anpee.jp;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name anpee.jp www.anpee.jp;

    ssl_certificate /etc/letsencrypt/live/anpee.jp/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anpee.jp/privkey.pem;

    # フロントエンド
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # バックエンドAPI
    location /api/ {
        proxy_pass http://localhost:4003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/anpee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 更新時の手順（Git Hook設定後）

本番サーバーで以下を実行するだけで自動デプロイされます：

```bash
cd /home/your-user/anpee
git pull
```

自動的に以下が実行されます：
1. 依存関係のインストール
2. フロントエンド・バックエンドのビルド
3. PM2でのサービス再起動
4. Nginx設定のリロード

## トラブルシューティング

### ログの確認
```bash
# PM2ログ
pm2 logs anpee-backend
pm2 logs anpee-frontend

# システムログ
tail -f /var/log/anpee/backend-error.log
tail -f /var/log/anpee/frontend-error.log
```

### サービスの再起動
```bash
# PM2
pm2 restart anpee-backend anpee-frontend

# Nginx
sudo systemctl restart nginx
```

### Git Hookが動作しない場合
```bash
# 手動で実行
.git/hooks/post-merge
```

## 重要な注意事項

1. **環境変数**: 本番環境の`.env`ファイルはGitで管理されません。手動で設定してください。

2. **データベース**: MongoDB Atlasを使用しているため、接続文字列を正しく設定してください。

3. **ポート番号**:
   - フロントエンド: 3003
   - バックエンド: 4003

4. **SSL証明書**: Let's Encryptを使用する場合は事前に設定してください。

5. **ファイアウォール**: 必要なポートが開いていることを確認してください。