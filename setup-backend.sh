#!/bin/bash
# Express.jsバックエンドの自動セットアップスクリプト

echo "Setting up Express.js backend..."

# backendディレクトリを作成
mkdir -p backend
cd backend

# package.jsonを作成
cat > package.json << 'EOF'
{
  "name": "anpee-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "type": "module"
}
EOF

# 必要なパッケージをインストール
echo "Installing Express.js and dependencies..."
npm install express mongoose bcryptjs jsonwebtoken dotenv cors helmet
npm install express-validator express-rate-limit
npm install @sendgrid/mail twilio stripe @line/bot-sdk
npm install winston node-cron

# 開発用パッケージをインストール
echo "Installing dev dependencies..."
npm install -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken
npm install -D @types/cors nodemon ts-node
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

echo "Backend setup completed!"