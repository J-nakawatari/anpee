'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ElderlyStatusCard } from '@/components/dashboard/ElderlyStatusCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
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
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [elderlyList, setElderlyList] = useState(dummyElderlyData)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stats = {
    total: elderlyList.length,
    responded: elderlyList.filter(e => e.status === 'responded').length,
    noResponse: elderlyList.filter(e => e.status === 'no_response').length,
    pending: elderlyList.filter(e => e.status === 'pending').length
  }

  return (
    <DashboardLayout activeItem="dashboard">
      <div className="p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
            <Button 
              className="cute-button"
              onClick={() => router.push('/user/elderly/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              新規登録
            </Button>
          </div>
          <p className="text-gray-600">
            {formatDate(currentTime)} {formatTime(currentTime)}
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">登録者数</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}名</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">応答済み</p>
                <p className="text-2xl font-bold text-green-800">{stats.responded}名</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">未応答</p>
                <p className="text-2xl font-bold text-red-800">{stats.noResponse}名</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">待機中</p>
                <p className="text-2xl font-bold text-amber-800">{stats.pending}名</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* 見守り対象者リスト */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">見守り対象者</h2>
          {elderlyList.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-sm mx-auto">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだ見守り対象者が登録されていません
                </h3>
                <p className="text-gray-600 mb-6">
                  大切な家族を登録して、見守りを始めましょう
                </p>
                <Button 
                  className="cute-button"
                  onClick={() => router.push('/user/elderly/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規登録
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {elderlyList.map((elderly) => (
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