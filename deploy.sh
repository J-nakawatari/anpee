#!/bin/bash

# Anpee デプロイスクリプト
# 本番サーバーで実行: bash deploy.sh

echo "🚀 Anpeeのデプロイを開始します..."

# エラーが発生したら停止
set -e

# プロジェクトディレクトリに移動
cd /var/www/anpee

echo "📥 最新のコードを取得中..."
# リモートの最新情報を取得
git fetch origin

# ローカルの変更を破棄してリモートの最新に更新
git reset --hard origin/main
git clean -fd

echo "📦 バックエンドの依存関係をインストール中..."
cd backend
# ビルドに必要なため、開発用依存関係も含めてインストール
npm ci --production=false

echo "🔨 バックエンドをビルド中..."
npm run build

echo "📦 フロントエンドの依存関係をインストール中..."
cd ../frontend
npm ci --legacy-peer-deps

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