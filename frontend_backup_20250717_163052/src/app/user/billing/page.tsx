'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Check, 
  X,
  Calendar,
  Users,
  Zap,
  Shield,
  Star,
  AlertCircle,
  Receipt
} from 'lucide-react'

// プランデータ
const plans = [
  {
    id: 'free',
    name: 'フリープラン',
    price: 0,
    description: 'まずはお試しで使ってみたい方に',
    features: [
      { text: '家族1名まで登録可能', enabled: true },
      { text: 'LINE通知', enabled: true },
      { text: '自動架電', enabled: false },
      { text: '応答履歴（7日間）', enabled: true },
      { text: 'カスタマーサポート', enabled: false },
    ],
    current: true
  },
  {
    id: 'standard',
    name: 'スタンダードプラン',
    price: 980,
    description: '複数の家族を見守りたい方に',
    features: [
      { text: '家族3名まで登録可能', enabled: true },
      { text: 'LINE通知', enabled: true },
      { text: '自動架電（月30回まで）', enabled: true },
      { text: '応答履歴（30日間）', enabled: true },
      { text: 'メールサポート', enabled: true },
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'プレミアムプラン',
    price: 2980,
    description: '充実した見守り機能をご利用いただけます',
    features: [
      { text: '家族無制限登録', enabled: true },
      { text: 'LINE通知', enabled: true },
      { text: '自動架電（無制限）', enabled: true },
      { text: '応答履歴（無制限）', enabled: true },
      { text: '優先サポート', enabled: true },
    ]
  }
]

// 請求履歴ダミーデータ
const billingHistory = [
  {
    id: 1,
    date: '2024年7月1日',
    description: 'フリープラン',
    amount: 0,
    status: 'paid'
  },
  {
    id: 2,
    date: '2024年6月1日',
    description: 'フリープラン',
    amount: 0,
    status: 'paid'
  }
]

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePlanChange = (planId: string) => {
    if (planId !== 'free') {
      setSelectedPlan(planId)
      setShowUpgradeDialog(true)
    }
  }

  const handleUpgrade = async () => {
    setIsProcessing(true)
    try {
      // Stripe決済処理
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowUpgradeDialog(false)
    } catch (error) {
      console.error('決済エラー:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout activeItem="billing">
      <div className="p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">課金管理</h1>
          <p className="text-gray-600 mt-2">
            プランの確認と変更、お支払い履歴の確認ができます
          </p>
        </div>

        {/* 現在のプラン */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                現在のプラン
              </span>
              <Badge className="bg-blue-600 text-white">アクティブ</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">フリープラン</h3>
                <p className="text-gray-600 mt-1">次回更新日：2024年8月1日</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">¥0</p>
                <p className="text-sm text-gray-600">/月</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* プラン一覧 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">プランを選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${plan.current ? 'border-blue-500 border-2' : ''} ${plan.recommended ? 'border-green-500' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      おすすめ
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">¥{plan.price.toLocaleString()}</span>
                    <span className="text-gray-600">/月</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.enabled ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={feature.enabled ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={plan.current ? '' : 'w-full cute-button'}
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    {plan.current ? '現在のプラン' : 'このプランに変更'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 支払い方法 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              お支払い方法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                お支払い方法が登録されていません。プランをアップグレードする際に登録が必要です。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 請求履歴 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              請求履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">¥{item.amount.toLocaleString()}</span>
                    <Badge className="bg-green-100 text-green-800">支払済み</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* アップグレードダイアログ */}
        {showUpgradeDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>プランのアップグレード</CardTitle>
                <CardDescription>
                  {plans.find(p => p.id === selectedPlan)?.name}に変更します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-lg font-semibold mb-2">
                    月額 ¥{plans.find(p => p.id === selectedPlan)?.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    次回請求日：2024年8月1日
                  </p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowUpgradeDialog(false)}
                    disabled={isProcessing}
                  >
                    キャンセル
                  </Button>
                  <Button
                    className="cute-button"
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '処理中...' : '支払い情報を入力'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}