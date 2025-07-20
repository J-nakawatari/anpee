import { toast as sonnerToast } from 'sonner';

/**
 * 統一されたトースト通知ユーティリティ
 * プロジェクト全体で一貫したトースト表示を提供
 */

// 共通のスタイル設定
const commonStyle = {
  duration: 4000,
  style: {
    fontSize: '16px',
    padding: '16px 24px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
};

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      ...commonStyle,
      style: {
        ...commonStyle.style,
        background: '#10b981',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  error: (message: string) => {
    sonnerToast.error(message, {
      ...commonStyle,
      style: {
        ...commonStyle.style,
        background: '#ef4444',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  info: (message: string) => {
    sonnerToast.info(message, {
      ...commonStyle,
      style: {
        ...commonStyle.style,
        background: '#3b82f6',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  warning: (message: string) => {
    sonnerToast.warning(message, {
      ...commonStyle,
      style: {
        ...commonStyle.style,
        background: '#f59e0b',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      style: {
        ...commonStyle.style,
        background: '#6b7280',
        color: 'white',
        border: 'none',
      },
    });
  },
};