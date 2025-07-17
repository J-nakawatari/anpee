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
          /* 重要なレイアウトスタイルを強制的に適用 */
          .min-h-screen.warm-gradient.flex {
            display: flex !important;
            min-height: 100vh !important;
            flex-direction: row !important;
          }
          .w-64.bg-white.border-r.border-orange-200.flex.flex-col {
            width: 16rem !important;
            display: flex !important;
            flex-direction: column !important;
            flex-shrink: 0 !important;
          }
          .flex-1.flex.flex-col {
            flex: 1 1 0% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          /* 基本的なflexクラス */
          .flex { display: flex !important; }
          .flex-col { flex-direction: column !important; }
          .flex-1 { flex: 1 1 0% !important; }
          .w-64 { width: 16rem !important; }
          .min-h-screen { min-height: 100vh !important; }
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