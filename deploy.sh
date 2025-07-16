#!/bin/bash

# Anpee デプロイスクリプト
# 本番サーバーで実行: bash deploy.sh

echo "🚀 Anpeeのデプロイを開始します..."

# エラーが発生したら停止
set -e

# プロジェクトディレクトリに移動
cd /var/www/anpee

echo "📥 最新のコードを取得中..."
# ローカルの変更を破棄（ビルドファイルなど）
git reset --hard HEAD
git clean -fd

# 最新のコードを取得
git pull

echo "📦 バックエンドの依存関係をインストール中..."
cd backend
# 本番用と開発用の両方をインストール（ビルドに必要）
npm ci
npm install --save-dev @types/express @types/cors @types/jsonwebtoken @types/cookie-parser @types/csurf

echo "🔨 バックエンドをビルド中..."
npm run build

echo "📦 フロントエンドの依存関係をインストール中..."
cd ../frontend
npm ci

echo "🔨 フロントエンドをビルド中..."
npm run build

echo "🔄 PM2プロセスを再起動中..."
cd ..
pm2 restart anpee-backend anpee

echo "✅ デプロイが完了しました！"
echo ""
echo "📊 プロセス状態:"
pm2 list

echo ""
echo "📝 ログを確認するには:"
echo "  pm2 logs anpee-backend"
echo "  pm2 logs anpee"