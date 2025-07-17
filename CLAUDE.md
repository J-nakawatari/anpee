# CLAUDE.md - Anpee プロジェクト設定

このファイルはAnpeeプロジェクト固有の設定とルールを記載しています。

最終更新: 2025-07-17

## プロジェクト概要

**Anpee（あんぴーちゃん）** - 家族見守りサービス
- 家族の安否確認を毎日自動で行うサービス
- LINEと電話で「元気ですボタン」による確認
- 家族が応答しない場合は管理者に通知

## URL構造と設計意図

### ユーザー用ページ（/user/*）
すべてのユーザー向けページは `/user/` プレフィックスを使用します。

- `/user/dashboard` - ダッシュボード（見守り状況の概要）
- `/user/family` - 家族管理（登録対象者の編集・削除）
- `/user/history` - 通話＆ボタン応答履歴
- `/user/notifications` - 通知設定（LINE/メール・再通知の設定）
- `/user/billing` - プラン・支払い管理
- `/user/account` - アカウント設定

### 管理者用ページ（/admin/*）※今後実装予定
管理者向けページは `/admin/` プレフィックスを使用します。

- `/admin/dashboard` - 管理者ダッシュボード
- `/admin/users` - ユーザー管理
- `/admin/alerts` - アラート管理
- など

### その他のページ
- `/` - ルートページ（/user/dashboardへリダイレクト）
- `/login` - ログインページ
- `/register` - 新規登録ページ
- `/terms` - 利用規約
- `/privacy` - プライバシーポリシー
- `/commercial-law` - 特定商取引法に基づく表記

## 用語の統一

### 使用する用語
- **家族** - 見守り対象者を指す（「高齢者」という表現は使用しない）
- **家族管理** - 見守り対象者の管理機能
- **元気ですボタン** - LINEで送信される安否確認ボタン

### 使用しない用語
- ❌ 高齢者、elderly
- ❌ お年寄り
- ❌ シニア

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **スタイリング**: Tailwind CSS v3.4.1
- **UIコンポーネント**: shadcn/ui
- **言語**: TypeScript
- **ポート**: 3003

### バックエンド
- **フレームワーク**: Express.js
- **言語**: TypeScript
- **データベース**: MongoDB Atlas
- **認証**: JWT
- **ポート**: 4003

### インフラ
- **Webサーバー**: Nginx
- **プロセス管理**: PM2
- **SSL証明書**: Let's Encrypt

## デプロイ手順

1. ローカルでの変更をGitHubにプッシュ
2. VPSサーバーにSSH接続
3. `/var/www/anpee` ディレクトリで `bash deploy.sh` を実行

## PM2プロセス名
- `anpee` - フロントエンド（Next.js）
- `anpee-backend` - バックエンド（Express）

## 環境変数

### フロントエンド（.env.local）
```
NEXT_PUBLIC_API_URL=https://anpee.jp/api/v1
```

### バックエンド（.env）
```
NODE_ENV=production
PORT=4003
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
```

## 注意事項

1. **ポート番号**
   - フロントエンド: 3003（他のプロジェクトと重複しないよう注意）
   - バックエンド: 4003

2. **Nginxプロキシ設定**
   - IPv6対応のため `[::1]` を使用
   - `/api/` パスはバックエンド（4003）へプロキシ

3. **ビルド時の注意**
   - 環境変数変更後は必ず再ビルドが必要
   - `.next` ディレクトリの削除が必要な場合あり