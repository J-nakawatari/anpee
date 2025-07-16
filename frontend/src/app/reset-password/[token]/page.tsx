'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { Heart, Lock, Loader2, Check } from 'lucide-react'

const resetPasswordSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await authApi.resetPassword(token, data.password)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || 
        'パスワードのリセットに失敗しました。'
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
              パスワードがリセットされました
            </h2>
            <p className="text-gray-600">
              新しいパスワードでログインできます。
              <br />
              ログインページに移動します...
            </p>
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
              新しいパスワードを設定
            </h1>
            <p className="text-gray-600 mt-2">
              安全なパスワードを設定してください
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-cute text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                新しいパスワード
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cute-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  設定中...
                </>
              ) : (
                'パスワードをリセット'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}