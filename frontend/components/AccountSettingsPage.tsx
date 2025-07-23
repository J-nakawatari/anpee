"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  AlertTriangle, 
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { toast } from "@/lib/toast";
import { apiClient } from "@/services/apiClient";

// 型定義
interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  currentPlan?: string;
  subscriptionStatus?: string;
}

interface LoginHistory {
  id: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export function AccountSettingsPage() {
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // フォーム状態
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [phoneForm, setPhoneForm] = useState('');
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // ダイアログ状態
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // ローディング状態
  const [isLoading, setIsLoading] = useState({
    email: false,
    password: false,
    phone: false,
    delete: false,
    notificationSettings: false
  });

  // メール通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      enabled: false,
      address: ''
    }
  });

  // 完全な通知設定を保持（他の設定を保存時に維持するため）
  const [fullNotificationSettings, setFullNotificationSettings] = useState<any>(null);

  // ユーザープロフィールとログイン履歴を取得
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingProfile(true);
        
        // ユーザープロフィールを取得
        const profileResponse = await apiClient.get('/users/profile');
        if (profileResponse.data.success) {
          setUserAccount(profileResponse.data.data);
          setPhoneForm(profileResponse.data.data.phone || '');
        }
        
        // ログイン履歴を取得
        const historyResponse = await apiClient.get('/users/login-history?limit=10');
        if (historyResponse.data.success) {
          setLoginHistory(historyResponse.data.data);
        }
      } catch (error) {
        console.error('ユーザーデータの取得エラー:', error);
        toast.error('ユーザー情報の取得に失敗しました');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadUserData();
  }, []);

  // 通知設定を取得
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const response = await apiClient.get('/notifications/settings');
        const { settings } = response.data;
        
        setFullNotificationSettings(settings);
        
        if (settings?.methods?.email) {
          setNotificationSettings({
            email: settings.methods.email
          });
        }
      } catch (error) {
        console.error('通知設定の取得エラー:', error);
      }
    };

    loadNotificationSettings();
  }, []);

  // 通知設定を保存
  const saveNotificationSettings = async () => {
    setIsLoading(prev => ({ ...prev, notificationSettings: true }));
    
    try {
      // 既存の設定を維持しながら、メール設定のみ更新
      const settingsToSave = {
        ...(fullNotificationSettings || {}),
        methods: {
          ...(fullNotificationSettings?.methods || {}),
          email: notificationSettings.email
        }
      };
      
      await apiClient.put('/notifications/settings', {
        settings: settingsToSave
      });
      
      toast.success('通知設定を保存しました');
    } catch (error) {
      console.error('通知設定の保存エラー:', error);
      toast.error('通知設定の保存に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, notificationSettings: false }));
    }
  };

  // メールアドレス変更
  const handleEmailChange = async () => {
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      toast.error('メールアドレスが一致しません');
      return;
    }
    
    if (!emailForm.newEmail.includes('@')) {
      toast.error('有効なメールアドレスを入力してください');
      return;
    }

    setIsLoading(prev => ({ ...prev, email: true }));
    
    try {
      const response = await apiClient.post('/users/change-email', {
        newEmail: emailForm.newEmail
      });
      
      if (response.data.success) {
        toast.success('確認メールを送信しました。メールをご確認ください。');
        setShowEmailDialog(false);
        setEmailForm({ newEmail: '', confirmEmail: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'メールアドレスの変更に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  // 電話番号更新
  const handlePhoneUpdate = async () => {
    setIsLoading(prev => ({ ...prev, phone: true }));
    
    try {
      const response = await apiClient.put('/users/profile', {
        phone: phoneForm
      });
      
      if (response.data.success) {
        toast.success('電話番号を更新しました');
        setUserAccount(prev => prev ? { ...prev, phone: phoneForm } : null);
        setShowPhoneDialog(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '電話番号の更新に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, phone: false }));
    }
  };

  // パスワード変更
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('パスワードは8文字以上で設定してください');
      return;
    }

    setIsLoading(prev => ({ ...prev, password: true }));
    
    try {
      const response = await apiClient.post('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        toast.success('パスワードを変更しました');
        setShowPasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'パスワードの変更に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  // アカウント削除
  const handleAccountDelete = async () => {
    if (!deletePassword) {
      toast.error('パスワードを入力してください');
      return;
    }

    setIsLoading(prev => ({ ...prev, delete: true }));
    
    try {
      const response = await apiClient.delete('/users/account', {
        data: { password: deletePassword }
      });
      
      if (response.data.success) {
        toast.success('アカウントを削除しました');
        // ログアウトしてログイン画面にリダイレクト
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'アカウントの削除に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
      setShowDeleteDialog(false);
      setDeletePassword('');
    }
  };

  // アクションのラベルを取得
  const getActionLabel = (action: string): string => {
    const labels: { [key: string]: string } = {
      login: 'ログイン',
      logout: 'ログアウト',
      password_change: 'パスワード変更',
      email_change: 'メールアドレス変更',
      failed_login: 'ログイン失敗'
    };
    return labels[action] || action;
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">ユーザー情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!userAccount) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">ユーザー情報の取得に失敗しました</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* アカウント情報 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            アカウント情報
          </CardTitle>
          <CardDescription>
            基本的なアカウント情報
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* アカウント情報 - 横並び */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-500">名前</Label>
              <p className="text-gray-900 mt-1 font-medium">{userAccount.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-500">メールアドレス</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-900 font-medium">{userAccount.email}</p>
                {userAccount.emailVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-500">電話番号</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-900 font-medium">{userAccount.phone || '未設定'}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhoneDialog(true)}
                >
                  編集
                </Button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-500">登録日</Label>
              <p className="text-gray-900 mt-1 font-medium">
                {new Date(userAccount.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>

          {/* メールアドレス変更ボタン */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              メールアドレスを変更
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* セキュリティ設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            セキュリティ設定
          </CardTitle>
          <CardDescription>
            アカウントのセキュリティを強化します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* パスワード変更 */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">パスワード</h4>
              <p className="text-sm text-gray-600">アカウントのパスワードを変更します</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              パスワード変更
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* 管理者通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            管理者通知設定
          </CardTitle>
          <CardDescription>
            家族からの応答状況や日次サマリーをメールで受け取る設定です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">メール通知</h4>
              <p className="text-sm text-gray-600">
                家族から応答がない場合や日次サマリーをメールで受け取ります
              </p>
            </div>
            <Switch
              checked={notificationSettings.email.enabled}
              onCheckedChange={(checked) => {
                setNotificationSettings(prev => ({
                  ...prev,
                  email: { ...prev.email, enabled: checked }
                }));
              }}
            />
          </div>

          {notificationSettings.email.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="notification-email">通知先メールアドレス</Label>
                <Input
                  id="notification-email"
                  type="email"
                  placeholder="example@domain.com"
                  value={notificationSettings.email.address}
                  onChange={(e) => {
                    setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, address: e.target.value }
                    }));
                  }}
                />
                <p className="text-sm text-gray-500">
                  登録メールアドレスとは別のアドレスも指定できます
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>通知内容:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• 再通知回数に達しても応答がない場合の通知</li>
                    <li>• 毎日21時に送信される日次サマリー</li>
                    <li>• その他重要なお知らせ</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="flex justify-end">
            <Button
              onClick={saveNotificationSettings}
              disabled={isLoading.notificationSettings}
            >
              {isLoading.notificationSettings ? '保存中...' : '通知設定を保存'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ログイン履歴 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            最近のアクティビティ
          </CardTitle>
          <CardDescription>
            最近のログインとセキュリティ関連の活動履歴
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loginHistory.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.action === 'login' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {log.action === 'logout' && <XCircle className="w-4 h-4 text-gray-600" />}
                    {log.action === 'password_change' && <Lock className="w-4 h-4 text-blue-600" />}
                    {log.action === 'email_change' && <Mail className="w-4 h-4 text-purple-600" />}
                    {log.action === 'failed_login' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span className="font-medium text-gray-900">{getActionLabel(log.action)}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(log.timestamp).toLocaleDateString('ja-JP')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleString('ja-JP')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getDeviceIcon(log.userAgent)}
                    <span>
                      {log.userAgent.includes('iPhone') ? 'iPhone' : 
                       log.userAgent.includes('Android') ? 'Android' : 'Desktop'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{log.ipAddress}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 危険な操作 */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            危険な操作
          </CardTitle>
          <CardDescription>
            これらの操作は取り消すことができません
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              アカウントを削除すると、すべてのデータが完全に削除され、復元することはできません。
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              アカウントを削除
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* メールアドレス変更ダイアログ */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メールアドレスの変更</DialogTitle>
            <DialogDescription>
              新しいメールアドレスに確認メールを送信します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEmail">新しいメールアドレス</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="new@example.com"
              />
            </div>
            <div>
              <Label htmlFor="confirmEmail">メールアドレス（確認）</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={emailForm.confirmEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, confirmEmail: e.target.value }))}
                placeholder="new@example.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={handleEmailChange}
              disabled={isLoading.email}
            >
              {isLoading.email ? '送信中...' : '確認メールを送信'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* パスワード変更ダイアログ */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>パスワードの変更</DialogTitle>
            <DialogDescription>
              現在のパスワードと新しいパスワードを入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">現在のパスワード</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>パスワードは以下の条件を満たしてください：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>8文字以上</li>
                <li>大文字・小文字を含む</li>
                <li>数字を含む</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isLoading.password}
            >
              {isLoading.password ? '変更中...' : 'パスワードを変更'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 電話番号編集ダイアログ */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>電話番号の編集</DialogTitle>
            <DialogDescription>
              電話番号を入力してください（ハイフンなし）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneForm}
                onChange={(e) => setPhoneForm(e.target.value)}
                placeholder="09012345678"
              />
              <p className="text-sm text-gray-500 mt-1">
                例：09012345678（ハイフンなし）
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={handlePhoneUpdate}
              disabled={isLoading.phone}
            >
              {isLoading.phone ? '更新中...' : '更新'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* アカウント削除ダイアログ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">アカウントの削除</DialogTitle>
            <DialogDescription>
              この操作は取り消すことができません。すべてのデータが完全に削除されます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                削除されるデータ：見守り対象者の情報、通話履歴、設定、請求履歴など
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="deletePassword">パスワードを入力して確認</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="パスワードを入力"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              キャンセル
            </Button>
            <Button 
              variant="destructive"
              onClick={handleAccountDelete}
              disabled={isLoading.delete}
            >
              {isLoading.delete ? '削除中...' : 'アカウントを削除'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}