"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, XCircle } from 'lucide-react';

function EmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const msg = searchParams.get('message');

    if (success === 'true') {
      setStatus('success');
      setMessage(msg || 'メールアドレスが確認されました');
    } else {
      setStatus('error');
      setMessage(msg || 'メールアドレスの確認に失敗しました');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md w-full border border-orange-100">
        <div className="text-center">
          <Image 
            src="/logo.svg" 
            alt="あんぴーちゃんロゴ"
            width={80}
            height={80}
            className="mb-4 mx-auto"
          />
          
          {status === 'success' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-orange-800 mb-4">確認完了！</h1>
              <p className="text-gray-600 mb-8">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md"
              >
                ログインページへ
              </button>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-orange-800 mb-4">確認エラー</h1>
              <p className="text-gray-600 mb-8">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md"
              >
                ログインページへ戻る
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-orange-600">読み込み中...</p>
        </div>
      </div>
    }>
      <EmailVerifiedContent />
    </Suspense>
  );
}