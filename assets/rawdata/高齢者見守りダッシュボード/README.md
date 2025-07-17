# あんぴーちゃん 見守りサービス ダッシュボード

React + TypeScript + Tailwind CSS v4で構築された「あんぴーちゃん」見守りサービスの管理ダッシュボードアプリケーションです。

## 🍑 プロジェクト概要

このアプリケーションは、高齢者の安全を見守るサービス「あんぴーちゃん」のダッシュボードです。LINEの元気ですボタンと電話での安否確認を中心とした、温かみのある家族向け見守りサービスです。

### サービスの特徴

- **対象者**: 1-2人の家族（おじいちゃん・おばあちゃん）を想定
- **機能**: LINEの「元気ですボタン」応答チェック＋電話での安否確認
- **記録内容**: 応答時刻のみ（通話時間や内容は記録しない）
- **デザイン**: 温かいピンク・オレンジ系で親しみやすい「あんぴーちゃん」デザイン

### 主要機能

- **ダッシュボード**: 1-2人の見守り状況と応答記録を個人カードで表示
- **高齢者管理**: 見守り対象者の基本情報管理（複数人対応可能）
- **履歴管理**: LINEボタン応答と電話応答の履歴確認
- **通知設定**: LINE公式アカウント・メール通知の設定
- **課金管理**: Stripe連携による支払い・プラン管理
- **アカウント設定**: ユーザー情報管理

## 🛠 技術スタック

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI ベース)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Forms**: React Hook Form

## 🎨 デザインシステム

### カラーパレット

```css
/* あんぴーちゃん専用カラー */
--peach-50: #fff7ed;   /* 背景色 */
--peach-100: #ffedd5;  /* 薄いアクセント */
--peach-200: #fed7aa;  /* ボーダー */
--peach-300: #fdba74;  /* 中間色 */
--peach-400: #fb923c;  /* アクセント */
--peach-500: #f97316;  /* メイン色 */
--peach-600: #ea580c;  /* 濃いアクセント */
--peach-700: #c2410c;  /* テキスト */
--peach-800: #9a3412;  /* 濃いテキスト */
--peach-900: #7c2d12;  /* 最も濃い */

--heart-pink: #f472b6;      /* ハートアクセント */
--heart-pink-light: #fce7f3; /* ハート背景 */
```

### デザイン特徴

- **フォント**: 丸ゴシック系（優しい印象）
- **角丸**: 1rem（可愛らしさ）
- **影**: 優しいドロップシャドウ
- **アニメーション**: 微細な動きで親しみやすさ
- **ハートアクセント**: 愛情のこもった見守りを表現

## 🖼️ 画像・アセット

### マスコットキャラクター

```typescript
// あんぴーちゃんのマスコット画像
import anpeechanImage from "figma:asset/8044dd3c50661d1e6746e0bc3e98566187669130.png";

// 使用例
<img 
  src={anpeechanImage} 
  alt="あんぴーちゃん" 
  className="w-12 h-12 rounded-full"
/>
```

### 画像使用ガイドライン

- **マスコット**: ロゴエリア、ウェルカムメッセージで使用
- **サイズ**: 12x12（小）、16x16（中）、その他は用途に応じて調整
- **形状**: 丸形（rounded-full）で統一
- **新しい画像**: `ImageWithFallback`コンポーネントを使用

## 📁 ファイル構造詳細

```
├── App.tsx                    # エントリーポイント、ページルーティング
├── styles/
│   └── globals.css           # あんぴーちゃんカラー設定とCSS変数
├── components/
│   ├── Layout.tsx            # メインレイアウト（サイドバー、ヘッダー）
│   ├── DashboardPage.tsx     # ダッシュボード（1-2人特化）
│   ├── ElderlyManagementPage.tsx  # 高齢者管理（複数人対応）
│   ├── HistoryPage.tsx       # 履歴（LINEボタン・電話応答）
│   ├── NotificationSettingsPage.tsx  # 通知設定（LINE公式アカウント）
│   ├── BillingPage.tsx       # 課金管理（Stripe連携）
│   ├── AccountSettingsPage.tsx      # アカウント設定
│   ├── ui/                   # shadcn/ui コンポーネント
│   └── figma/                # Figma連携用コンポーネント
│       └── ImageWithFallback.tsx  # 画像コンポーネント
├── data/
│   ├── subscriptionPlans.ts  # サブスクリプションプラン情報
│   ├── elderlyData.ts        # 高齢者データ
│   ├── billingData.ts        # 課金データ
│   └── accountData.ts        # アカウントデータ
```

## 🚀 実装仕様

### 必須パッケージ

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "lucide-react": "latest",
    "sonner": "2.0.3",
    "react-hook-form": "7.55.0",
    "recharts": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}
```

### 重要な実装ポイント

#### 1. サービス機能の制限
```typescript
// ❌ 通話時間記録
// ❌ 会話内容記録
// ❌ 詳細なメモ機能
// ❌ 複雑なスケジュール管理

// ✅ LINEボタン応答チェック
// ✅ 電話応答チェック
// ✅ 応答時刻の記録
// ✅ 簡単な安否確認
```

#### 2. 個人向け最適化
```typescript
// ダッシュボードは1-2人用
const elderlyPeople = [
  { name: "おばあちゃん", ... },
  { name: "おじいちゃん", ... }
];

// 他のページは複数人対応可能
// 統計は家族レベル（12名→2名）
```

#### 3. デザイン一貫性
```typescript
// 必須クラス
className="cute-card"          // カード
className="gentle-shadow"      // 影
className="heart-accent"       // ハートアクセント
className="cute-button"        // ボタン
className="watching-icon"      // アイコン
className="warm-gradient"      // 背景
```

## 🎯 開発ガイドライン

### 1. 色の使用制限
```css
/* ❌ 避けるべき（globals.cssで設定済み） */
.text-2xl, .font-bold, .leading-none

/* ✅ 推奨（CSS変数を使用） */
color: var(--peach-500);
background: var(--heart-pink-light);
```

### 2. アイコンの使用
```typescript
// Lucide Reactから選択
import { Heart, Users, Phone, MessageSquare } from "lucide-react";

// 見守りアイコンは専用クラス
<Icon className="w-5 h-5 watching-icon" />
```

### 3. 応答記録の表示
```typescript
// 簡潔な状態表示
status: "応答" | "未応答" | "確認済み"
type: "LINE" | "電話"
time: "07:30" // 時刻のみ
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. 色が適用されない
```css
/* globals.cssの変数確認 */
:root {
  --peach-500: #f97316;
}

/* 使用例 */
.watching-icon {
  color: var(--peach-500);
}
```

#### 2. 画像が表示されない
```typescript
// Figmaアセットの正しい使用
import anpeechanImage from "figma:asset/8044dd3c50661d1e6746e0bc3e98566187669130.png";

// 新しい画像の場合
import { ImageWithFallback } from './components/figma/ImageWithFallback';
```

#### 3. 特定バージョンのライブラリ
```typescript
// 必須バージョン
import { toast } from "sonner@2.0.3";
import { useForm } from "react-hook-form@7.55.0";
```

## 📋 チェックリスト

### 実装確認項目

- [ ] あんぴーちゃんの色調（ピンク・オレンジ系）
- [ ] マスコットキャラクターの表示
- [ ] 丸みのあるデザイン（border-radius: 1rem）
- [ ] ハートアクセントの表示
- [ ] 温かいメッセージ（「おはようございます！」など）
- [ ] 1-2人向けダッシュボード
- [ ] LINEボタン応答チェック
- [ ] 電話応答チェック
- [ ] 応答時刻の記録
- [ ] 優しいアニメーション効果

### 機能確認項目

- [ ] ページ切り替え（6ページ）
- [ ] 見守り対象者の個人カード表示
- [ ] 応答状況の可視化
- [ ] 通知設定（LINE公式アカウント）
- [ ] 課金管理（Stripe連携）
- [ ] レスポンシブデザイン

## 🌟 今後の拡張可能性

- **複数家族対応**: 現在は1-2人、将来的には複数世帯
- **音声通話**: 現在は応答確認のみ、将来的には音声記録
- **IoT連携**: センサーデータとの連携
- **AI分析**: 応答パターンの分析
- **家族アプリ**: 家族向けモバイルアプリ

---

## 📞 サポート

このプロジェクトは「あんぴーちゃん」見守りサービスの温かみのある家族向けダッシュボードです。実装時は以下の点にご注意ください：

1. **デザイン優先**: 技術よりも「温かさ」「親しみやすさ」を重視
2. **シンプル機能**: 複雑にせず、本質的な見守り機能に集中
3. **家族視点**: 利用者は高齢者の家族（子供・孫世代）
4. **1-2人特化**: ダッシュボードは個人レベルに最適化

**注意**: このREADMEは Figma Make での実装を前提として作成されています。本番環境にデプロイする際は、追加のセキュリティ設定やパフォーマンス最適化が必要です。