import type { Metadata } from 'next'
import './globals.css'
import { ToasterProvider } from '@/components/ToasterProvider'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="zen-maru-gothic-medium">
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}