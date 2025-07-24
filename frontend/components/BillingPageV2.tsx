"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Download, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Crown,
  Settings,
  AlertTriangle,
  Check,
  X,
  Loader2
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
import billingService, { SubscriptionData } from "@/services/billingService";
import { Plan, Invoice, PaymentMethod } from "@/types/billing";
import { safeDate, formatDateJP } from "@/lib/dateUtils";

export function BillingPageV2() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPlanDetailDialog, setShowPlanDetailDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // 利用可能なプラン
  const availablePlans: Plan[] = [
    {
      id: 'standard',
      displayName: '🐥 スタンダードプラン',
      price: 1480,
      stripePriceId: 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt',
      features: {
        maxElderlyUsers: 1,
        safetyCheckFrequency: '1日1回',
        notificationMethods: ['LINE', '電話'],
        supportFeatures: ['安否確認', '通話応答記録', '再通知'],
        targetAudience: '一人暮らしの家族',
        maxRetryCount: 3
      }
    },
    {
      id: 'family',
      displayName: '🦉 ファミリープラン',
      price: 2480,
      stripePriceId: 'price_1RnLJC1qmMqgQ3qQc9t1lemY',
      features: {
        maxElderlyUsers: 3,
        safetyCheckFrequency: '1日1回×3人分',
        notificationMethods: ['LINE', '電話'],
        supportFeatures: ['家族3人まで登録可能'],
        targetAudience: '兄弟・親子など複数見守り',
        maxRetryCount: 3
      }
    }
  ];

  // データの取得
  useEffect(() => {
    // デバッグモード: ?debug=expired でサブスクリプション期限切れをシミュレート
    const debugMode = searchParams.get('debug');
    if (debugMode === 'expired') {
      // 期限切れ状態をシミュレート
      setSubscription(null);
      setCurrentPlan(null);
      setLoading(false);
      toast.info('デバッグモード: サブスクリプション期限切れ状態');
      return;
    }
    
    loadBillingData();
    
    // 支払い成功後の処理
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    
    if (sessionId && success === 'true') {
      handlePaymentSuccess(sessionId);
    }
  }, [searchParams]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // 並行してデータを取得
      const [subscriptionData, invoicesData, paymentMethodsData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getInvoices(10),
        billingService.getPaymentMethods()
      ]);
      
      setSubscription(subscriptionData);
      setInvoices(invoicesData);
      setPaymentMethods(paymentMethodsData);
      
      // 現在のプランを設定
      if (subscriptionData) {
        const plan = billingService.getPlanDisplayInfo(subscriptionData.currentPlan);
        setCurrentPlan(plan || null);
      } else {
        // 請求履歴から現在のプランを推測
        if (invoicesData.length > 0) {
          const latestInvoice = invoicesData[0];
          
          // planIdが含まれている場合（最も確実）
          if (latestInvoice.planId) {
            const plan = availablePlans.find(p => p.id === latestInvoice.planId);
            setCurrentPlan(plan || null);
          } else if (latestInvoice.priceId) {
            // 価格IDから判定
            const plan = availablePlans.find(p => p.stripePriceId === latestInvoice.priceId);
            setCurrentPlan(plan || null);
          } else if (latestInvoice.planName) {
            // プラン名で判定（フォールバック）
            if (latestInvoice.planName.toLowerCase().includes('standard') || 
                latestInvoice.planName.includes('スタンダード')) {
              setCurrentPlan(availablePlans.find(p => p.id === 'standard') || null);
            } else if (latestInvoice.planName.toLowerCase().includes('family') || 
                       latestInvoice.planName.includes('ファミリー')) {
              setCurrentPlan(availablePlans.find(p => p.id === 'family') || null);
            }
          }
        }
      }
    } catch (error) {
      console.error('請求データの取得に失敗しました:', error);
      toast.error('請求データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planId: string) => {
    console.log('プラン変更クリック:', planId);
    setSelectedPlan(planId);
    setShowPlanDetailDialog(true);
  };

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      console.log('支払い成功処理開始:', { sessionId });
      
      // apiClientを使って認証トークンを含めてリクエスト
      const { apiClient } = await import('@/services/apiClient');
      console.log('APIクライアント取得完了');
      
      const response = await apiClient.post('/billing/payment-success', { sessionId });
      
      console.log('支払い成功APIレスポンス:', {
        status: response.status,
        data: response.data,
        success: response.data?.success
      });
      
      if (response.data.success) {
        toast.success('プランの設定が完了しました！');
        // データを再読み込み
        await loadBillingData();
      } else {
        // エラーの詳細を表示
        console.error('支払い成功処理失敗:', response.data);
        toast.error(response.data.error || 'プランの設定に失敗しました');
      }
    } catch (error: any) {
      console.error('支払い成功処理エラー:', error);
      
      if (error.response?.status === 401) {
        toast.error('認証エラー: ログインし直してください');
        // 認証エラーの場合、ログインページへリダイレクト
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || '通信エラーが発生しました');
      }
    }
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;
    
    const newPlan = availablePlans.find(p => p.id === selectedPlan);
    if (!newPlan) return;

    // キャンセル予定の場合はブロック
    if (subscription?.cancelAtPeriodEnd) {
      toast.error(
        'キャンセル予定のプランは変更できません。\n' +
        'プランを変更する場合は、先に「契約管理」からキャンセルを取り消してください。'
      );
      setShowPlanDetailDialog(false);
      return;
    }

    try {
      setIsProcessing(true);
      
      // プラン変更のバリデーション
      const { apiClient } = await import('@/services/apiClient');
      const validationResponse = await apiClient.post('/billing/validate-plan-change', {
        targetPlan: selectedPlan
      });
      
      if (!validationResponse.data.valid) {
        // バリデーションエラーがある場合
        toast.error(validationResponse.data.message);
        setIsProcessing(false);
        setShowPlanDetailDialog(false);
        return;
      }
      
      // 現在のプランがある場合は直接プラン変更、ない場合は新規契約
      if (subscription?.id) {
        // 既存のサブスクリプションがある場合はプラン変更API
        await apiClient.post('/billing/change-plan', {
          targetPlan: selectedPlan
        });
        
        toast.success('プランを変更しました');
        await loadBillingData(); // データを再読み込み
        setShowPlanDetailDialog(false);
      } else {
        // 新規契約の場合はチェックアウト
        const checkoutUrl = await billingService.createCheckoutSession(newPlan.stripePriceId);
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error('プラン変更エラー:', error);
      toast.error(error.response?.data?.error || 'プラン変更の処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsProcessing(true);
      const { apiClient } = await import('@/services/apiClient');
      
      const response = await apiClient.post('/billing/cancel');
      
      if (response.data.success) {
        toast.success('サブスクリプションのキャンセルを受け付けました');
        // データを再読み込み
        await loadBillingData();
        setShowCancelDialog(false);
      } else {
        toast.error(response.data.error || 'キャンセルに失敗しました');
      }
    } catch (error: any) {
      console.error('キャンセルエラー:', error);
      toast.error(error.response?.data?.error || 'キャンセル処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSub = async () => {
    try {
      setIsProcessing(true);
      const { apiClient } = await import('@/services/apiClient');
      
      const response = await apiClient.post('/billing/resume');
      
      if (response.data.success) {
        toast.success('サブスクリプションを再開しました');
        // データを再読み込み
        await loadBillingData();
      } else {
        toast.error(response.data.error || 'サブスクリプション再開に失敗しました');
      }
    } catch (error: any) {
      console.error('サブスクリプション再開エラー:', error);
      toast.error(error.response?.data?.error || 'サブスクリプション再開処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = (downloadUrl?: string) => {
    if (!downloadUrl) {
      toast.error('請求書のダウンロードURLがありません');
      return;
    }
    window.open(downloadUrl, '_blank');
    toast.success('請求書をダウンロードしました');
  };

  const handleSyncSubscription = async () => {
    try {
      setIsSyncing(true);
      const { apiClient } = await import('@/services/apiClient');
      const response = await apiClient.post('/test/sync-stripe-subscription');
      
      if (response.data.success) {
        toast.success('サブスクリプション情報を同期しました');
        // データを再取得
        await loadBillingData();
      } else {
        toast.error(response.data.message || 'サブスクリプションの同期に失敗しました');
      }
    } catch (error: any) {
      console.error('同期エラー:', error);
      const message = error.response?.data?.message || 'サブスクリプションの同期に失敗しました';
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'family': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return '支払済み';
      case 'pending': return '支払待ち';
      case 'failed': return '支払失敗';
      default: return '不明';
    }
  };
  
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // プラン詳細
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
        bestFor: '一人暮らしの家族の見守りに最適'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* 現在のプラン */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-blue-600" />
            現在のプラン
          </CardTitle>
          <CardDescription>
            ご契約中のプラン情報
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {currentPlan ? (
            <>
              {/* プラン概要 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getPlanBadgeColor(currentPlan.id)} text-base px-3 py-1`}>
                        {currentPlan.displayName}
                      </Badge>
                      {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
                        <Badge className="bg-green-100 text-green-700">
                          アクティブ
                        </Badge>
                      )}
                      {subscription?.cancelAtPeriodEnd && (
                        <Badge className="bg-orange-100 text-orange-700">
                          キャンセル予定
                        </Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      ¥{currentPlan.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-600 ml-1">/月</span>
                    </div>
                  </div>
                  {currentPlan.id === 'standard' && subscription?.status === 'active' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handlePlanChange('family')}
                      className="ml-4"
                      disabled={subscription.cancelAtPeriodEnd}
                    >
                      {subscription.cancelAtPeriodEnd ? 'プラン変更不可' : 'ファミリープランにアップグレード'}
                    </Button>
                  )}
                </div>
              </div>

              {/* 3列レイアウト */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* 契約情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    契約情報
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    {subscription && (
                      <>
                        <div className="flex justify-between gap-2 text-xs sm:text-sm">
                          <span className="text-gray-600">契約開始日</span>
                          <span className="font-medium">{formatDateJP(subscription.startDate)}</span>
                        </div>
                        {subscription.nextBillingDate && !subscription.cancelAtPeriodEnd && (
                          <div className="flex justify-between gap-2 text-xs sm:text-sm">
                            <span className="text-gray-600">次回請求日</span>
                            <span className="font-medium">{formatDateJP(subscription.nextBillingDate)}</span>
                          </div>
                        )}
                        {subscription.cancelAtPeriodEnd && subscription.nextBillingDate && (
                          <div className="flex justify-between gap-2 text-xs sm:text-sm">
                            <span className="text-gray-600">サービス終了日</span>
                            <span className="font-medium text-orange-600">
                              {formatDateJP(subscription.nextBillingDate)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* プラン特典 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    プラン特典
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>最大 {currentPlan.features.maxElderlyUsers} 人まで登録可能</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{currentPlan.features.safetyCheckFrequency}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>再通知 {currentPlan.features.maxRetryCount} 回まで</span>
                    </li>
                  </ul>
                </div>

                {/* 追加機能 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Settings className="w-4 h-4 text-green-600" />
                    追加機能
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {currentPlan.features.supportFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* 期限切れの場合の特別なメッセージ */}
              {searchParams.get('debug') === 'expired' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-red-100 rounded-full p-3">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    サービスの利用期限が終了しました
                  </h3>
                  <p className="text-red-800 mb-4">
                    見守りサービスは停止されています。サービスを再開するには、プランを選択してください。
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="inline w-4 h-4 mr-1" />
                      過去30日間のデータは保持されています。再契約後すぐにご利用いただけます。
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full max-w-sm mx-auto"
                    onClick={() => {
                      const element = document.getElementById('plan-selection');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    プランを選択してサービスを再開
                  </Button>
                </div>
              )}
              
              {/* 通常の未契約状態 */}
              {searchParams.get('debug') !== 'expired' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    現在有効なサブスクリプションがありません。プランを選択して契約してください。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 請求履歴 */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            請求履歴
          </CardTitle>
          <CardDescription>
            過去の請求書と支払い状況
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {invoices.length > 0 ? (
            <>
              {/* PC用テーブル */}
              <div className="hidden md:block overflow-x-auto">
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
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber || '-'}
                      </TableCell>
                      <TableCell>
                        {formatDateJP(invoice.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{invoice.planName}</span>
                          {currentPlan && invoice.planId && invoice.planId !== currentPlan.id && (
                            <span className="text-xs text-gray-500">(変更前)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ¥{invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusLabel(invoice.status)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.paymentMethod?.type === 'card' && invoice.paymentMethod.last4 ? (
                          <span>
                            {invoice.paymentMethod.brand} ****{invoice.paymentMethod.last4}
                          </span>
                        ) : (
                          'カード'
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.downloadUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice.downloadUrl)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            ダウンロード
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
              
              {/* モバイル用カードビュー */}
              <div className="md:hidden space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">請求書番号</p>
                        <p className="font-medium">{invoice.invoiceNumber || '-'}</p>
                      </div>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {invoice.status === 'paid' ? '支払済' : '未払い'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">日付</p>
                        <p className="font-medium">{formatDateJP(invoice.date)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">金額</p>
                        <p className="font-medium">¥{invoice.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">プラン</p>
                        <p className="font-medium">{invoice.planName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">支払い方法</p>
                        <p className="font-medium">
                          {invoice.paymentMethod?.type === 'card' && invoice.paymentMethod.last4 ? (
                            `${invoice.paymentMethod.brand} ****${invoice.paymentMethod.last4}`
                          ) : (
                            'カード'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadInvoice(invoice.downloadUrl)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        請求書をダウンロード
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              請求履歴がありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* プラン変更・契約管理 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="plan-selection">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              プラン変更
            </CardTitle>
            <CardDescription>
              より多くの機能をご利用いただけます
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {subscription?.cancelAtPeriodEnd && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  キャンセル予定のため、プラン変更はできません。プランを変更する場合は、先に契約管理からキャンセルを取り消してください。
                </AlertDescription>
              </Alert>
            )}
            {availablePlans.map((plan) => {
              const isCurrentPlan = currentPlan && plan.id === currentPlan.id;
              const isCancelPending = subscription?.cancelAtPeriodEnd;
              return (
                <div key={plan.id} className={`flex items-center justify-between p-3 border rounded-lg ${isCancelPending ? 'opacity-60' : ''}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{plan.displayName}</h4>
                      {plan.id === 'family' && <Badge variant="secondary" className="text-xs">人気</Badge>}
                      {isCurrentPlan && <Badge className="text-xs">現在のプラン</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">¥{plan.price.toLocaleString()}/月</p>
                  </div>
                  <Button 
                    variant={isCurrentPlan ? "secondary" : "default"}
                    size="sm"
                    disabled={!!isCurrentPlan || !!isCancelPending}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    {isCurrentPlan ? "現在のプラン" : isCancelPending ? "変更不可" : "詳細を見る"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              契約管理
            </CardTitle>
            <CardDescription>
              契約の一時停止やキャンセル
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {subscription?.cancelAtPeriodEnd ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {subscription.nextBillingDate && (
                    <>
                      キャンセル済み: {formatDateJP(subscription.nextBillingDate)} まで利用可能です
                    </>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  キャンセル後も現在の請求期間終了までサービスをご利用いただけます
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              {subscription?.cancelAtPeriodEnd ? (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResumeSub}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      'キャンセルを取り消す'
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    キャンセルを取り消すと、次回請求日から自動的に請求が再開されます
                  </p>
                </>
              ) : (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={!subscription || subscription.status !== 'active'}
                >
                  契約をキャンセル
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* キャンセル確認ダイアログ */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle>契約をキャンセルしますか？</DialogTitle>
            <DialogDescription>
              {subscription?.nextBillingDate && (
                <div className="space-y-2">
                  <p>キャンセルしても、以下の日付まで引き続きサービスをご利用いただけます：</p>
                  <p className="font-semibold text-lg">
                    {safeDate(subscription.nextBillingDate) ? safeDate(subscription.nextBillingDate)!.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}まで
                  </p>
                  <p className="text-sm text-gray-600">
                    上記の日付以降、自動的にサービスが停止され、次回の請求は発生しません。
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : (
                '契約をキャンセル'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* プラン詳細ダイアログ */}
      <Dialog open={showPlanDetailDialog} onOpenChange={(open) => {
        console.log('ダイアログ状態変更:', open);
        setShowPlanDetailDialog(open);
      }}>
        <DialogContent className="max-w-2xl mx-2 sm:mx-4 bg-white w-[calc(100vw-1rem)] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
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
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ¥{selectedPlanData.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500">/月</span>
                  {selectedPlanData.id === 'family' && (
                    <Badge variant="secondary" className="ml-2">人気プラン</Badge>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlanDetails && (
            <div className="space-y-6">
              {/* 最適な用途 */}
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">こんな方におすすめ</h4>
                <p className="text-blue-800 text-sm">{selectedPlanDetails.bestFor}</p>
              </div>

              {/* 機能一覧 */}
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  含まれる機能
                </h4>
                <div className="space-y-2">
                  {selectedPlanDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 制限事項 */}
              {selectedPlanDetails.limitations.length > 0 && (
                <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <X className="w-4 sm:w-5 h-4 sm:h-5" />
                    制限事項
                  </h4>
                  <div className="space-y-2">
                    {selectedPlanDetails.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
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
              <Button onClick={confirmPlanChange} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  'このプランに変更'
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}