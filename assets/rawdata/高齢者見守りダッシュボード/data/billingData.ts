// 請求履歴の型定義
export interface BillingRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  planName: string;
  period: {
    start: string;
    end: string;
  };
  paymentMethod: {
    type: 'card' | 'bank_transfer';
    last4?: string;
    brand?: string;
  };
  downloadUrl?: string;
}

// 支払い方法の型定義
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer';
  isDefault: boolean;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  bankAccount?: {
    bankName: string;
    last4: string;
  };
}

// 契約情報の型定義
export interface SubscriptionInfo {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPlan: string;
  startDate: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

// Mock データ
export const mockBillingHistory: BillingRecord[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2024-001',
    date: '2024-07-01',
    amount: 1980,
    status: 'paid',
    planName: 'スタンダード',
    period: {
      start: '2024-07-01',
      end: '2024-07-31'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa'
    },
    downloadUrl: '/invoices/inv_001.pdf'
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2024-002',
    date: '2024-06-01',
    amount: 1980,
    status: 'paid',
    planName: 'スタンダード',
    period: {
      start: '2024-06-01',
      end: '2024-06-30'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa'
    },
    downloadUrl: '/invoices/inv_002.pdf'
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2024-003',
    date: '2024-05-01',
    amount: 980,
    status: 'paid',
    planName: 'ベーシック',
    period: {
      start: '2024-05-01',
      end: '2024-05-31'
    },
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa'
    },
    downloadUrl: '/invoices/inv_003.pdf'
  }
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    type: 'card',
    isDefault: true,
    card: {
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025
    }
  },
  {
    id: 'pm_002',
    type: 'card',
    isDefault: false,
    card: {
      brand: 'mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2026
    }
  }
];

export const mockSubscriptionInfo: SubscriptionInfo = {
  id: 'sub_001',
  status: 'active',
  currentPlan: 'standard',
  startDate: '2024-05-01',
  nextBillingDate: '2024-08-01',
  cancelAtPeriodEnd: false,
  stripeCustomerId: 'cus_mock_customer',
  stripeSubscriptionId: 'sub_mock_subscription'
};

// ステータスの日本語表示
export const getStatusLabel = (status: BillingRecord['status']) => {
  switch (status) {
    case 'paid': return '支払い済み';
    case 'pending': return '支払い待ち';
    case 'failed': return '支払い失敗';
    case 'refunded': return '返金済み';
    default: return '不明';
  }
};

// ステータスの色
export const getStatusColor = (status: BillingRecord['status']) => {
  switch (status) {
    case 'paid': return 'text-green-600 bg-green-50';
    case 'pending': return 'text-yellow-600 bg-yellow-50';
    case 'failed': return 'text-red-600 bg-red-50';
    case 'refunded': return 'text-blue-600 bg-blue-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

// カードブランドの表示
export const getCardBrandLabel = (brand: string) => {
  switch (brand.toLowerCase()) {
    case 'visa': return 'Visa';
    case 'mastercard': return 'Mastercard';
    case 'amex': return 'American Express';
    case 'jcb': return 'JCB';
    default: return brand.toUpperCase();
  }
};

// Stripe Customer Portalの模擬URL
export const getStripeCustomerPortalUrl = (customerId: string) => {
  return `https://billing.stripe.com/session/mock_${customerId}`;
};

// 請求書ダウンロードの模擬関数
export const downloadInvoice = (invoiceId: string) => {
  // 実際の実装では、Stripeの請求書URLを取得
  console.log(`Downloading invoice: ${invoiceId}`);
  // Mock download
  const link = document.createElement('a');
  link.href = `/invoices/${invoiceId}.pdf`;
  link.download = `invoice_${invoiceId}.pdf`;
  link.click();
};