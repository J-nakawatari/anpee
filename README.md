# あんぴーちゃん - 高齢者見守りサービス

大切な家族を温かく見守る、あんぴーちゃんの見守りサービスです。

## 📋 プロジェクト構成

```
anpee/
├── frontend/          # Next.js フロントエンド
│   ├── src/
│   │   ├── app/      # App Router
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── styles/
│   └── public/
├── backend/           # Express.js バックエンド
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── utils/
│       └── services/
└── assets/           # デザインアセット

```

## 🚀 セットアップ

### 必要な環境
- Node.js 18以上
- MongoDB Atlas アカウント
- SendGrid アカウント
- Stripe アカウント
- LINE Messaging API アカウント
- Twilio アカウント

### 環境変数の設定

1. フロントエンド用 `/frontend/.env`
```bash
cp frontend/.env.example frontend/.env
# .envファイルを編集して必要な値を設定
```

2. バックエンド用 `/backend/.env`
```bash
cp backend/.env.example backend/.env
# .envファイルを編集して必要な値を設定
```

### インストールと起動

```bash
# フロントエンドの起動
cd frontend
npm install
npm run dev  # http://localhost:3003

# バックエンドの起動（別ターミナル）
cd backend
npm install
npm run dev  # http://localhost:4003
```

## 📁 進捗状況

### ✅ 完了したタスク
- [x] Next.jsプロジェクトの初期設定
- [x] TypeScript、Tailwind CSS v4、ESLint、Prettierの設定
- [x] Express.jsバックエンドの構築
- [x] MongoDB Atlas接続設定（モデル定義）
- [x] JWT認証システムの実装

### 🚧 実装中・予定のタスク
- [ ] CSRF対策の実装
- [ ] ログイン画面の作成
- [ ] 新規登録画面の作成
- [ ] パスワードリセット機能の実装
- [ ] 利用規約・プライバシーポリシー・特商法ページ
- [ ] SendGrid連携（メール送信）
- [ ] ユーザーダッシュボードの移植
- [ ] 高齢者管理機能の実装
- [ ] 履歴表示機能の実装
- [ ] 通知設定機能の実装
- [ ] LINE Messaging API連携
- [ ] Twilio自動架電実装
- [ ] Stripe決済連携
- [ ] 管理者ダッシュボード
- [ ] テスト・セキュリティチェック
- [ ] 本番環境デプロイ

## 🛠 技術スタック

### フロントエンド
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui コンポーネント
- React Hook Form + Zod

### バックエンド
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT認証
- SendGrid（メール）
- Twilio（電話）
- LINE Messaging API
- Stripe（決済）

## 📱 主な機能

1. **ユーザー認証**
   - JWT + リフレッシュトークン
   - メール確認
   - パスワードリセット

2. **見守り機能**
   - LINE元気ボタン
   - 自動架電
   - 応答履歴管理

3. **通知機能**
   - メール通知
   - LINE通知
   - カスタマイズ可能な通知設定

4. **課金機能**
   - Stripeサブスクリプション
   - 月額課金

5. **管理機能**
   - ユーザー管理
   - 統計ダッシュボード
   - アラート管理

## 🔐 セキュリティ

- HTTPS必須
- CSRF対策
- レート制限
- 入力値検証
- XSS対策

## 📝 ライセンス

プライベートプロジェクト