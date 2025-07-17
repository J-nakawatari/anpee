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
      </head>
      <body className={`${mPlusRounded1c.variable} ${mPlusRounded1c.className}`}>{children}</body>
    </html>
  )
}