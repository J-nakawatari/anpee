"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
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

    if (!formData.agreeTerms) {
      setError('利用規約に同意してください。');
      return;
    }

    setLoading(true);

    try {
      // TODO: 実際の登録API呼び出しを実装
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password
      //   })
      // });

      // 仮実装：登録成功としてログインページへ
      router.push('/login?registered=true');
    } catch (err) {
      setError('登録に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md w-full border border-orange-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full mb-4">
            <span className="text-4xl">💕</span>
          </div>
          <h1 className="text-2xl font-bold text-orange-800">新規会員登録</h1>
          <p className="text-orange-600 mt-2">あんぴーちゃんで家族を見守りましょう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
              placeholder="8文字以上"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
    </div>
  );
}