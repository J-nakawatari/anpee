// サブスクリプションプランの型定義
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  stripePriceId: string;  // Stripe価格ID
  features: {
    maxElderlyUsers: number;
    maxRetryCount: number;
    retryIntervals: number[]; // 分単位
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    customNotifications: boolean;
  };
  isPopular?: boolean;
}

// 利用可能なプラン
export const availablePlans: SubscriptionPlan[] = [
  {
    id: 'standard',
    name: 'standard',
    displayName: '🐥 スタンダードプラン',
    price: 1480,
    stripePriceId: 'price_1RnLHg1qmMqgQ3qQx3Mfo1rt',
    features: {
      maxElderlyUsers: 1,
      maxRetryCount: 3,
      retryIntervals: [30, 60], // 30分、1時間
      prioritySupport: false,
      advancedAnalytics: false,
      customNotifications: true
    },
    isPopular: true
  },
  {
    id: 'family',
    name: 'family',
    displayName: '🦉 ファミリープラン',
    price: 2480,
    stripePriceId: 'price_1RnLJC1qmMqgQ3qQc9t1lemY',
    features: {
      maxElderlyUsers: 3,
      maxRetryCount: 3,
      retryIntervals: [30, 60], // 30分、1時間
      prioritySupport: true,
      advancedAnalytics: true,
      customNotifications: true
    }
  }
];

// 現在のユーザープラン（実際の実装では外部APIから取得）
export const getCurrentUserPlan = (): SubscriptionPlan => {
  // デモ用にスタンダードプランを返す
  return availablePlans[0];
};

// 間隔の表示用フォーマット
export const formatRetryInterval = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分`;
  } else {
    const hours = minutes / 60;
    return `${hours}時間`;
  }
};

// プランアップグレード情報
export const getUpgradeInfo = (currentPlan: SubscriptionPlan, targetFeature: keyof SubscriptionPlan['features']) => {
  const currentPlanIndex = availablePlans.findIndex(p => p.id === currentPlan.id);
  const upgradePlan = availablePlans[currentPlanIndex + 1];
  
  if (!upgradePlan) {
    return null;
  }
  
  return {
    planName: upgradePlan.displayName,
    price: upgradePlan.price,
    additionalCost: upgradePlan.price - currentPlan.price
  };
};