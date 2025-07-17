import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'

interface LegalPageLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-peach-600 hover:text-peach-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            トップページに戻る
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-peach-100 rounded-full">
              <Heart className="w-6 h-6 text-peach-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            {children}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2024 あんぴーちゃん. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}