import { toast as sonnerToast } from 'sonner';

/**
 * 統一されたトースト通知ユーティリティ
 * プロジェクト全体で一貫したトースト表示を提供
 */

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      position: 'top-center',
      duration: 4000,
      style: {
        background: '#10b981',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  error: (message: string) => {
    sonnerToast.error(message, {
      position: 'top-center',
      duration: 4000,
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  info: (message: string) => {
    sonnerToast.info(message, {
      position: 'top-center',
      duration: 4000,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  warning: (message: string) => {
    sonnerToast.warning(message, {
      position: 'top-center',
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      position: 'top-center',
      style: {
        background: '#6b7280',
        color: 'white',
        border: 'none',
      },
    });
  },
};