"use client";

import { useState } from "react";
import { Copy, QrCode, Mail, Check, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
// QRコードライブラリは不要（LINE公式QRコード画像を使用）
import { ElderlyData } from "../services/elderlyService";

interface LineSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: ElderlyData;
  onSendEmail?: (email: string) => Promise<void>;
}

export function LineSettingsDialog({ 
  open, 
  onOpenChange, 
  person,
  onSendEmail 
}: LineSettingsDialogProps) {
  const [email, setEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { toast } = useToast();

  // LINE公式アカウントのURL
  const lineAccountUrl = "https://lin.ee/DwVFPvoY";
  const lineQrCodeUrl = "https://qr-official.line.me/gs/M_598ulszs_GW.png?oat_content=qr";
  
  // 登録コードをコピー
  const handleCopyCode = async () => {
    if (person.registrationCode) {
      await navigator.clipboard.writeText(`登録:${person.registrationCode}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: "コピーしました",
        description: "登録コードをクリップボードにコピーしました。",
      });
    }
  };

  // LINE URLをコピー
  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(lineAccountUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast({
      title: "コピーしました",
      description: "LINE友だち追加URLをクリップボードにコピーしました。",
    });
  };

  // メール送信
  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "エラー",
        description: "メールアドレスを入力してください。",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // TODO: 実際のメール送信処理を実装
      if (onSendEmail) {
        await onSendEmail(email);
      } else {
        // 仮の処理
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "送信完了",
        description: `${email}に招待メールを送信しました。`,
      });
      
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "送信エラー",
        description: "メールの送信に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>LINE連携設定 - {person.name}さん</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ステップ1: LINE友だち追加 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              LINE公式アカウントを友だち追加
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QRコード */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img 
                    src={lineQrCodeUrl} 
                    alt="LINE友だち追加QRコード" 
                    width={150} 
                    height={150}
                    className="rounded"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  QRコードを読み取って友だち追加
                </p>
              </div>

              {/* URL */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="line-url">友だち追加URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="line-url"
                      value={lineAccountUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                    >
                      {copiedUrl ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  URLをLINEで開くと友だち追加できます
                </p>
              </div>
            </div>
          </div>

          {/* ステップ2: 登録コード入力 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              登録コードを送信
            </h3>

            {person.registrationCode ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="registration-code">登録コード</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="registration-code"
                      value={`登録:${person.registrationCode}`}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    友だち追加後、トーク画面でこのコードを送信してください。
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  登録コードが生成されていません。
                  一度保存してから再度お試しください。
                </p>
              </div>
            )}
          </div>

          {/* メール招待（オプション） */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">メールで招待を送る</h3>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="メールアドレスを入力"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSendingEmail) {
                    handleSendEmail();
                  }
                }}
              />
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail || !email}
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    送信中...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    送信
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              LINE設定手順を記載したメールを送信します
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}