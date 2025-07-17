'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Calendar
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// ダミーデータ
const statsData = {
  totalUsers: 1234,
  activeUsers: 987,
  totalElderly: 2456,
  alertsToday: 12,
  revenue: 1234560,
  growthRate: 12.5
}

const responseRateData = [
  { date: '7/10', rate: 95 },
  { date: '7/11', rate: 93 },
  { date: '7/12', rate: 96 },
  { date: '7/13', rate: 91 },
  { date: '7/14', rate: 94 },
  { date: '7/15', rate: 92 },
  { date: '7/16', rate: 95 },
]

const planDistribution = [
  { name: 'フリー', value: 654, color: '#94a3b8' },
  { name: 'スタンダード', value: 432, color: '#60a5fa' },
  { name: 'プレミアム', value: 148, color: '#a78bfa' },
]

const recentAlerts = [
  {
    id: 1,
    userName: '山田 太郎',
    elderlyName: '山田 花子',
    time: '08:30',
    status: 'unresolved'
  },
  {
    id: 2,
    userName: '佐藤 次郎',
    elderlyName: '佐藤 梅子',
    time: '09:15',
    status: 'resolved'
  },
  {
    id: 3,
    userName: '鈴木 三郎',
    elderlyName: '鈴木 竹子',
    time: '10:00',
    status: 'unresolved'
  }
]

export default function AdminDashboardPage() {
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

  return (
    <AdminLayout activeItem="dashboard">
      <div className="p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">管理者ダッシュボード</h1>
          <p className="text-gray-600 mt-2">
            {formatDate(currentTime)} {formatTime(currentTime)}
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                総ユーザー数
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">
                アクティブ: {statsData.activeUsers.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                登録家族数
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalElderly.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">
                平均: {(statsData.totalElderly / statsData.totalUsers).toFixed(1)}人/ユーザー
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                本日のアラート
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statsData.alertsToday}</div>
              <p className="text-xs text-gray-600 mt-1">
                未解決: 3件
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                月間収益
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{statsData.revenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {statsData.growthRate}% 前月比
              </p>
            </CardContent>
          </Card>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 応答率推移 */}
          <Card>
            <CardHeader>
              <CardTitle>応答率推移</CardTitle>
              <CardDescription>過去7日間の応答率</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#22c55e" 
                    name="応答率(%)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* プラン分布 */}
          <Card>
            <CardHeader>
              <CardTitle>プラン分布</CardTitle>
              <CardDescription>ユーザーのプラン内訳</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={planDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 最近のアラート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              最近のアラート
            </CardTitle>
            <CardDescription>
              未応答による緊急アラート
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {alert.status === 'unresolved' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{alert.elderlyName}</p>
                      <p className="text-sm text-gray-600">
                        ユーザー: {alert.userName} | 発生時刻: {alert.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'unresolved' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {alert.status === 'unresolved' ? '未解決' : '解決済み'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}