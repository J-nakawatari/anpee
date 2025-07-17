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
            --color-white: #ffffff;
            --color-orange-200: #fed7aa;
            --spacing: 0.25rem;
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
          
          .px-6 {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          .py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
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