'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertCircle, 
  Clock, 
  Phone, 
  MessageCircle,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Bell,
  Filter,
  RefreshCw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ダミーアラートデータ
const dummyAlerts = [
  {
    id: 1,
    elderlyName: '山田 花子',
    elderlyPhone: '090-1234-5678',
    userName: '山田 太郎',
    userEmail: 'yamada@example.com',
    userPhone: '090-8765-4321',
    checkTime: '08:00',
    alertTime: '09:30',
    duration: '1時間30分',
    status: 'critical',
    attempts: {
      line: 3,
      phone: 2
    },
    lastAttempt: '09:25'
  },
  {
    id: 2,
    elderlyName: '佐藤 梅子',
    elderlyPhone: '090-2345-6789',
    userName: '佐藤 次郎',
    userEmail: 'sato@example.com',
    userPhone: '090-7654-3210',
    checkTime: '07:30',
    alertTime: '08:45',
    duration: '1時間15分',
    status: 'warning',
    attempts: {
      line: 2,
      phone: 0
    },
    lastAttempt: '08:40'
  },
  {
    id: 3,
    elderlyName: '鈴木 竹子',
    elderlyPhone: '090-3456-7890',
    userName: '鈴木 三郎',
    userEmail: 'suzuki@example.com',
    userPhone: '090-6543-2109',
    checkTime: '09:00',
    alertTime: '10:00',
    duration: '1時間',
    status: 'resolved',
    attempts: {
      line: 1,
      phone: 1
    },
    lastAttempt: '09:55',
    resolvedAt: '10:05'
  }
]

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(dummyAlerts)
  const [filterStatus, setFilterStatus] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus === 'all') return true
    return alert.status === filterStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">緊急</Badge>
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800">警告</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">解決済み</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return null
    }
  }

  const handleResolve = (alertId: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved', resolvedAt: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }
        : alert
    ))
  }

  const handleContactUser = (alert: any) => {
    // ユーザーへの連絡処理
    console.log('ユーザーに連絡:', alert.userName)
  }

  const handleContactElderly = (alert: any) => {
    // 高齢者への直接連絡処理
    console.log('高齢者に直接連絡:', alert.elderlyName)
  }

  return (
    <AdminLayout activeItem="alerts">
      <div className="p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">未応答アラート</h1>
              <p className="text-gray-600 mt-2">
                応答がない高齢者の緊急アラート管理
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                自動更新
              </Button>
            </div>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                緊急アラート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.status === 'critical').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                警告アラート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {alerts.filter(a => a.status === 'warning').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                解決済み（本日）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 重要な通知 */}
        {alerts.filter(a => a.status === 'critical').length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{alerts.filter(a => a.status === 'critical').length}件の緊急アラート</strong>があります。
              至急対応が必要です。
            </AlertDescription>
          </Alert>
        )}

        {/* フィルター */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="critical">緊急</SelectItem>
                <SelectItem value="warning">警告</SelectItem>
                <SelectItem value="resolved">解決済み</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* アラートリスト */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`
              ${alert.status === 'critical' ? 'border-red-300' : ''}
              ${alert.status === 'warning' ? 'border-amber-300' : ''}
              ${alert.status === 'resolved' ? 'border-green-300' : ''}
            `}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(alert.status)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {alert.elderlyName}
                        {getStatusBadge(alert.status)}
                      </CardTitle>
                      <CardDescription>
                        確認時刻: {alert.checkTime} | アラート発生: {alert.alertTime} | 
                        経過時間: <span className="font-semibold text-red-600">{alert.duration}</span>
                      </CardDescription>
                    </div>
                  </div>
                  {alert.status !== 'resolved' && (
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                    >
                      解決済みにする
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 高齢者情報 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700">高齢者情報</h4>
                    <div className="space-y-2">
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {alert.elderlyPhone}
                      </p>
                    </div>
                  </div>

                  {/* ユーザー情報 */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700">登録ユーザー</h4>
                    <div className="space-y-2">
                      <p className="text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {alert.userName}
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {alert.userPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 試行回数 */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">通知試行状況</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">LINE: {alert.attempts.line}回</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">電話: {alert.attempts.phone}回</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">最終試行: {alert.lastAttempt}</span>
                    </div>
                    {alert.resolvedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">解決: {alert.resolvedAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                {alert.status !== 'resolved' && (
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactUser(alert)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      ユーザーに連絡
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContactElderly(alert)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      高齢者に直接連絡
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">アラートはありません</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}