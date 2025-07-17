"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Check } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください。');
      return;
    }

    // パスワードの複雑さチェック
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setError('パスワードは大文字・小文字・数字を含む必要があります。');
      return;
    }

    if (!formData.agreeTerms) {
      setError('利用規約に同意してください。');
      return;
    }

    setLoading(true);

    try {
      // CSRFトークンを取得
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token`, {
        credentials: 'include'
      });
      const csrfData = await csrfResponse.json();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'CSRF-Token': csrfData.csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登録に失敗しました');
      }

      showToast('アカウントを作成しました！', 'success');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || '登録に失敗しました。時間をおいて再度お試しください。';
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
          <Image 
            src="/logo.svg" 
            alt="あんぴーちゃんロゴ"
            width={80}
            height={80}
            className="mb-4 mx-auto"
          />
          <h1 className="text-2xl font-bold text-orange-800">新規会員登録</h1>
          <p className="text-orange-600 mt-2">あんぴーちゃんで家族を見守りましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-2">
              お名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30"
              placeholder="8文字以上（大文字・小文字・数字を含む）"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 mb-2">
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-orange-50/30"
              placeholder="もう一度入力"
            />
          </div>

          <div className="flex items-center">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
              <a href="/terms" className="text-orange-600 hover:text-orange-800">利用規約</a>と
              <a href="/privacy" className="text-orange-600 hover:text-orange-800">プライバシーポリシー</a>
              に同意します
            </label>
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
            {loading ? '登録中...' : '無料で登録'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は
            <a href="/login" className="text-orange-600 hover:text-orange-800 ml-1">
              ログイン
            </a>
          </p>
        </div>
      </div>
      {ToastComponent}
    </div>
  );
}