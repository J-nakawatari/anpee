import type { Metadata } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import '../styles/globals.css'

const mPlusRounded1c = M_PLUS_Rounded_1c({ 
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-m-plus-rounded-1c',
})

export const metadata: Metadata = {
  title: 'あんぴーちゃん - 高齢者見守りサービス',
  description: '大切な家族を温かく見守る、あんぴーちゃんの見守りサービス',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* CSS変数定義 */
          :root {
            --background: #fef7f0;
            --foreground: #7c2d12;
            --card: #ffffff;
            --card-foreground: #7c2d12;
            --primary: #f97316;
            --primary-foreground: #ffffff;
            --secondary: #fed7aa;
            --secondary-foreground: #7c2d12;
            --muted: #fff7ed;
            --muted-foreground: #a16207;
            --accent: #ffedd5;
            --accent-foreground: #7c2d12;
            --destructive: #dc2626;
            --destructive-foreground: #ffffff;
            --border: #fde8d6;
            --input: #ffffff;
            --ring: #f97316;
            --radius: 1rem;
            
            /* あんぴーちゃん専用カラー */
            --peach-50: #fff7ed;
            --peach-100: #ffedd5;
            --peach-200: #fed7aa;
            --peach-300: #fdba74;
            --peach-400: #fb923c;
            --peach-500: #f97316;
            --peach-600: #ea580c;
            --peach-700: #c2410c;
            --peach-800: #9a3412;
            --peach-900: #7c2d12;
            
            --yellow-50: #fefce8;
            --yellow-100: #fef3c7;
            --yellow-200: #fed7aa;
            --yellow-300: #fcd34d;
            --yellow-400: #fbbf24;
            --yellow-500: #f59e0b;
            
            --heart-pink: #f472b6;
            --heart-pink-light: #fce7f3;
            
            --color-white: #ffffff;
            --color-orange-200: #fed7aa;
            --spacing: 0.25rem;
          }
          
          /* グローバルスタイル */
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: var(--font-m-plus-rounded-1c), "Hiragino Maru Gothic Pro", "BIZ UDPGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic Medium", "Meiryo", sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            line-height: 1.6;
            letter-spacing: 0.02em;
            margin: 0;
            padding: 0;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            letter-spacing: 0.025em;
          }
          
          /* 重要なレイアウトスタイルを強制的に適用 */
          .min-h-screen.warm-gradient.flex {
            display: flex !important;
            min-height: 100vh !important;
            flex-direction: row !important;
            background: linear-gradient(135deg, #fff7ed 0%, #fefce8 100%) !important;
          }
          
          .w-64 {
            width: 16rem !important;
            min-width: 16rem !important;
            max-width: 16rem !important;
          }
          
          .bg-white {
            background-color: #ffffff !important;
          }
          
          .border-r {
            border-right-width: 1px !important;
            border-right-style: solid !important;
          }
          
          .border-orange-200 {
            border-color: #fed7aa !important;
          }
          
          .flex {
            display: flex !important;
          }
          
          .flex-col {
            flex-direction: column !important;
          }
          
          .flex-1 {
            flex: 1 1 0% !important;
          }
          
          .flex-shrink-0 {
            flex-shrink: 0 !important;
          }
          
          .min-h-screen {
            min-height: 100vh !important;
          }
          
          .overflow-auto {
            overflow: auto !important;
          }
          
          .overflow-y-auto {
            overflow-y: auto !important;
          }
          
          .overflow-hidden {
            overflow: hidden !important;
          }
          
          /* パディングとマージン */
          .p-6 {
            padding: 1.5rem !important;
          }
          
          .p-4 {
            padding: 1rem !important;
          }
          
          .p-3 {
            padding: 0.75rem !important;
          }
          
          .p-2 {
            padding: 0.5rem !important;
          }
          
          .px-6 {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          .px-4 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .px-3 {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          
          .px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          
          .py-3 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          
          .py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          .py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .pt-6 {
            padding-top: 1.5rem !important;
          }
          
          .pb-6 {
            padding-bottom: 1.5rem !important;
          }
          
          .pb-4 {
            padding-bottom: 1rem !important;
          }
          
          .mt-1 {
            margin-top: 0.25rem !important;
          }
          
          .mt-2 {
            margin-top: 0.5rem !important;
          }
          
          .mt-3 {
            margin-top: 0.75rem !important;
          }
          
          .mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .mr-1 {
            margin-right: 0.25rem !important;
          }
          
          .space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }
          
          .space-y-2 > * + * {
            margin-top: 0.5rem !important;
          }
          
          .space-y-3 > * + * {
            margin-top: 0.75rem !important;
          }
          
          .space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
          
          /* 詳細度を上げてスタイルを確実に適用 */
          body > * > * > .min-h-screen.warm-gradient.flex {
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
          }
          
          body > * > * > .min-h-screen.warm-gradient.flex > .w-64 {
            width: 16rem !important;
            min-width: 16rem !important;
            max-width: 16rem !important;
            flex-shrink: 0 !important;
          }
          
          /* メインコンテナの直接の子要素に対するスタイル */
          div.min-h-screen.warm-gradient.flex > div:first-child {
            width: 16rem !important;
            min-width: 16rem !important;
            flex-shrink: 0 !important;
          }
          
          div.min-h-screen.warm-gradient.flex > div:last-child {
            flex: 1 1 0% !important;
            min-width: 0 !important;
          }
          
          /* 追加の重要なスタイル */
          .gentle-shadow {
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15) !important;
          }
          
          /* ハートアクセント */
          .heart-accent {
            position: relative !important;
          }
          
          .heart-accent::before {
            content: "♡" !important;
            color: #f472b6 !important;
            margin-right: 0.25rem !important;
            font-size: 0.875em !important;
          }
          
          /* 可愛いボタンスタイル */
          .cute-button {
            border-radius: 1rem !important;
            transition: all 0.3s ease !important;
            font-weight: 500 !important;
          }
          
          .cute-button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
          }
          
          /* カード用の優しいスタイル */
          .cute-card {
            background: #ffffff !important;
            border: 1px solid #fde8d6 !important;
            border-radius: 1rem !important;
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1) !important;
          }
          
          /* 見守り専用アイコン */
          .watching-icon {
            color: #f97316 !important;
            filter: drop-shadow(0 1px 2px rgba(249, 115, 22, 0.3)) !important;
          }
          
          /* ステータス表示用の色 */
          .status-safe {
            background-color: #dcfce7 !important;
            color: #166534 !important;
          }
          
          .status-warning {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }
          
          .status-danger {
            background-color: #fee2e2 !important;
            color: #991b1b !important;
          }
          
          .border-b {
            border-bottom-width: 1px !important;
            border-bottom-style: solid !important;
          }
          
          .space-y-2 > * + * {
            margin-top: 0.5rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
          
          .rounded-xl {
            border-radius: 0.75rem !important;
          }
          
          .text-left {
            text-align: left !important;
          }
          
          .items-center {
            align-items: center !important;
          }
          
          .justify-between {
            justify-content: space-between !important;
          }
          
          .gap-3 {
            gap: 0.75rem !important;
          }
          
          .gap-4 {
            gap: 1rem !important;
          }
          
          /* フォントサイズ */
          .text-lg {
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
          }
          
          .text-sm {
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
          }
          
          .text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }
          
          .text-2xl {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }
          
          .text-xl {
            font-size: 1.25rem !important;
            line-height: 1.75rem !important;
          }
          
          .text-base {
            font-size: 1rem !important;
            line-height: 1.5rem !important;
          }
          
          /* フォントウェイト */
          .font-semibold {
            font-weight: 600 !important;
          }
          
          .font-medium {
            font-weight: 500 !important;
          }
          
          /* 色 */
          .text-orange-800 {
            color: #9a3412 !important;
          }
          
          .text-orange-600 {
            color: #ea580c !important;
          }
          
          .text-orange-700 {
            color: #c2410c !important;
          }
          
          .bg-orange-100 {
            background-color: #ffedd5 !important;
          }
          
          .bg-orange-50 {
            background-color: #fff7ed !important;
          }
          
          /* アニメーション */
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .5;
            }
          }
          
          .animate-bounce {
            animation: bounce 1s infinite !important;
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(-25%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
          
          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite !important;
          }
          
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          
          /* スクロールバーのカスタマイズ */
          ::-webkit-scrollbar {
            width: 8px !important;
          }
          
          ::-webkit-scrollbar-track {
            background: #fff7ed !important;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #fdba74 !important;
            border-radius: 4px !important;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #fb923c !important;
          }
          
          /* カードコンポーネントのスタイル */
          .bg-card {
            background-color: #ffffff !important;
          }
          
          .text-card-foreground {
            color: #7c2d12 !important;
          }
          
          .rounded-xl {
            border-radius: 0.75rem !important;
          }
          
          .border {
            border-width: 1px !important;
            border-style: solid !important;
            border-color: #fde8d6 !important;
          }
          
          .gap-6 {
            gap: 1.5rem !important;
          }
          
          .px-6 {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          .pt-6 {
            padding-top: 1.5rem !important;
          }
          
          .pb-6 {
            padding-bottom: 1.5rem !important;
          }
          
          .text-muted-foreground {
            color: #a16207 !important;
          }
          
          /* グリッドレイアウト */
          .grid {
            display: grid !important;
          }
          
          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
          
          .grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          .grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
          
          @media (min-width: 768px) {
            .md\:grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          
          @media (min-width: 1024px) {
            .lg\:grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            }
          }
          
          /* バッジコンポーネント */
          .bg-green-100 {
            background-color: #dcfce7 !important;
          }
          
          .text-green-700 {
            color: #15803d !important;
          }
          
          .text-green-600 {
            color: #16a34a !important;
          }
          
          .bg-green-50 {
            background-color: #f0fdf4 !important;
          }
          
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
          
          .bg-blue-100 {
            background-color: #dbeafe !important;
          }
          
          .text-blue-700 {
            color: #1d4ed8 !important;
          }
          
          .text-blue-600 {
            color: #2563eb !important;
          }
          
          .bg-pink-100 {
            background-color: #fce7f3 !important;
          }
          
          .text-pink-700 {
            color: #be185d !important;
          }
          
          .bg-purple-100 {
            background-color: #f3e8ff !important;
          }
          
          .text-purple-700 {
            color: #6b21a8 !important;
          }
          
          .text-purple-600 {
            color: #9333ea !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .text-gray-700 {
            color: #374151 !important;
          }
          
          .bg-orange-100 {
            background-color: #ffedd5 !important;
          }
          
          .text-orange-700 {
            color: #c2410c !important;
          }
          
          .border-orange-100 {
            border-color: #ffedd5 !important;
          }
          
          .border-blue-200 {
            border-color: #bfdbfe !important;
          }
          
          /* ラウンドコーナー */
          .rounded-lg {
            border-radius: 0.5rem !important;
          }
          
          .rounded-2xl {
            border-radius: 1rem !important;
          }
          
          /* シャドウ */
          .hover\:shadow-lg:hover {
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          }
          
          .transition-shadow {
            transition-property: box-shadow !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-duration: 150ms !important;
          }
          
          /* フォントサイズ追加 */
          .text-3xl {
            font-size: 1.875rem !important;
            line-height: 2.25rem !important;
          }
          
          /* インライン要素 */
          .inline {
            display: inline !important;
          }
          
          .mr-1 {
            margin-right: 0.25rem !important;
          }
          
          /* Variantスタイル */
          .variant-outline {
            background-color: transparent !important;
            border: 1px solid currentColor !important;
          }
          
          .variant-secondary {
            background-color: #fed7aa !important;
            color: #7c2d12 !important;
          }
          
          /* その他のユーティリティクラス */
          .relative {
            position: relative !important;
          }
          
          .absolute {
            position: absolute !important;
          }
          
          .inset-0 {
            inset: 0px !important;
          }
          
          .-top-1 {
            top: -0.25rem !important;
          }
          
          .-right-1 {
            right: -0.25rem !important;
          }
          
          .opacity-0 {
            opacity: 0 !important;
          }
          
          .opacity-75 {
            opacity: 0.75 !important;
          }
          
          .rounded-full {
            border-radius: 9999px !important;
          }
          
          .w-3 {
            width: 0.75rem !important;
          }
          
          .h-3 {
            height: 0.75rem !important;
          }
          
          .w-4 {
            width: 1rem !important;
          }
          
          .h-4 {
            height: 1rem !important;
          }
          
          .w-5 {
            width: 1.25rem !important;
          }
          
          .h-5 {
            height: 1.25rem !important;
          }
          
          .w-12 {
            width: 3rem !important;
          }
          
          .h-12 {
            height: 3rem !important;
          }
          
          .bg-green-400 {
            background-color: #4ade80 !important;
          }
          
          .bg-red-400 {
            background-color: #f87171 !important;
          }
          
          .text-white {
            color: #ffffff !important;
          }
          
          .border-2 {
            border-width: 2px !important;
          }
          
          .border-white {
            border-color: #ffffff !important;
          }
          
          .bg-gradient-to-r {
            background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important;
          }
          
          .from-orange-50 {
            --tw-gradient-from: #fff7ed !important;
            --tw-gradient-to: rgb(255 247 237 / 0) !important;
            --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
          }
          
          .to-yellow-50 {
            --tw-gradient-to: #fefce8 !important;
          }
          
          .max-w-7xl {
            max-width: 80rem !important;
          }
          
          .mx-auto {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          .mt-1 {
            margin-top: 0.25rem !important;
          }
          
          .bg-white\/80 {
            background-color: rgb(255 255 255 / 0.8) !important;
          }
          
          .backdrop-blur-sm {
            backdrop-filter: blur(4px) !important;
          }
          
          .transition-colors {
            transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-duration: 150ms !important;
          }
          
          .transition-all {
            transition-property: all !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-duration: 150ms !important;
          }
          
          .duration-200 {
            transition-duration: 200ms !important;
          }
          
          .group:hover .group-hover\:opacity-100 {
            opacity: 1 !important;
          }
          
          .group:hover .group-hover\:text-orange-600 {
            color: #ea580c !important;
          }
          
          .group:hover .group-hover\:text-orange-700 {
            color: #c2410c !important;
          }
          
          .hover\:bg-orange-50:hover {
            background-color: #fff7ed !important;
          }
          
          .hover\:text-orange-800:hover {
            color: #9a3412 !important;
          }
          
          .hover\:bg-orange-600:hover {
            background-color: #ea580c !important;
          }
          
          .hover\:text-orange-700:hover {
            color: #c2410c !important;
          }
          
          .px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
          
          .py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .px-4 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          .py-3 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          
          .p-3 {
            padding: 0.75rem !important;
          }
          
          .p-2 {
            padding: 0.5rem !important;
          }
          
          .pb-4 {
            padding-bottom: 1rem !important;
          }
          
          .space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }
          
          .border {
            border-width: 1px !important;
          }
          
          .border-t {
            border-top-width: 1px !important;
          }
          
          .text-orange-500 {
            color: #f97316 !important;
          }
          
          .bg-orange-500 {
            background-color: #f97316 !important;
          }
          
          .text-xl {
            font-size: 1.25rem !important;
            line-height: 1.75rem !important;
          }
          
          .gap-2 {
            gap: 0.5rem !important;
          }
          
          .transition-opacity {
            transition-property: opacity !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-duration: 150ms !important;
          }
          
          /* レスポンシブコンテナ */
          .w-full {
            width: 100% !important;
          }
          
          .h-full {
            height: 100% !important;
          }
          
          /* グラフ用スタイル */
          .recharts-wrapper {
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Badge用スタイル */
          [role="status"], .badge {
            display: inline-flex !important;
            align-items: center !important;
            border-radius: 0.375rem !important;
            padding: 0.125rem 0.625rem !important;
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            line-height: 1rem !important;
            border: 1px solid transparent !important;
          }
          
          /* Button用スタイル */
          button {
            cursor: pointer !important;
          }
          
          /* アニメーション追加 */
          .transition-all {
            transition-property: all !important;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
            transition-duration: 150ms !important;
          }
          
          .duration-200 {
            transition-duration: 200ms !important;
          }
          
          /* 特定のセレクタ修正 */
          [data-slot="card"] {
            background-color: #ffffff !important;
            color: #7c2d12 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
            border-radius: 0.75rem !important;
            border: 1px solid #fde8d6 !important;
          }
          
          [data-slot="card-header"] {
            display: grid !important;
            grid-auto-rows: min-content !important;
            grid-template-rows: auto auto !important;
            align-items: start !important;
            gap: 0.375rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            padding-top: 1.5rem !important;
          }
          
          [data-slot="card-title"] {
            line-height: 1 !important;
            font-size: 1.125rem !important;
            font-weight: 600 !important;
          }
          
          [data-slot="card-description"] {
            color: #a16207 !important;
            font-size: 0.875rem !important;
          }
          
          [data-slot="card-content"] {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          [data-slot="card-content"]:last-child {
            padding-bottom: 1.5rem !important;
          }
          
          /* クラスの組み合わせ */
          .cute-card.hover\:shadow-lg:hover {
            box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.15), 0 4px 6px -4px rgba(249, 115, 22, 0.1) !important;
          }
          
          /* ボタンの詳細スタイル */
          .bg-orange-500.hover\:bg-orange-600:hover {
            background-color: #ea580c !important;
          }
          
          /* サイドナビゲーションの修正 */
          .w-64.bg-white.border-r.border-orange-200.flex.flex-col.gentle-shadow.flex-shrink-0 {
            width: 16rem !important;
            min-width: 16rem !important;
            max-width: 16rem !important;
            background-color: #ffffff !important;
            border-right: 1px solid #fed7aa !important;
            display: flex !important;
            flex-direction: column !important;
            flex-shrink: 0 !important;
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15) !important;
          }
          
          /* ボタンの追加スタイル */
          button.cute-button {
            cursor: pointer !important;
            border-radius: 0.75rem !important;
            transition: all 0.3s ease !important;
            font-weight: 500 !important;
            border: none !important;
            outline: none !important;
          }
          
          button.cute-button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
          }
          
          button.cute-button:active {
            transform: translateY(0) !important;
          }
          
          /* リンクボタンのスタイル */
          button[style*="font-size: 14px"] {
            font-size: 0.875rem !important;
          }
          
          /* レスポンシブデザイン */
          @media (max-width: 767px) {
            .min-h-screen.warm-gradient.flex {
              flex-direction: column !important;
            }
            
            .w-64 {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 100% !important;
            }
            
            .md\:grid-cols-2 {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
            
            .lg\:grid-cols-4 {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
          }
          
          /* カードのホバー効果 */
          .cute-card {
            transition: all 0.2s ease !important;
          }
          
          .cute-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15) !important;
          }
          
          /* アイコンのサイズ調整 */
          .w-5.h-5 {
            width: 1.25rem !important;
            height: 1.25rem !important;
          }
          
          .w-4.h-4 {
            width: 1rem !important;
            height: 1rem !important;
          }
          
          .w-6.h-6 {
            width: 1.5rem !important;
            height: 1.5rem !important;
          }
          
          .w-16.h-16 {
            width: 4rem !important;
            height: 4rem !important;
          }
          
          /* フレックスボックスの調整 */
          .flex-1 {
            flex: 1 1 0% !important;
            min-width: 0 !important;
          }
          
          .items-start {
            align-items: flex-start !important;
          }
          
          .self-start {
            align-self: flex-start !important;
          }
          
          .justify-self-end {
            justify-self: end !important;
          }
          
          /* グラデーションの強化 */
          .bg-gradient-to-r.from-orange-50.to-yellow-50 {
            background: linear-gradient(to right, #fff7ed 0%, #fefce8 100%) !important;
          }
          
          /* テキストアラインメント */
          .text-right {
            text-align: right !important;
          }
          
          .text-center {
            text-align: center !important;
          }
          
          /* 表示関連 */
          .block {
            display: block !important;
          }
          
          .inline-block {
            display: inline-block !important;
          }
          
          .hidden {
            display: none !important;
          }
          
          /* leading-none */
          .leading-none {
            line-height: 1 !important;
          }
          
          /* ポジション */
          .col-start-2 {
            grid-column-start: 2 !important;
          }
          
          .row-span-2 {
            grid-row: span 2 / span 2 !important;
          }
          
          .row-start-1 {
            grid-row-start: 1 !important;
          }
          
          /* グリッド関連 */
          .auto-rows-min {
            grid-auto-rows: min-content !important;
          }
          
          .grid-rows-\[auto_auto\] {
            grid-template-rows: auto auto !important;
          }
          
          /* ボーダー関連 */
          .border-t {
            border-top-width: 1px !important;
            border-top-style: solid !important;
          }
          
          .border-b {
            border-bottom-width: 1px !important;
            border-bottom-style: solid !important;
          }
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          // CSS適用チェック
          window.addEventListener('load', function() {
            const mainContainer = document.querySelector('.min-h-screen.warm-gradient.flex');
            const sidebar = document.querySelector('.w-64.bg-white.border-r.border-orange-200.flex.flex-col');
            
            if (mainContainer) {
              const styles = window.getComputedStyle(mainContainer);
              console.log('=== CSS適用チェック ===');
              console.log('メインコンテナ display:', styles.display);
              console.log('メインコンテナ flex-direction:', styles.flexDirection);
              console.log('メインコンテナ min-height:', styles.minHeight);
            }
            
            if (sidebar) {
              const styles = window.getComputedStyle(sidebar);
              console.log('サイドバー display:', styles.display);
              console.log('サイドバー width:', styles.width);
              console.log('サイドバー flex-direction:', styles.flexDirection);
            }
            
            // Tailwind CSSファイルの確認
            const styleSheets = Array.from(document.styleSheets);
            console.log('読み込まれたCSSファイル数:', styleSheets.length);
            styleSheets.forEach((sheet, index) => {
              try {
                console.log(\`CSS[\${index}]: \${sheet.href || 'インライン'}\`);
              } catch (e) {
                console.log(\`CSS[\${index}]: アクセス不可\`);
              }
            });
          });
        ` }} />
      </head>
      <body className={`${mPlusRounded1c.variable} ${mPlusRounded1c.className}`}>{children}</body>
    </html>
  )
}