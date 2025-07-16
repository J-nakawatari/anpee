'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { Heart, Mail, Lock, User, Phone, Loader2, Check } from 'lucide-react'

const registerSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  email: z
    .string()
    .email('有効なメールアドレスを入力してください'),
  phone: z
    .string()
    .regex(/^[0-9-]+$/, '有効な電話番号を入力してください')
    .min(10, '電話番号は10桁以上で入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードは大文字・小文字・数字を含む必要があります'
    ),
  confirmPassword: z
    .string()
    .min(1, 'パスワード（確認）を入力してください'),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, '利用規約への同意が必要です'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      
      if (response.success) {
        setSuccess(true)
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        '登録に失敗しました。もう一度お試しください。'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="cute-card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-peach-700 mb-4">
              登録が完了しました！
            </h2>
            <p className="text-gray-600 mb-6">
              確認メールを送信しました。
              <br />
              メールに記載されたリンクから
              <br />
              アカウントを有効化してください。
            </p>
            <Link
              href="/login"
              className="cute-button inline-block"
            >
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="cute-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-peach-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-peach-500" />
            </div>
            <h1 className="text-2xl font-bold text-peach-700">
              あんぴーちゃんに新規登録
            </h1>
            <p className="text-peach-600 mt-2">
              大切な家族を見守るサービス
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-cute text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="w-full pl-10 pr-3 py-2 border border-peach-200 rounded-cute focus:outline-none focus:ring-2 focus:ring-peach-500"
                  placeholder="山田 太郎"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="w-full pl-10 pr-3 py-2 border border-peach-200 rounded-cute focus:outline-none focus:ring-2 focus:ring-peach-500"
                  placeholder="090-1234-5678"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
                  placeholder="8文字以上、大文字・小文字・数字を含む"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className="w-full pl-10 pr-3 py-2 border border-peach-200 rounded-cute focus:outline-none focus:ring-2 focus:ring-peach-500"
                  placeholder="パスワードを再入力"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                {...register('agreeToTerms')}
                type="checkbox"
                id="agreeToTerms"
                className="mt-1 h-4 w-4 text-peach-600 focus:ring-peach-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                <Link href="/terms" className="text-peach-600 hover:text-peach-700" target="_blank">
                  利用規約
                </Link>
                、
                <Link href="/privacy" className="text-peach-600 hover:text-peach-700" target="_blank">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cute-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登録中...
                </>
              ) : (
                '新規登録'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの方は
            </p>
            <Link
              href="/login"
              className="text-sm text-peach-600 hover:text-peach-700 font-medium"
            >
              ログインはこちら
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