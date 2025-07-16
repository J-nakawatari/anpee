import { useState } from "react";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Send, 
  Check, 
  X,
  AlertCircle,
  Settings,
  RotateCcw,
  Crown,
  ArrowUp,
  Copy,
  QrCode,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { getCurrentUserPlan, formatRetryInterval, getUpgradeInfo, type SubscriptionPlan } from "../data/subscriptionPlans";

interface NotificationSettings {
  timing: {
    morning: {
      enabled: boolean;
      time: string;
    };
    evening: {
      enabled: boolean;
      time: string;
    };
  };
  retry: {
    enabled: boolean;
    maxCount: number;
    intervalMinutes: number;
  };
  methods: {
    email: {
      enabled: boolean;
      address: string;
    };
  };
}

export function NotificationSettingsPage() {
  const [currentPlan] = useState<SubscriptionPlan>(getCurrentUserPlan());
  
  const [settings, setSettings] = useState<NotificationSettings>({
    timing: {
      morning: {
        enabled: true,
        time: "07:00"
      },
      evening: {
        enabled: true,
        time: "20:00"
      }
    },
    retry: {
      enabled: true,
      maxCount: Math.min(2, currentPlan.features.maxRetryCount),
      intervalMinutes: currentPlan.features.retryIntervals[0] || 60
    },
    methods: {
      email: {
        enabled: true,
        address: ""
      }
    }
  });

  const [testResults, setTestResults] = useState<{[key: string]: 'success' | 'error' | null}>({
    email: null
  });

  const [isTestingSending, setIsTestingSending] = useState<{[key: string]: boolean}>({
    email: false
  });

  // LINE招待関連の状態
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteSending, setIsInviteSending] = useState(false);

  // ダミーのLINE友だち追加URL
  const lineAddUrl = "https://lin.ee/XXXXXXXX";

  const updateTimingSetting = (period: 'morning' | 'evening', field: 'enabled' | 'time', value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        [period]: {
          ...prev.timing[period],
          [field]: value
        }
      }
    }));
  };

  const updateRetrySetting = (field: keyof NotificationSettings['retry'], value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      retry: {
        ...prev.retry,
        [field]: value
      }
    }));
  };

  const updateMethodSetting = (method: 'email', field: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [method]: {
          ...prev.methods[method],
          [field]: value
        }
      }
    }));
  };

  const handleTestSend = async (method: 'email') => {
    setIsTestingSending(prev => ({...prev, [method]: true}));
    setTestResults(prev => ({...prev, [method]: null}));

    try {
      // 模擬的なAPIコール
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 実際の実装では適切なバリデーションと送信処理を行う
      let success = false;
      
      switch (method) {
        case 'email':
          success = settings.methods.email.enabled && 
                   settings.methods.email.address.includes('@');
          break;
      }
      
      setTestResults(prev => ({...prev, [method]: success ? 'success' : 'error'}));
      
      if (success) {
        toast.success(`${getMethodName(method)}のテスト送信が完了しました`);
      } else {
        toast.error(`${getMethodName(method)}のテスト送信に失敗しました`);
      }
      
    } catch (error) {
      setTestResults(prev => ({...prev, [method]: 'error'}));
      toast.error(`${getMethodName(method)}のテスト送信でエラーが発生しました`);
    } finally {
      setIsTestingSending(prev => ({...prev, [method]: false}));
    }
  };

  const getMethodName = (method: 'email') => {
    switch (method) {
      case 'email': return 'メール';
    }
  };

  // URLをクリップボードにコピー
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(lineAddUrl);
      toast.success('URLをコピーしました');
    } catch (error) {
      toast.error('URLのコピーに失敗しました');
    }
  };

  // 招待リンクをメール送信
  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error('メールアドレスを入力してください');
      return;
    }
    
    if (!inviteEmail.includes('@')) {
      toast.error('有効なメールアドレスを入力してください');
      return;
    }

    setIsInviteSending(true);
    
    try {
      // 模擬的なAPIコール
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${inviteEmail}に招待リンクを送信しました`);
      setInviteEmail('');
    } catch (error) {
      toast.error('招待リンクの送信に失敗しました');
    } finally {
      setIsInviteSending(false);
    }
  };

  const handleSaveSettings = () => {
    // 実際の実装では設定をAPIに保存
    toast.success('通知設定を保存しました');
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'bg-gray-100 text-gray-700';
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 現在のプラン表示 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-blue-600" />
            現在のプラン
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getPlanBadgeColor(currentPlan.id)}>
                {currentPlan.displayName}
              </Badge>
              <span className="text-sm text-gray-600">
                月額 ¥{currentPlan.price.toLocaleString()}
              </span>
            </div>
            <Button variant="outline" size="sm">
              プラン変更
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 通知タイミング設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            通知タイミング設定
          </CardTitle>
          <CardDescription>
            通知を送信する時間帯を設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 朝の通知設定 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">朝の通知</Label>
              <p className="text-sm text-gray-500">毎朝の見守り開始通知</p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={settings.timing.morning.time}
                onValueChange={(value) => updateTimingSetting('morning', 'time', value)}
                disabled={!settings.timing.morning.enabled}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Switch
                checked={settings.timing.morning.enabled}
                onCheckedChange={(checked) => updateTimingSetting('morning', 'enabled', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* 夜の通知設定 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">夜の通知</Label>
              <p className="text-sm text-gray-500">毎夜の見守り完了通知</p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={settings.timing.evening.time}
                onValueChange={(value) => updateTimingSetting('evening', 'time', value)}
                disabled={!settings.timing.evening.enabled}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Switch
                checked={settings.timing.evening.enabled}
                onCheckedChange={(checked) => updateTimingSetting('evening', 'enabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 再通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            再通知設定
          </CardTitle>
          <CardDescription>
            応答がない場合の再通知ルールを設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">再通知を有効にする</Label>
              <p className="text-sm text-gray-500">応答がない場合に自動で再通知します</p>
            </div>
            <Switch
              checked={settings.retry.enabled}
              onCheckedChange={(checked) => updateRetrySetting('enabled', checked)}
            />
          </div>

          {settings.retry.enabled && (
            <>
              <Separator />
              
              {/* 再通知回数設定 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">再通知回数</Label>
                    <p className="text-sm text-gray-500">
                      最大 {currentPlan.features.maxRetryCount} 回まで設定可能
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={settings.retry.maxCount.toString()}
                      onValueChange={(value) => updateRetrySetting('maxCount', parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: currentPlan.features.maxRetryCount}, (_, i) => i + 1).map(count => (
                          <SelectItem key={count} value={count.toString()}>
                            {count}回
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {settings.retry.maxCount === currentPlan.features.maxRetryCount && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    現在のプランの上限です。より多くの再通知が必要な場合は上位プランをご検討ください。
                  </div>
                )}
              </div>

              <Separator />

              {/* 再通知間隔設定 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">再通知間隔</Label>
                    <p className="text-sm text-gray-500">
                      応答がない場合の次回通知までの間隔
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={settings.retry.intervalMinutes.toString()}
                      onValueChange={(value) => updateRetrySetting('intervalMinutes', parseInt(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentPlan.features.retryIntervals.map(interval => (
                          <SelectItem key={interval} value={interval.toString()}>
                            {formatRetryInterval(interval)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {currentPlan.features.retryIntervals.length < 5 && (
                  <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    <ArrowUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">上位プランで更に細かい設定が可能</span>
                      <br />
                      プレミアムプランでは15分間隔から設定できます
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* LINE通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            LINE通知設定
          </CardTitle>
          <CardDescription>
            公式LINEアカウントを友だち追加してLINE通知を受け取る
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QRコードとURL */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-900">友だち追加方法</Label>
              <p className="text-sm text-gray-500 mt-1">
                以下のQRコードまたはURLから公式LINEアカウントを友だち追加してください
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* QRコード */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">QRコード</p>
                    <p className="text-xs text-gray-400">(デモ用)</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  スマホのカメラで<br />読み取ってください
                </p>
              </div>

              {/* URL */}
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">友だち追加URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={lineAddUrl}
                      readOnly
                      className="flex-1 text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      コピー
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">メールで招待リンクを送る</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="example@domain.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleSendInvite}
                      disabled={isInviteSending}
                      className="flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      {isInviteSending ? '送信中...' : '招待リンクを送る'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 利用手順 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">利用手順</Label>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>上記のQRコードまたはURLから公式LINEアカウントを友だち追加</li>
                <li>LINEで「通知開始」メッセージを送信</li>
                <li>アカウント連携の案内に従って設定完了</li>
                <li>設定完了後、見守り通知がLINEで届きます</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* メール通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            メール通知設定
          </CardTitle>
          <CardDescription>
            メールでの通知を設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">メール通知を有効にする</Label>
            <Switch
              checked={settings.methods.email.enabled}
              onCheckedChange={(checked) => updateMethodSetting('email', 'enabled', checked)}
            />
          </div>

          {settings.methods.email.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-address">メールアドレス</Label>
                <Input
                  id="email-address"
                  type="email"
                  placeholder="example@domain.com"
                  value={settings.methods.email.address}
                  onChange={(e) => updateMethodSetting('email', 'address', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestSend('email')}
                  disabled={isTestingSending.email}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isTestingSending.email ? '送信中...' : 'テスト送信'}
                </Button>
                {testResults.email === 'success' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">送信成功</span>
                  </div>
                )}
                {testResults.email === 'error' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <X className="w-4 h-4" />
                    <span className="text-sm">送信失敗</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>注意事項:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• LINE通知を利用するには公式アカウントの友だち追加とアカウント連携が必要です</li>
            <li>• メールのテスト送信は実際の通知と同じ内容で送信されます</li>
            <li>• 再通知設定はプランによって制限があります</li>
            <li>• 通知設定の変更は即座に反映されます</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 保存ボタン */}
      <div className="flex justify-end mb-20">
        <Button 
          onClick={handleSaveSettings} 
          size="lg"
          className="flex items-center gap-2 px-8 py-3 text-base font-medium"
        >
          <Settings className="w-5 h-5" />
          設定を保存
        </Button>
      </div>
    </div>
  );
}