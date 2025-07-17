// アカウント情報の型定義
export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationDate: string;
  lastLoginDate: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  loginCount: number;
}

// セキュリティログの型定義
export interface SecurityLog {
  id: string;
  action: 'login' | 'password_change' | 'email_change' | 'two_factor_enabled' | 'two_factor_disabled';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

// Mock ユーザーデータ
export const mockUserAccount: UserAccount = {
  id: 'user_001',
  email: 'user@example.com',
  firstName: '太郎',
  lastName: '山田',
  registrationDate: '2024-01-15',
  lastLoginDate: '2024-07-14T09:30:00',
  emailVerified: true,
  twoFactorEnabled: false,
  loginCount: 156
};

// Mock セキュリティログ
export const mockSecurityLogs: SecurityLog[] = [
  {
    id: 'log_001',
    action: 'login',
    timestamp: '2024-07-14T09:30:00',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: '東京, 日本'
  },
  {
    id: 'log_002',
    action: 'login',
    timestamp: '2024-07-13T18:45:00',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    location: '東京, 日本'
  },
  {
    id: 'log_003',
    action: 'password_change',
    timestamp: '2024-06-20T14:20:00',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: '東京, 日本'
  }
];

// アクションの日本語表示
export const getActionLabel = (action: SecurityLog['action']) => {
  switch (action) {
    case 'login': return 'ログイン';
    case 'password_change': return 'パスワード変更';
    case 'email_change': return 'メールアドレス変更';
    case 'two_factor_enabled': return '2段階認証有効化';
    case 'two_factor_disabled': return '2段階認証無効化';
    default: return action;
  }
};

// メールアドレス変更の確認メール送信（模擬関数）
export const sendEmailVerification = async (newEmail: string) => {
  // 実際の実装では、バックエンドAPIを呼び出してメール送信
  console.log(`Verification email sent to: ${newEmail}`);
  return { success: true, message: '確認メールを送信しました' };
};

// パスワード変更（模擬関数）
export const changePassword = async (currentPassword: string, newPassword: string) => {
  // 実際の実装では、バックエンドAPIを呼び出してパスワード変更
  if (currentPassword === 'wrong_password') {
    throw new Error('現在のパスワードが正しくありません');
  }
  console.log('Password changed successfully');
  return { success: true, message: 'パスワードを変更しました' };
};

// アカウント削除（模擬関数）
export const deleteAccount = async (password: string) => {
  // 実際の実装では、バックエンドAPIを呼び出してアカウント削除
  if (password === 'wrong_password') {
    throw new Error('パスワードが正しくありません');
  }
  console.log('Account deleted successfully');
  return { success: true, message: 'アカウントを削除しました' };
};

// 2段階認証の有効化/無効化（模擬関数）
export const toggleTwoFactor = async (enabled: boolean, password?: string) => {
  // 実際の実装では、バックエンドAPIを呼び出して2段階認証設定
  console.log(`Two factor authentication ${enabled ? 'enabled' : 'disabled'}`);
  return { 
    success: true, 
    message: enabled ? '2段階認証を有効にしました' : '2段階認証を無効にしました',
    qrCode: enabled ? 'data:image/png;base64,mock_qr_code' : undefined
  };
};