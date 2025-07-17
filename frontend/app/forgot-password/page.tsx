"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: 実際のパスワードリセットAPI呼び出しを実装
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // 仮実装：メール送信成功
      setSubmitted(true);
    } catch (err) {
      setError('エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md w-full border border-orange-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full mb-6">
              <Mail className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-orange-800 mb-4">メールを送信しました</h1>
            <p className="text-gray-600 mb-2">
              パスワードリセットのご案内を
            </p>
            <p className="text-orange-700 font-medium mb-4">{email}</p>
            <p className="text-gray-600 mb-8">
              に送信しました。メールをご確認ください。
            </p>
            <p className="text-sm text-gray-500 mb-8">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md"
            >
              ログインページへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-8 max-w-md w-full border border-orange-100">
        <div className="mb-8">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">ログインに戻る</span>
          </button>
          
          <div className="text-center">
            <Image 
              src="/logo.svg" 
              alt="あんぴーちゃんロゴ"
              width={80}
              height={80}
              className="mb-4 mx-auto"
            />
            <h1 className="text-2xl font-bold text-orange-800 mb-2">パスワードをお忘れですか？</h1>
            <p className="text-gray-600">メールアドレスを入力してください。</p>
            <p className="text-gray-600">パスワードリセットのご案内をお送りします。</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
              登録メールアドレス
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
            {loading ? '送信中...' : 'リセットメールを送信'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-orange-50/50 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            お困りの場合は、
            <a href="#" className="text-orange-600 hover:text-orange-800">
              サポート
            </a>
            までお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}