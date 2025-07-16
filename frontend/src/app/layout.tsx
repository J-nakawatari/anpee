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
      <body className={`${mPlusRounded1c.variable} font-sans`}>{children}</body>
    </html>
  )
}