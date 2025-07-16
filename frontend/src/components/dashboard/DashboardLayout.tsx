'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  Home, 
  Users, 
  History, 
  Bell, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
  activeItem: string
}

const menuItems = [
  { id: 'dashboard', label: 'ダッシュボード', icon: Home, href: '/user/dashboard' },
  { id: 'elderly', label: '高齢者管理', icon: Users, href: '/user/elderly' },
  { id: 'history', label: '履歴', icon: History, href: '/user/history' },
  { id: 'notifications', label: '通知設定', icon: Bell, href: '/user/notifications' },
  { id: 'billing', label: '課金管理', icon: CreditCard, href: '/user/billing' },
  { id: 'account', label: 'アカウント設定', icon: Settings, href: '/user/account' },
]

export function DashboardLayout({ children, activeItem }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    // ログアウト処理
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* モバイル用ヘッダー */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-peach-500" />
            <span className="font-semibold text-peach-700">あんぴーちゃん</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* サイドバー */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            {/* ロゴ */}
            <div className="p-6 border-b border-gray-200">
              <Link href="/user/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-peach-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-peach-500" />
                </div>
                <div>
                  <h1 className="font-bold text-peach-700">あんぴーちゃん</h1>
                  <p className="text-xs text-gray-600">見守りサービス</p>
                </div>
              </Link>
            </div>

            {/* メニュー */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeItem === item.id
                  
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                          ${isActive 
                            ? 'bg-peach-50 text-peach-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* ログアウト */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </aside>

        {/* オーバーレイ */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}