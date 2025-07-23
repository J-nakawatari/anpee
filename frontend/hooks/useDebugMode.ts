import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useDebugMode() {
  const searchParams = useSearchParams();
  const [debugMode, setDebugMode] = useState<string | null>(null);

  useEffect(() => {
    const debug = searchParams.get('debug');
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
  }, [searchParams]);

  const clearDebugMode = () => {
    setDebugMode(null);
    localStorage.removeItem('debugMode');
  };

  return {
    isExpired: debugMode === 'expired',
    debugMode,
    clearDebugMode
  };
}