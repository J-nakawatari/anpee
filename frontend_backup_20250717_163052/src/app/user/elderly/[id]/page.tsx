'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  MessageCircle, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Heart
} from 'lucide-react'

// ダミーデータ
const dummyElderlyDetail = {
  id: 1,
  name: "田中 花子",
  phone: "090-1234-5678",
  address: "東京都千代田区千代田1-1",
  emergencyContact: "090-9876-5432",
  medicalInfo: "高血圧の薬を服用中\nかかりつけ医：田中内科クリニック",
  checkTime: "08:00",
  enableLineNotification: true,
  enablePhoneCall: true,
  status: 'responded' as const,
  lastResponseTime: "07:30",
  lastResponseDate: "2024年7月16日",
  createdAt: "2024年6月1日",
  responseHistory: [
    { date: "2024年7月16日", time: "07:30", status: "responded", method: "LINE" },
    { date: "2024年7月15日", time: "07:45", status: "responded", method: "LINE" },
    { date: "2024年7月14日", time: "08:15", status: "responded", method: "電話" },
    { date: "2024年7月13日", time: "08:00", status: "no_response", method: "電話" },
    { date: "2024年7月12日", time: "07:55", status: "responded", method: "LINE" },
  ]
}

export default function ElderlyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [elderlyData, setElderlyData] = useState(dummyElderlyDetail)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'responded':
        return <Badge className="bg-green-100 text-green-800">応答済み</Badge>
      case 'no_response':
        return <Badge className="bg-red-100 text-red-800">未応答</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800">待機中</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'no_response':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-amber-600" />
    }
  }

  const handleDelete = () => {
    // 削除処理
    console.log('削除処理')
    router.push('/user/elderly')
  }

  return (
    <DashboardLayout activeItem="elderly">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/user/elderly/${params.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">{elderlyData.name}</h1>
            {getStatusBadge(elderlyData.status)}
          </div>
          <p className="text-gray-600 mt-2">
            最終応答：{elderlyData.lastResponseDate} {elderlyData.lastResponseTime}
          </p>
        </div>

        {/* タブコンテンツ */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="history">応答履歴</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">電話番号</p>
                      <p className="font-medium">{elderlyData.phone || '未登録'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">住所</p>
                      <p className="font-medium">{elderlyData.address || '未登録'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">緊急連絡先</p>
                      <p className="font-medium">{elderlyData.emergencyContact || '未登録'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">登録日</p>
                      <p className="font-medium">{elderlyData.createdAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 医療情報 */}
              <Card>
                <CardHeader>
                  <CardTitle>医療情報・備考</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {elderlyData.medicalInfo || '情報なし'}
                  </p>
                </CardContent>
              </Card>

              {/* 通知設定 */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>通知設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">安否確認時刻</p>
                        <p className="text-sm text-gray-600">毎日この時刻に通知を送信します</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold">{elderlyData.checkTime}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">LINE通知</p>
                          <p className="text-sm text-gray-600">LINEで安否確認</p>
                        </div>
                      </div>
                      <Badge className={elderlyData.enableLineNotification ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {elderlyData.enableLineNotification ? '有効' : '無効'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">自動架電</p>
                          <p className="text-sm text-gray-600">応答がない場合に架電</p>
                        </div>
                      </div>
                      <Badge className={elderlyData.enablePhoneCall ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                        {elderlyData.enablePhoneCall ? '有効' : '無効'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 応答履歴タブ */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>応答履歴</CardTitle>
                <CardDescription>
                  過去30日間の応答記録
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {elderlyData.responseHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(history.status)}
                        <div>
                          <p className="font-medium">{history.date}</p>
                          <p className="text-sm text-gray-600">{history.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{history.method}</Badge>
                        {getStatusBadge(history.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 設定タブ */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>詳細設定</CardTitle>
                <CardDescription>
                  通知や応答に関する詳細な設定を行います
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    設定を変更するには編集ボタンをクリックしてください
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push(`/user/elderly/${params.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編集画面へ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 削除確認ダイアログ */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>削除の確認</CardTitle>
                <CardDescription>
                  {elderlyData.name}さんの情報を削除してもよろしいですか？
                  この操作は取り消せません。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  削除する
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}