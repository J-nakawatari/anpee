'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ElderlyStatusCard } from '@/components/dashboard/ElderlyStatusCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Search, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ダミーデータ（実際はAPIから取得）
const dummyElderlyData = [
  {
    id: 1,
    name: "田中 花子",
    status: 'responded' as const,
    lastResponseTime: "07:30",
    lastResponseDate: "2024年7月14日",
    genKiButtonTime: "07:30",
    avatar: null
  },
  {
    id: 2,
    name: "佐藤 太郎",
    status: 'no_response' as const,
    lastResponseTime: "08:00",
    lastResponseDate: "2024年7月13日",
    callDuration: "未応答",
    avatar: null
  },
  {
    id: 3,
    name: "山田 梅子",
    status: 'pending' as const,
    lastResponseTime: "18:00",
    lastResponseDate: "2024年7月13日",
    avatar: null
  }
]

export default function ElderlyListPage() {
  const router = useRouter()
  const [elderlyList, setElderlyList] = useState(dummyElderlyData)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredList = elderlyList.filter(elderly =>
    elderly.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout activeItem="elderly">
      <div className="p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">家族管理</h1>
            <Button 
              className="cute-button"
              onClick={() => router.push('/user/elderly/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              新規登録
            </Button>
          </div>
          <p className="text-gray-600">
            登録済みのご家族：{elderlyList.length}名
          </p>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="お名前で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 家族リスト */}
        <div>
          {filteredList.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-sm mx-auto">
                {searchQuery ? (
                  <>
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      検索結果がありません
                    </h3>
                    <p className="text-gray-600">
                      別のキーワードでお試しください
                    </p>
                  </>
                ) : (
                  <>
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      まだ家族が登録されていません
                    </h3>
                    <p className="text-gray-600 mb-6">
                      大切なご家族を登録して、見守りを始めましょう
                    </p>
                    <Button 
                      className="cute-button"
                      onClick={() => router.push('/user/elderly/new')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新規登録
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredList.map((elderly) => (
                <ElderlyStatusCard
                  key={elderly.id}
                  name={elderly.name}
                  status={elderly.status}
                  lastResponseTime={elderly.lastResponseTime}
                  lastResponseDate={elderly.lastResponseDate}
                  genKiButtonTime={elderly.genKiButtonTime}
                  callDuration={elderly.callDuration}
                  avatar={elderly.avatar}
                  onDetailClick={() => router.push(`/user/elderly/${elderly.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}