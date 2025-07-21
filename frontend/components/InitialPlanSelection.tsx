"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Check,
  X,
  Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "@/lib/toast";
import billingService from "@/services/billingService";
import { Plan } from "@/types/billing";
import { apiClient } from "@/services/apiClient";

export function InitialPlanSelection() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  
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

  // サブスクリプションの確認
  useEffect(() => {
    // ローカルストレージからユーザー情報を取得
    const storedUser = localStorage.getItem('user');
    console.log('ユーザー情報:', storedUser);
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('hasSelectedInitialPlan:', user.hasSelectedInitialPlan);
      setUserInfo(user);
      // ユーザーが既に初回プラン選択を完了している場合はチェックをスキップ
      if (user.hasSelectedInitialPlan === true) {
        console.log('既にプラン選択済み、非表示にします');
        setHasSubscription(true);
        setCheckingSubscription(false);
        return;
      }
    }
    
    console.log('サブスクリプション状態を確認します');
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // まずサブスクリプションを確認
      const subscription = await billingService.getSubscription();
      if (subscription && subscription.status === 'active') {
        setHasSubscription(true);
        // フラグを更新
        await apiClient.post('/auth/initial-plan-selected');
        // ユーザー情報を更新
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.hasSelectedInitialPlan = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return;
      }
      
      // サブスクリプションがない場合は請求履歴を確認
      const invoices = await billingService.getInvoices(1);
      if (invoices.length > 0 && invoices[0].status === 'paid') {
        // 支払済みの請求書がある場合もプランありとみなす
        setHasSubscription(true);
        // フラグを更新
        await apiClient.post('/auth/initial-plan-selected');
        // ユーザー情報を更新
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.hasSelectedInitialPlan = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
        return;
      }
    } catch (error) {
      console.error('サブスクリプション確認エラー:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handlePlanSelect = async () => {
    if (!selectedPlan) {
      toast.error('プランを選択してください');
      return;
    }

    const plan = availablePlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    try {
      setIsProcessing(true);
      // フラグを更新
      await apiClient.post('/auth/initial-plan-selected');
      // ユーザー情報を更新
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.hasSelectedInitialPlan = true;
        localStorage.setItem('user', JSON.stringify(user));
      }
      const checkoutUrl = await billingService.createCheckoutSession(plan.stripePriceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('チェックアウトセッション作成エラー:', error);
      toast.error('プラン選択の処理に失敗しました');
      setIsProcessing(false);
    }
  };

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'family': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
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
        ]
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
        limitations: []
      }
    };

    return planFeatures[planId as keyof typeof planFeatures] || planFeatures.standard;
  };

  if (checkingSubscription) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (hasSubscription) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              プランを選択してください
            </h1>
            <p className="text-lg text-gray-600">
              あんぴーちゃんをご利用いただくには、まずプランの選択が必要です。<br />
              ご家族の状況に合わせて最適なプランをお選びください。
            </p>
          </div>

          {/* プランカード */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {availablePlans.map((plan) => {
              const planDetails = getPlanDetails(plan.id);
              const isSelected = selectedPlan === plan.id;
              
              return (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge className={getPlanBadgeColor(plan.id)}>
                            {plan.displayName}
                          </Badge>
                          {plan.id === 'family' && (
                            <Badge variant="secondary">人気</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {plan.features.targetAudience}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ¥{plan.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">/月</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 機能一覧 */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        含まれる機能
                      </h4>
                      <div className="space-y-2">
                        {planDetails.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 制限事項 */}
                    {planDetails.limitations.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                          <X className="w-5 h-5" />
                          制限事項
                        </h4>
                        <div className="space-y-2">
                          {planDetails.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600">{limitation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 選択インジケーター */}
                    <div className={`text-center py-2 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isSelected ? '✓ 選択中' : 'クリックして選択'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* アクションボタン */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={handlePlanSelect}
              disabled={!selectedPlan || isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : (
                '選択したプランで始める'
              )}
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              ※ プランはいつでも変更可能です
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}