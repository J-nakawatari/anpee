#!/bin/bash

# Git hooksのセットアップスクリプト
# 本番サーバーで一度だけ実行してください

echo "🔧 Git hooksのセットアップを開始します..."

# プロジェクトルートに移動
cd "$(dirname "$0")/.." || exit 1

# .git/hooksディレクトリが存在することを確認
if [ ! -d ".git/hooks" ]; then
    echo "❌ エラー: .git/hooksディレクトリが見つかりません"
    echo "このスクリプトはGitリポジトリのルートで実行してください"
    exit 1
fi

# post-mergeフックをコピー
echo "📋 post-mergeフックをコピー中..."
cp .githooks/post-merge .git/hooks/post-merge

# 実行権限を付与
chmod +x .git/hooks/post-merge

# ログディレクトリの作成（sudoが必要な場合あり）
echo "📁 ログディレクトリを作成中..."
if [ ! -d "/var/log/anpee" ]; then
    sudo mkdir -p /var/log/anpee
    sudo chown $USER:$USER /var/log/anpee
fi

echo "✅ Git hooksのセットアップが完了しました！"
echo ""
echo "📌 重要な注意事項:"
echo "1. 初回は手動でデプロイコマンドを実行してください:"
echo "   - cd frontend && npm ci && npm run build"
echo "   - cd backend && npm ci && npm run build"
echo "   - pm2 start ecosystem.config.js"
echo ""
echo "2. 今後は 'git pull' を実行すると自動的に:"
echo "   - 依存関係のインストール"
echo "   - ビルド"
echo "   - PM2でのサービス再起動"
echo "   が実行されます"
echo ""
echo "3. PM2の状態を確認: pm2 list"
echo "4. ログを確認: pm2 logs"