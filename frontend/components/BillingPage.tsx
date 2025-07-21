"use client";

import { useState } from "react";
import { 
  Download, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Crown,
  ExternalLink,
  Settings,
  AlertTriangle,
  Check,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { toast } from "@/lib/toast";
import { availablePlans, getCurrentUserPlan } from "../data/subscriptionPlans";
import { 
  mockBillingHistory, 
  mockSubscriptionInfo,
  getStatusLabel,
  getStatusColor,
  getCardBrandLabel,
  getStripeCustomerPortalUrl,
  downloadInvoice,
  type BillingRecord
} from "../data/billingData";

export function BillingPage() {
  const [currentPlan] = useState(getCurrentUserPlan());
  const [subscriptionInfo] = useState(mockSubscriptionInfo);
  const [billingHistory] = useState<BillingRecord[]>(mockBillingHistory);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPlanDetailDialog, setShowPlanDetailDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleStripePortal = () => {
    const portalUrl = getStripeCustomerPortalUrl(subscriptionInfo.stripeCustomerId);
    window.open(portalUrl, '_blank');
    toast.success('Stripe Customer Portalを開きました');
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    setShowPlanDetailDialog(true);
  };

  const confirmPlanChange = () => {
    if (!selectedPlan) return;
    
    const newPlan = availablePlans.find(p => p.id === selectedPlan);
    if (!newPlan) return;

    // 実際の実装では、Stripe APIを呼び出してプランを変更
    toast.success(`[モック] プランを${newPlan.displayName}に変更しました（実際には変更されません）`);
    setShowPlanDetailDialog(false);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = () => {
    // 実際の実装では、Stripe APIを呼び出して契約をキャンセル
    toast.success('[モック] 契約をキャンセルしました（実際にはキャンセルされません）');
    setShowCancelDialog(false);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    downloadInvoice(invoiceId);
    toast.success('請求書をダウンロードしました');
  };

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'bg-gray-100 text-gray-700';
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: BillingRecord['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // プラン詳細のダミーデータ
  const getPlanDetails = (planId: string) => {
    const planFeatures = {
      standard: {
        features: [
          '登録者数: 1人',
          '1日1回の安否確認',
          '電話＋LINE対応',
          '再通知: 3回まで',
          '通知間隔: 30分/1時間',
          '通話応答記録',
          'メール通知'
        ],
        limitations: [
          '複数人の登録不可'
        ],
        bestFor: '一人暮らしの高齢者の見守りに最適'
      },
      family: {
        features: [
          '登録者数: 最大3人',
          '1日1回×3人分の安否確認',
          '電話＋LINE対応',
          '再通知: 3回まで',
          '通知間隔: 30分/1時間',
          '通話応答記録',
          'メール通知',
          '優先サポート',
          '詳細分析機能'
        ],
        limitations: [],
        bestFor: '兄弟・親子など複数人の見守りに最適'
      }
    };

    return planFeatures[planId as keyof typeof planFeatures] || planFeatures.standard;
  };

  const selectedPlanData = selectedPlan ? availablePlans.find(p => p.id === selectedPlan) : null;
  const selectedPlanDetails = selectedPlan ? getPlanDetails(selectedPlan) : null;

  return (
    <div className="space-y-6">
      {/* 現在のプラン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-blue-600" />
            現在のプラン
          </CardTitle>
          <CardDescription>
            ご契約中のプラン情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={getPlanBadgeColor(currentPlan.id)}>
                {currentPlan.displayName}
              </Badge>
              <div>
                <p className="font-medium text-gray-900">
                  月額 ¥{currentPlan.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  次回請求日: {new Date(subscriptionInfo.nextBillingDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePlanChange('premium')}
              >
                プラン変更（モック）
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleStripePortal}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Stripe Portal
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">プラン特典</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 最大 {currentPlan.features.maxElderlyUsers === -1 ? '無制限' : currentPlan.features.maxElderlyUsers} 人まで登録可能</li>
                <li>• 再通知 {currentPlan.features.maxRetryCount} 回まで</li>
                <li>• {currentPlan.features.retryIntervals.length} 種類の通知間隔</li>
                {currentPlan.features.advancedAnalytics && <li>• 詳細分析機能</li>}
                {currentPlan.features.prioritySupport && <li>• 優先サポート</li>}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">契約情報</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>契約開始日: {new Date(subscriptionInfo.startDate).toLocaleDateString('ja-JP')}</p>
                <p>ステータス: <span className="text-green-600">アクティブ</span></p>
                <p>自動更新: <span className="text-green-600">有効</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 請求履歴 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            請求履歴（モックデータ）
          </CardTitle>
          <CardDescription>
            過去の請求書と支払い状況
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>請求書番号</TableHead>
                  <TableHead>日付</TableHead>
                  <TableHead>プラン</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>支払い方法</TableHead>
                  <TableHead>アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      {record.planName}
                    </TableCell>
                    <TableCell>
                      ¥{record.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.paymentMethod.type === 'card' ? (
                        <span>
                          {getCardBrandLabel(record.paymentMethod.brand || '')} 
                          {record.paymentMethod.last4 && ` ****${record.paymentMethod.last4}`}
                        </span>
                      ) : (
                        '銀行振込'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(record.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        ダウンロード
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* プラン変更・契約管理 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              プラン変更
            </CardTitle>
            <CardDescription>
              より多くの機能をご利用いただけます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availablePlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{plan.displayName}</h4>
                    {plan.isPopular && <Badge variant="secondary">人気</Badge>}
                    {plan.id === currentPlan.id && <Badge>現在のプラン</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">¥{plan.price.toLocaleString()}/月</p>
                </div>
                <Button 
                  variant={plan.id === currentPlan.id ? "secondary" : "outline"}
                  size="sm"
                  disabled={plan.id === currentPlan.id}
                  onClick={() => handlePlanChange(plan.id)}
                >
                  {plan.id === currentPlan.id ? "現在のプラン" : "詳細を見る"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              契約管理
            </CardTitle>
            <CardDescription>
              契約の一時停止やキャンセル
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                契約をキャンセルすると、現在の請求期間の終了時にサービスが停止されます。
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                契約を一時停止
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setShowCancelDialog(true)}
              >
                契約をキャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* キャンセル確認ダイアログ */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>契約をキャンセルしますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消すことができません。現在の請求期間の終了時（{new Date(subscriptionInfo.nextBillingDate).toLocaleDateString('ja-JP')}）にサービスが停止されます。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              契約をキャンセル
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* プラン詳細ダイアログ */}
      <Dialog open={showPlanDetailDialog} onOpenChange={setShowPlanDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlanData && (
                <>
                  <Badge className={getPlanBadgeColor(selectedPlanData.id)}>
                    {selectedPlanData.displayName}
                  </Badge>
                  <span>プラン詳細</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedPlanData && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ¥{selectedPlanData.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/月</span>
                  {selectedPlanData.isPopular && (
                    <Badge variant="secondary" className="ml-2">人気プラン</Badge>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlanDetails && (
            <div className="space-y-6">
              {/* 最適な用途 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">こんな方におすすめ</h4>
                <p className="text-blue-800 text-sm">{selectedPlanDetails.bestFor}</p>
              </div>

              {/* 機能一覧 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">含まれる機能</h4>
                <div className="space-y-2">
                  {selectedPlanDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 制限事項 */}
              {selectedPlanDetails.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">制限事項</h4>
                  <div className="space-y-2">
                    {selectedPlanDetails.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 現在のプランとの比較 */}
              {currentPlan && selectedPlan !== currentPlan.id && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">現在のプランとの比較</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600">
                      現在: {currentPlan.displayName} (¥{currentPlan.price.toLocaleString()}/月)
                      → {selectedPlanData?.displayName} (¥{selectedPlanData?.price.toLocaleString()}/月)
                    </p>
                    {selectedPlanData && (
                      <p className="text-gray-600 mt-1">
                        月額差額: {selectedPlanData.price > currentPlan.price ? '+' : ''}
                        ¥{(selectedPlanData.price - currentPlan.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPlanDetailDialog(false)}>
              キャンセル
            </Button>
            {currentPlan && selectedPlan !== currentPlan.id && (
              <Button onClick={confirmPlanChange}>
                このプランに変更
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}