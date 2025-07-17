'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  Home, 
  Users, 
  AlertCircle,
  BarChart3,
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminLayoutProps {
  children: React.ReactNode
  activeItem: string
}

const menuItems = [
  { id: 'dashboard', label: 'ダッシュボード', icon: Home, href: '/admin/dashboard' },
  { id: 'users', label: 'ユーザー管理', icon: Users, href: '/admin/users' },
  { id: 'alerts', label: '未応答アラート', icon: AlertCircle, href: '/admin/alerts' },
  { id: 'analytics', label: '統計分析', icon: BarChart3, href: '/admin/analytics' },
  { id: 'system', label: 'システムログ', icon: Activity, href: '/admin/system' },
  { id: 'settings', label: '管理設定', icon: Settings, href: '/admin/settings' },
]

export function AdminLayout({ children, activeItem }: AdminLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
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
            <Shield className="w-6 h-6 text-peach-500" />
            <span className="font-semibold text-peach-700">管理者画面</span>
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
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            {/* ロゴ */}
            <div className="p-6 border-b border-gray-800">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-peach-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-peach-500" />
                </div>
                <div>
                  <h1 className="font-bold text-white">あんぴーちゃん</h1>
                  <p className="text-xs text-gray-400">管理者コンソール</p>
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
                            ? 'bg-peach-500 text-white' 
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
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