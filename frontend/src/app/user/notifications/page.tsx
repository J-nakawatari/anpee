'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Volume2,
  Smartphone,
  Save,
  AlertCircle
} from 'lucide-react'

export default function NotificationsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  // 通知設定の状態
  const [settings, setSettings] = useState({
    // LINE設定
    lineEnabled: true,
    lineRetryCount: '3',
    lineRetryInterval: '10',
    
    // 電話設定
    phoneEnabled: true,
    phoneDelay: '30',
    phoneRetryCount: '2',
    phoneNumber: '090-1234-5678',
    
    // メール設定
    emailEnabled: false,
    emailAddress: 'user@example.com',
    emailDelay: '60',
    
    // 通知時間設定
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
    
    // アラート設定
    urgentAlertEnabled: true,
    urgentAlertDelay: '60',
    adminNotificationEnabled: true
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
    } catch (error) {
      console.error('保存エラー:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout activeItem="notifications">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">通知設定</h1>
          <p className="text-gray-600 mt-2">
            安否確認の通知方法と条件を設定します
          </p>
        </div>

        {/* 保存メッセージ */}
        {showSaveMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">設定を保存しました</p>
          </div>
        )}

        <Tabs defaultValue="methods" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="methods">通知方法</TabsTrigger>
            <TabsTrigger value="conditions">通知条件</TabsTrigger>
            <TabsTrigger value="alerts">アラート</TabsTrigger>
          </TabsList>

          {/* 通知方法タブ */}
          <TabsContent value="methods" className="space-y-4">
            {/* LINE通知 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  LINE通知
                </CardTitle>
                <CardDescription>
                  LINEで安否確認メッセージを送信します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="line-enabled">LINE通知を有効にする</Label>
                  <Switch
                    id="line-enabled"
                    checked={settings.lineEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, lineEnabled: checked })
                    }
                  />
                </div>
                
                {settings.lineEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="line-retry">再送信回数</Label>
                        <Select
                          value={settings.lineRetryCount}
                          onValueChange={(value) => 
                            setSettings({ ...settings, lineRetryCount: value })
                          }
                        >
                          <SelectTrigger id="line-retry">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1回</SelectItem>
                            <SelectItem value="2">2回</SelectItem>
                            <SelectItem value="3">3回</SelectItem>
                            <SelectItem value="5">5回</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="line-interval">再送信間隔（分）</Label>
                        <Select
                          value={settings.lineRetryInterval}
                          onValueChange={(value) => 
                            setSettings({ ...settings, lineRetryInterval: value })
                          }
                        >
                          <SelectTrigger id="line-interval">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5分</SelectItem>
                            <SelectItem value="10">10分</SelectItem>
                            <SelectItem value="15">15分</SelectItem>
                            <SelectItem value="30">30分</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 電話通知 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  自動架電
                </CardTitle>
                <CardDescription>
                  応答がない場合、自動で電話をかけます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone-enabled">自動架電を有効にする</Label>
                  <Switch
                    id="phone-enabled"
                    checked={settings.phoneEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, phoneEnabled: checked })
                    }
                  />
                </div>
                
                {settings.phoneEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="phone-number">架電先電話番号</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={settings.phoneNumber}
                        onChange={(e) => 
                          setSettings({ ...settings, phoneNumber: e.target.value })
                        }
                        placeholder="090-1234-5678"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone-delay">架電開始時間（分）</Label>
                        <Select
                          value={settings.phoneDelay}
                          onValueChange={(value) => 
                            setSettings({ ...settings, phoneDelay: value })
                          }
                        >
                          <SelectTrigger id="phone-delay">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15分後</SelectItem>
                            <SelectItem value="30">30分後</SelectItem>
                            <SelectItem value="45">45分後</SelectItem>
                            <SelectItem value="60">60分後</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone-retry">再架電回数</Label>
                        <Select
                          value={settings.phoneRetryCount}
                          onValueChange={(value) => 
                            setSettings({ ...settings, phoneRetryCount: value })
                          }
                        >
                          <SelectTrigger id="phone-retry">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1回</SelectItem>
                            <SelectItem value="2">2回</SelectItem>
                            <SelectItem value="3">3回</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* メール通知 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-600" />
                  メール通知
                </CardTitle>
                <CardDescription>
                  指定したメールアドレスに通知を送信します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">メール通知を有効にする</Label>
                  <Switch
                    id="email-enabled"
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, emailEnabled: checked })
                    }
                  />
                </div>
                
                {settings.emailEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="email-address">通知先メールアドレス</Label>
                      <Input
                        id="email-address"
                        type="email"
                        value={settings.emailAddress}
                        onChange={(e) => 
                          setSettings({ ...settings, emailAddress: e.target.value })
                        }
                        placeholder="example@email.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email-delay">送信タイミング（分）</Label>
                      <Select
                        value={settings.emailDelay}
                        onValueChange={(value) => 
                          setSettings({ ...settings, emailDelay: value })
                        }
                      >
                        <SelectTrigger id="email-delay">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30分後</SelectItem>
                          <SelectItem value="60">60分後</SelectItem>
                          <SelectItem value="120">2時間後</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知条件タブ */}
          <TabsContent value="conditions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  通知時間制限
                </CardTitle>
                <CardDescription>
                  指定した時間帯は通知を停止します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">通知停止時間を設定する</Label>
                  <Switch
                    id="quiet-hours"
                    checked={settings.quietHoursEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, quietHoursEnabled: checked })
                    }
                  />
                </div>
                
                {settings.quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="quiet-start">開始時刻</Label>
                      <Select
                        value={settings.quietHoursStart}
                        onValueChange={(value) => 
                          setSettings({ ...settings, quietHoursStart: value })
                        }
                      >
                        <SelectTrigger id="quiet-start">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0')
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quiet-end">終了時刻</Label>
                      <Select
                        value={settings.quietHoursEnd}
                        onValueChange={(value) => 
                          setSettings({ ...settings, quietHoursEnd: value })
                        }
                      >
                        <SelectTrigger id="quiet-end">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0')
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* アラートタブ */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600" />
                  緊急アラート
                </CardTitle>
                <CardDescription>
                  長時間応答がない場合の緊急通知設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="urgent-alert">緊急アラートを有効にする</Label>
                  <Switch
                    id="urgent-alert"
                    checked={settings.urgentAlertEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, urgentAlertEnabled: checked })
                    }
                  />
                </div>
                
                {settings.urgentAlertEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="urgent-delay">アラート発動時間（分）</Label>
                      <Select
                        value={settings.urgentAlertDelay}
                        onValueChange={(value) => 
                          setSettings({ ...settings, urgentAlertDelay: value })
                        }
                      >
                        <SelectTrigger id="urgent-delay">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60分</SelectItem>
                          <SelectItem value="90">90分</SelectItem>
                          <SelectItem value="120">2時間</SelectItem>
                          <SelectItem value="180">3時間</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="admin-notification">管理者への通知</Label>
                        <p className="text-sm text-gray-600">
                          緊急時にサービス管理者にも通知します
                        </p>
                      </div>
                      <Switch
                        id="admin-notification"
                        checked={settings.adminNotificationEnabled}
                        onCheckedChange={(checked) => 
                          setSettings({ ...settings, adminNotificationEnabled: checked })
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 保存ボタン */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="cute-button"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '設定を保存'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}