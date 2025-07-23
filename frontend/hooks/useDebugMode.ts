import { useEffect, useState } from 'react';

export function useDebugMode() {
  const [debugMode, setDebugMode] = useState<string | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      // URLパラメータをチェック
      const urlParams = new URLSearchParams(window.location.search);
      const debug = urlParams.get('debug');
      
      if (debug) {
        setDebugMode(debug);
        // LocalStorageに保存して他のページでも使えるようにする
        localStorage.setItem('debugMode', debug);
      } else {
        // URLパラメータがない場合はLocalStorageから取得
        const storedDebug = localStorage.getItem('debugMode');
        if (storedDebug) {
          setDebugMode(storedDebug);
        }
      }
    }
  }, []);

  const clearDebugMode = () => {
    setDebugMode(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('debugMode');
    }
  };

  return {
    isExpired: debugMode === 'expired',
    debugMode,
    clearDebugMode
  };
}