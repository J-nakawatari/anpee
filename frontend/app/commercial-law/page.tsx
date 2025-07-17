import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommercialLawPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="gentle-shadow border-orange-100">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-2xl text-orange-800">特定商取引法に基づく表記</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-orange-700">
              <div className="font-semibold">販売業者</div>
              <div className="md:col-span-2">株式会社あんぴー</div>
              
              <div className="font-semibold">代表責任者</div>
              <div className="md:col-span-2">代表取締役 山田太郎</div>
              
              <div className="font-semibold">所在地</div>
              <div className="md:col-span-2">
                〒100-0001<br />
                東京都千代田区千代田1-1<br />
                あんぴービル5F
              </div>
              
              <div className="font-semibold">電話番号</div>
              <div className="md:col-span-2">03-1234-5678<br />
                <span className="text-sm">（受付時間：平日10:00〜18:00）</span>
              </div>
              
              <div className="font-semibold">メールアドレス</div>
              <div className="md:col-span-2">support@anpee.jp</div>
              
              <div className="font-semibold">URL</div>
              <div className="md:col-span-2">https://anpee.jp</div>
              
              <div className="font-semibold">販売価格</div>
              <div className="md:col-span-2">
                各プランページに記載<br />
                ※すべて税込価格で表示しております
              </div>
              
              <div className="font-semibold">商品以外の必要料金</div>
              <div className="md:col-span-2">
                インターネット接続料金、通信料等はお客様のご負担となります
              </div>
              
              <div className="font-semibold">支払方法</div>
              <div className="md:col-span-2">
                クレジットカード決済（VISA、MasterCard、JCB、American Express、Diners Club）<br />
                銀行振込
              </div>
              
              <div className="font-semibold">支払時期</div>
              <div className="md:col-span-2">
                クレジットカード決済：毎月の利用開始日に自動決済<br />
                銀行振込：請求書発行日より7日以内
              </div>
              
              <div className="font-semibold">サービス提供時期</div>
              <div className="md:col-span-2">
                お申込み完了後、3営業日以内にサービス利用開始
              </div>
              
              <div className="font-semibold">返品・キャンセル</div>
              <div className="md:col-span-2">
                サービスの性質上、返品・返金はお受けしておりません。<br />
                解約をご希望の場合は、次回更新日の7日前までにお申し出ください。
              </div>
              
              <div className="font-semibold">解約方法</div>
              <div className="md:col-span-2">
                マイページの「アカウント設定」より解約手続きが可能です。<br />
                お電話、メールでも承っております。
              </div>
              
              <div className="font-semibold">返金について</div>
              <div className="md:col-span-2">
                月額料金は日割り計算での返金は行っておりません。<br />
                解約後も当月末まではサービスをご利用いただけます。
              </div>
              
              <div className="font-semibold">動作環境</div>
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">推奨ブラウザ：</span><br />
                    Chrome、Firefox、Safari、Edge（いずれも最新版）
                  </div>
                  <div>
                    <span className="font-medium">スマートフォン：</span><br />
                    iOS 14以上、Android 10以上
                  </div>
                  <div>
                    <span className="font-medium">LINE連携：</span><br />
                    LINEアプリのインストールが必要です
                  </div>
                </div>
              </div>
              
              <div className="font-semibold">個人情報の取扱い</div>
              <div className="md:col-span-2">
                お客様の個人情報は、当社プライバシーポリシーに基づき適切に管理いたします。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}