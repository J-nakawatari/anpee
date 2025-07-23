"use client";

import { useDebugMode } from '@/hooks/useDebugMode';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

export function DebugBanner() {
  const { debugMode, clearDebugMode } = useDebugMode();

  if (!debugMode) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-yellow-900">デバッグモード</p>
          <p className="text-sm text-yellow-800 mt-1">
            {debugMode === 'expired' && 'サブスクリプション期限切れをシミュレート中'}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={clearDebugMode}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}