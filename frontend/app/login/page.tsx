"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // CSRFトークンを取得
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token`, {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfData.csrfToken
        },
        credentials: 'include', // Cookie を含める
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ログインに失敗しました');
      }

      // アクセストークンを保存
      if (data.data?.accessToken) {
        localStorage.setItem('token', data.data.accessToken);
      }

      toast.success('ログインしました！');
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || 'ログインに失敗しました。';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md w-full border border-orange-100">
        <div className="text-center mb-8">
          <Image 
            src="/logo.svg" 
            alt="あんぴーちゃんロゴ"
            width={80}
            height={80}
            className="mb-4 mx-auto"
          />
          <h1 className="text-2xl font-bold text-orange-800">あんぴーちゃん</h1>
          <p className="text-orange-600 mt-2">家族見守りサービス</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30"
              placeholder="mail@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-800">
            パスワードをお忘れの方
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は
            <a href="/register" className="text-orange-600 hover:text-orange-800 ml-1">
              新規登録
            </a>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <a 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600"
            >
              利用規約
            </a>
            <span>・</span>
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600"
            >
              プライバシーポリシー
            </a>
            <span>・</span>
            <a 
              href="/commercial-law" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600"
            >
              特定商取引法
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}