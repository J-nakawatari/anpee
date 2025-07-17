'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  AlertCircle,
  Check,
  Shield,
  Trash2,
  Save
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// バリデーションスキーマ
const profileSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
  phone: z.string().regex(/^[0-9-]+$/, '正しい電話番号を入力してください').optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function AccountPage() {
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  // プロフィールフォーム
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '山田 太郎',
      email: 'user@example.com',
      phone: '090-1234-5678'
    }
  })

  // パスワードフォーム
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileSaving(true)
    try {
      // API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      showSuccess('プロフィールを更新しました')
    } catch (error) {
      console.error('更新エラー:', error)
    } finally {
      setIsProfileSaving(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordSaving(true)
    try {
      // API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000))
      showSuccess('パスワードを更新しました')
      resetPasswordForm()
    } catch (error) {
      console.error('更新エラー:', error)
    } finally {
      setIsPasswordSaving(false)
    }
  }

  const showSuccess = (message: string) => {
    setShowSuccessMessage(message)
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  const handleDeleteAccount = async () => {
    // アカウント削除処理
    console.log('アカウント削除')
  }

  return (
    <DashboardLayout activeItem="account">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">アカウント設定</h1>
          <p className="text-gray-600 mt-2">
            アカウント情報の確認と変更ができます
          </p>
        </div>

        {/* 成功メッセージ */}
        {showSuccessMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {showSuccessMessage}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="security">セキュリティ</TabsTrigger>
            <TabsTrigger value="danger">危険な操作</TabsTrigger>
          </TabsList>

          {/* プロフィールタブ */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  プロフィール情報
                </CardTitle>
                <CardDescription>
                  アカウントの基本情報を管理します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">お名前</Label>
                    <Input
                      id="name"
                      {...registerProfile('name')}
                      className={profileErrors.name ? 'border-red-500' : ''}
                    />
                    {profileErrors.name && (
                      <p className="text-sm text-red-500">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        {...registerProfile('email')}
                        className={profileErrors.email ? 'border-red-500' : ''}
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        {...registerProfile('phone')}
                        placeholder="090-1234-5678"
                        className={profileErrors.phone ? 'border-red-500' : ''}
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="text-sm text-red-500">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isProfileSaving}
                      className="cute-button"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isProfileSaving ? '保存中...' : '変更を保存'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* セキュリティタブ */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  パスワード変更
                </CardTitle>
                <CardDescription>
                  アカウントのパスワードを変更します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">現在のパスワード</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type="password"
                        {...registerPassword('currentPassword')}
                        className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新しいパスワード</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        {...registerPassword('newPassword')}
                        className={passwordErrors.newPassword ? 'border-red-500' : ''}
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerPassword('confirmPassword')}
                        className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      パスワードは8文字以上で、英数字を含めることを推奨します
                    </AlertDescription>
                  </Alert>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isPasswordSaving}
                      className="cute-button"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isPasswordSaving ? '変更中...' : 'パスワードを変更'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* 二段階認証 */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  二段階認証
                </CardTitle>
                <CardDescription>
                  アカウントのセキュリティを強化します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="font-medium text-amber-900">二段階認証は無効です</p>
                    <p className="text-sm text-amber-700 mt-1">
                      二段階認証を有効にすると、ログイン時に追加の確認が必要になります
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    有効にする
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 危険な操作タブ */}
          <TabsContent value="danger">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  アカウントの削除
                </CardTitle>
                <CardDescription>
                  この操作は取り消すことができません
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="border-red-200 bg-red-50 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    アカウントを削除すると、すべてのデータが完全に削除されます。
                    この操作は取り消すことができません。
                  </AlertDescription>
                </Alert>
                
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  アカウントを削除
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 削除確認ダイアログ */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>アカウント削除の確認</CardTitle>
                <CardDescription>
                  本当にアカウントを削除してもよろしいですか？
                  この操作は取り消せません。
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  削除する
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}