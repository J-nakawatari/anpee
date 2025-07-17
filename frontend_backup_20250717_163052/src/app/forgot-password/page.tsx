'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { Heart, Mail, Loader2, Check, ArrowLeft } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await authApi.forgotPassword(data.email)
      
      if (response.success) {
        setSuccess(true)
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        'リクエストの処理中にエラーが発生しました。'
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
              メールを送信しました
            </h2>
            <p className="text-gray-600 mb-6">
              パスワードリセットの手順を記載したメールを送信しました。
              <br />
              メールボックスをご確認ください。
            </p>
            <p className="text-sm text-gray-500 mb-6">
              メールが届かない場合は、迷惑メールフォルダも
              <br />
              ご確認ください。
            </p>
            <Link
              href="/login"
              className="cute-button inline-block"
            >
              ログインページへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
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
              パスワードをお忘れの方
            </h1>
            <p className="text-gray-600 mt-2">
              登録されたメールアドレスに
              <br />
              パスワードリセットの案内を送信します
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cute-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  送信中...
                </>
              ) : (
                'リセットメールを送信'
              )}
            </button>
          </form>

          <div className="mt-6">
            <Link
              href="/login"
              className="flex items-center justify-center text-sm text-peach-600 hover:text-peach-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              ログインページに戻る
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