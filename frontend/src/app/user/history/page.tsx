'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  MessageCircle,
  Download,
  Filter,
  CalendarIcon,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

// ダミーデータ
const dummyHistoryData = [
  {
    id: 1,
    elderlyName: "田中 花子",
    elderlyId: 1,
    date: "2024-07-16",
    time: "07:30",
    status: "responded",
    method: "LINE",
    responseTime: "3分",
  },
  {
    id: 2,
    elderlyName: "佐藤 太郎",
    elderlyId: 2,
    date: "2024-07-16",
    time: "08:00",
    status: "no_response",
    method: "電話",
    callDuration: "未応答",
  },
  {
    id: 3,
    elderlyName: "山田 梅子",
    elderlyId: 3,
    date: "2024-07-15",
    time: "07:45",
    status: "responded",
    method: "LINE",
    responseTime: "5分",
  },
  {
    id: 4,
    elderlyName: "田中 花子",
    elderlyId: 1,
    date: "2024-07-15",
    time: "07:45",
    status: "responded",
    method: "LINE",
    responseTime: "15分",
  },
  {
    id: 5,
    elderlyName: "佐藤 太郎",
    elderlyId: 2,
    date: "2024-07-14",
    time: "08:15",
    status: "responded",
    method: "電話",
    callDuration: "2分30秒",
  },
]

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState(dummyHistoryData)
  const [filterElderly, setFilterElderly] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<any>({
    from: undefined,
    to: undefined
  })

  // フィルタリング
  const filteredHistory = historyData.filter(item => {
    const elderlyMatch = filterElderly === 'all' || item.elderlyId.toString() === filterElderly
    const statusMatch = filterStatus === 'all' || item.status === filterStatus
    return elderlyMatch && statusMatch
  })

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
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'no_response':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-amber-600" />
    }
  }

  const getMethodIcon = (method: string) => {
    return method === 'LINE' ? (
      <MessageCircle className="w-4 h-4 text-green-600" />
    ) : (
      <Phone className="w-4 h-4 text-blue-600" />
    )
  }

  const handleExport = () => {
    // CSV出力処理
    console.log('履歴をエクスポート')
  }

  return (
    <DashboardLayout activeItem="history">
      <div className="p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">履歴</h1>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              CSV出力
            </Button>
          </div>
          <p className="text-gray-600">
            ご家族の応答履歴を確認できます
          </p>
        </div>

        {/* フィルター */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  家族
                </label>
                <Select value={filterElderly} onValueChange={setFilterElderly}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全員</SelectItem>
                    <SelectItem value="1">田中 花子</SelectItem>
                    <SelectItem value="2">佐藤 太郎</SelectItem>
                    <SelectItem value="3">山田 梅子</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  ステータス
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="responded">応答済み</SelectItem>
                    <SelectItem value="no_response">未応答</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  期間
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "PP", { locale: ja })} -{" "}
                            {format(dateRange.to, "PP", { locale: ja })}
                          </>
                        ) : (
                          format(dateRange.from, "PP", { locale: ja })
                        )
                      ) : (
                        <span>期間を選択</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                      locale={ja}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 履歴リスト */}
        <Card>
          <CardHeader>
            <CardTitle>応答履歴</CardTitle>
            <CardDescription>
              {filteredHistory.length}件の記録
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">履歴がありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{item.elderlyName}</h3>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(item.date), 'yyyy年MM月dd日', { locale: ja })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.time}
                            </span>
                            <span className="flex items-center gap-1">
                              {getMethodIcon(item.method)}
                              {item.method}
                            </span>
                          </div>
                          {item.responseTime && (
                            <p className="text-sm text-gray-600 mt-1">
                              応答時間: {item.responseTime}
                            </p>
                          )}
                          {item.callDuration && (
                            <p className="text-sm text-gray-600 mt-1">
                              通話時間: {item.callDuration}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}