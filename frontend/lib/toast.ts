import { toast as sonnerToast } from 'sonner';

/**
 * 統一されたトースト通知ユーティリティ
 * プロジェクト全体で一貫したトースト表示を提供
 */

// レスポンシブなスタイル設定
const getResponsiveStyle = () => {
  // ウィンドウサイズをチェック（SSR対応）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  return {
    duration: 4000,
    style: {
      fontSize: isMobile ? '14px' : '16px',
      padding: isMobile ? '12px 16px' : '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      maxWidth: isMobile ? '90vw' : '420px',
      wordBreak: 'break-word' as const,
    },
  };
};

export const toast = {
  success: (message: string) => {
    const style = getResponsiveStyle();
    sonnerToast.success(message, {
      ...style,
      style: {
        ...style.style,
        background: '#10b981',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  error: (message: string) => {
    const style = getResponsiveStyle();
    sonnerToast.error(message, {
      ...style,
      style: {
        ...style.style,
        background: '#ef4444',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  info: (message: string) => {
    const style = getResponsiveStyle();
    sonnerToast.info(message, {
      ...style,
      style: {
        ...style.style,
        background: '#3b82f6',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  warning: (message: string) => {
    const style = getResponsiveStyle();
    sonnerToast.warning(message, {
      ...style,
      style: {
        ...style.style,
        background: '#f59e0b',
        color: 'white',
        border: 'none',
      },
    });
  },
  
  loading: (message: string) => {
    const style = getResponsiveStyle();
    return sonnerToast.loading(message, {
      style: {
        ...style.style,
        background: '#6b7280',
        color: 'white',
        border: 'none',
      },
    });
  },
};