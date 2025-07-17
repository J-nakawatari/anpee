'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { Heart, Mail, Lock, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await authApi.login(data.email, data.password)
      
      if (response.success) {
        // アクセストークンを保存
        localStorage.setItem('accessToken', response.data.accessToken)
        
        // ユーザー情報を保存（必要に応じて）
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // ダッシュボードへリダイレクト
        router.push('/user/dashboard')
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        'ログインに失敗しました。もう一度お試しください。'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="cute-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-peach-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-peach-500" />
            </div>
            <h1 className="text-2xl font-bold text-peach-700">
              あんぴーちゃんにログイン
            </h1>
            <p className="text-peach-600 mt-2">
              大切な家族を見守りましょう
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-cute text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-3 py-2 border border-peach-200 rounded-cute focus:outline-none focus:ring-2 focus:ring-peach-500"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  id="password"
                  className="w-full pl-10 pr-3 py-2 border border-peach-200 rounded-cute focus:outline-none focus:ring-2 focus:ring-peach-500"
                  placeholder="パスワード"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-peach-600 hover:text-peach-700"
              >
                パスワードを忘れた方
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cute-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              まだアカウントをお持ちでない方は
            </p>
            <Link
              href="/register"
              className="text-sm text-peach-600 hover:text-peach-700 font-medium"
            >
              新規登録はこちら
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-peach-600 hover:text-peach-700">
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}