"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, ToastComponent } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      showToast('無効なリンクです', 'error');
      router.push('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router, showToast]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return false;
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'パスワードのリセットに失敗しました');
      }

      showToast('パスワードを再設定しました！', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || 'エラーが発生しました。時間をおいて再度お試しください。';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md w-full border border-orange-100">
        <div className="text-center mb-8">
          <img 
            src="/logo.svg" 
            alt="あんぴーちゃんロゴ"
            width={80}
            height={80}
            className="mb-4 mx-auto"
            style={{ margin: '0 auto' }}
          />
          <h1 className="text-2xl font-bold text-orange-800">パスワードの再設定</h1>
          <p className="text-orange-600 mt-2">新しいパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30 pr-12"
                placeholder="8文字以上で入力"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
              パスワード（確認）
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30 pr-12"
                placeholder="もう一度入力"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cute-button"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                設定中...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Lock className="w-5 h-5 mr-2" />
                パスワードを再設定
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-orange-600 hover:text-orange-800 text-sm">
            ログインページに戻る
          </a>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
}