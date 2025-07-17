import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'あんぴーちゃん 見守りサービス',
  description: '大切なご家族の安全を見守るサービス「あんぴーちゃん」のダッシュボード',
  keywords: ['見守り', '高齢者', '安否確認', 'LINE', '電話確認'],
  authors: [{ name: 'あんぴーちゃん' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="m-plus-rounded-1c-medium">
        {children}
      </body>
    </html>
  )
}