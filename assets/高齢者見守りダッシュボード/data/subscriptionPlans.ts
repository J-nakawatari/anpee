// サブスクリプションプランの型定義
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
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
    id: 'basic',
    name: 'basic',
    displayName: 'ベーシック',
    price: 980,
    features: {
      maxElderlyUsers: 3,
      maxRetryCount: 1,
      retryIntervals: [60], // 1時間のみ
      prioritySupport: false,
      advancedAnalytics: false,
      customNotifications: false
    }
  },
  {
    id: 'standard',
    name: 'standard',
    displayName: 'スタンダード',
    price: 1980,
    features: {
      maxElderlyUsers: 10,
      maxRetryCount: 3,
      retryIntervals: [30, 60, 120], // 30分、1時間、2時間
      prioritySupport: false,
      advancedAnalytics: true,
      customNotifications: true
    },
    isPopular: true
  },
  {
    id: 'premium',
    name: 'premium',
    displayName: 'プレミアム',
    price: 2980,
    features: {
      maxElderlyUsers: -1, // 無制限
      maxRetryCount: 5,
      retryIntervals: [15, 30, 60, 120, 180], // 15分、30分、1時間、2時間、3時間
      prioritySupport: true,
      advancedAnalytics: true,
      customNotifications: true
    }
  }
];

// 現在のユーザープラン（実際の実装では外部APIから取得）
export const getCurrentUserPlan = (): SubscriptionPlan => {
  // デモ用にスタンダードプランを返す
  return availablePlans[1];
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