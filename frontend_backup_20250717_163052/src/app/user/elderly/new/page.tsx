'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const elderlySchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  phone: z.string().regex(/^[0-9-]+$/, '正しい電話番号を入力してください').optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalInfo: z.string().optional(),
  checkTime: z.string(),
  enableLineNotification: z.boolean(),
  enablePhoneCall: z.boolean(),
})

type ElderlyFormData = z.infer<typeof elderlySchema>

export default function NewElderlyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ElderlyFormData>({
    resolver: zodResolver(elderlySchema),
    defaultValues: {
      checkTime: '08:00',
      enableLineNotification: true,
      enablePhoneCall: true,
    }
  })

  const onSubmit = async (data: ElderlyFormData) => {
    setIsSubmitting(true)
    try {
      // APIで家族を登録
      console.log('家族登録データ:', data)
      
      // 成功したら一覧ページに戻る
      router.push('/user/elderly')
    } catch (error) {
      console.error('登録エラー:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout activeItem="elderly">
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">新規家族登録</h1>
          <p className="text-gray-600 mt-2">
            見守りたいご家族の情報を登録してください
          </p>
        </div>

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                ご家族の基本的な情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">お名前 *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="例：田中 花子"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="例：090-1234-5678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">住所</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="例：東京都千代田区..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">緊急連絡先</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  placeholder="例：090-9876-5432"
                />
              </div>

              <div>
                <Label htmlFor="medicalInfo">医療情報・備考</Label>
                <Textarea
                  id="medicalInfo"
                  {...register('medicalInfo')}
                  placeholder="かかりつけ医、持病、服用薬など"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                安否確認の時刻と通知方法を設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="checkTime">安否確認時刻</Label>
                <Select
                  value={watch('checkTime')}
                  onValueChange={(value) => setValue('checkTime', value)}
                >
                  <SelectTrigger id="checkTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lineNotification">LINE通知</Label>
                    <p className="text-sm text-gray-600">
                      LINEで安否確認メッセージを送信します
                    </p>
                  </div>
                  <Switch
                    id="lineNotification"
                    checked={watch('enableLineNotification')}
                    onCheckedChange={(checked) => setValue('enableLineNotification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="phoneCall">自動架電</Label>
                    <p className="text-sm text-gray-600">
                      応答がない場合、自動で電話をかけます
                    </p>
                  </div>
                  <Switch
                    id="phoneCall"
                    checked={watch('enablePhoneCall')}
                    onCheckedChange={(checked) => setValue('enablePhoneCall', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 送信ボタン */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="cute-button"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? '登録中...' : '登録する'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}