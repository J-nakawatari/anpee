"use client";

import { useState } from "react";
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
import { 
  mockUserAccount, 
  mockSecurityLogs,
  getActionLabel,
  sendEmailVerification,
  changePassword,
  deleteAccount,
  toggleTwoFactor,
  type UserAccount,
  type SecurityLog
} from "../data/accountData";

export function AccountSettingsPage() {
  const [userAccount, setUserAccount] = useState<UserAccount>(mockUserAccount);
  const [securityLogs] = useState<SecurityLog[]>(mockSecurityLogs);
  
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
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // ダイアログ状態
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // ローディング状態
  const [isLoading, setIsLoading] = useState({
    email: false,
    password: false,
    delete: false,
    twoFactor: false
  });

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
      await sendEmailVerification(emailForm.newEmail);
      toast.success('確認メールを送信しました。メールをご確認ください。');
      setShowEmailDialog(false);
      setEmailForm({ newEmail: '', confirmEmail: '' });
    } catch (error) {
      toast.error('メールアドレスの変更に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, email: false }));
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
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('パスワードを変更しました');
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'パスワードの変更に失敗しました');
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
      await deleteAccount(deletePassword);
      toast.success('アカウントを削除しました');
      // 実際の実装では、ログアウトしてログイン画面にリダイレクト
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'アカウントの削除に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
      setShowDeleteDialog(false);
      setDeletePassword('');
    }
  };

  // 2段階認証の切り替え
  const handleTwoFactorToggle = async (enabled: boolean) => {
    setIsLoading(prev => ({ ...prev, twoFactor: true }));
    
    try {
      await toggleTwoFactor(enabled);
      setUserAccount(prev => ({ ...prev, twoFactorEnabled: enabled }));
      toast.success(enabled ? '2段階認証を有効にしました' : '2段階認証を無効にしました');
      if (enabled) {
        setShowTwoFactorDialog(true);
      }
    } catch (error) {
      toast.error('2段階認証の設定に失敗しました');
    } finally {
      setIsLoading(prev => ({ ...prev, twoFactor: false }));
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-500">名前</Label>
              <p className="text-gray-900 mt-1 font-medium">{userAccount.lastName} {userAccount.firstName}</p>
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
              <Label className="text-sm font-medium text-gray-500">登録日</Label>
              <p className="text-gray-900 mt-1 font-medium">
                {new Date(userAccount.registrationDate).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-500">最終ログイン</Label>
              <p className="text-gray-900 mt-1 font-medium">
                {new Date(userAccount.lastLoginDate).toLocaleString('ja-JP')}
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

          <Separator />

          {/* 2段階認証 */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">2段階認証</h4>
              <p className="text-sm text-gray-600">
                ログイン時に追加の認証を要求してセキュリティを強化します
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={userAccount.twoFactorEnabled ? "default" : "secondary"}>
                {userAccount.twoFactorEnabled ? "有効" : "無効"}
              </Badge>
              <Switch
                checked={userAccount.twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
                disabled={isLoading.twoFactor}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* セキュリティログ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            最近のアクティビティ
          </CardTitle>
          <CardDescription>
            最近のセキュリティ関連の活動履歴
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.action === 'login' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {log.action === 'password_change' && <Lock className="w-4 h-4 text-blue-600" />}
                    {log.action === 'email_change' && <Mail className="w-4 h-4 text-purple-600" />}
                    {log.action === 'two_factor_enabled' && <Shield className="w-4 h-4 text-orange-600" />}
                    {log.action === 'two_factor_disabled' && <Shield className="w-4 h-4 text-gray-600" />}
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
                    <span>{log.location}</span>
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

      {/* 2段階認証設定ダイアログ */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>2段階認証を設定</DialogTitle>
            <DialogDescription>
              認証アプリでQRコードをスキャンしてください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <p className="text-gray-500 text-sm">QRコード<br />（デモ用）</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">手順：</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Google Authenticator等の認証アプリをダウンロード</li>
                <li>アプリでQRコードをスキャン</li>
                <li>表示された6桁のコードを入力</li>
              </ol>
            </div>
            <div>
              <Label htmlFor="verificationCode">認証コード（6桁）</Label>
              <Input
                id="verificationCode"
                type="text"
                maxLength={6}
                placeholder="123456"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)}>
              後で設定
            </Button>
            <Button onClick={() => setShowTwoFactorDialog(false)}>
              設定完了
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}