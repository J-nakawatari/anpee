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
              <div className="md:col-span-2">中渡 潤</div>
              
              <div className="font-semibold">運営責任者</div>
              <div className="md:col-span-2">中渡 潤</div>
              
              <div className="font-semibold">所在地</div>
              <div className="md:col-span-2">
                お客様からのお問い合わせに迅速に対応するため、<br />
                所在地は開示しておりません。<br />
                お問い合わせはメールまたはお問い合わせフォームよりお願いいたします。
              </div>
              
              <div className="font-semibold">お問い合わせ</div>
              <div className="md:col-span-2">
                メールまたはお問い合わせフォームよりお願いいたします<br />
                <span className="text-sm">（対応時間：平日10:00〜18:00 ※土日祝日を除く）</span>
              </div>
              
              <div className="font-semibold">メールアドレス</div>
              <div className="md:col-span-2">support@anpee.jp</div>
              
              <div className="font-semibold">URL</div>
              <div className="md:col-span-2">https://anpee.jp</div>
              
              <div className="font-semibold">販売価格</div>
              <div className="md:col-span-2">
                スタンダードプラン：月額 1,480円（税込）<br />
                ファミリープラン：月額 2,480円（税込）<br />
                ※価格はすべて税込表示です
              </div>
              
              <div className="font-semibold">商品以外の必要料金</div>
              <div className="md:col-span-2">
                インターネット接続料金、通信料等はお客様のご負担となります
              </div>
              
              <div className="font-semibold">支払方法</div>
              <div className="md:col-span-2">
                クレジットカード決済（Stripe決済）<br />
                ※VISA、MasterCard、American Express、JCB、Diners Club、Discoverがご利用いただけます
              </div>
              
              <div className="font-semibold">支払時期</div>
              <div className="md:col-span-2">
                クレジットカード決済：お申込み時および毎月の更新日に自動決済
              </div>
              
              <div className="font-semibold">サービス提供時期</div>
              <div className="md:col-span-2">
                お申込み・決済完了後、即時サービス利用開始
              </div>
              
              <div className="font-semibold">返品・キャンセル</div>
              <div className="md:col-span-2">
                デジタルサービスの性質上、返品・返金はお受けしておりません。<br />
                ただし、当社の責めに帰すべき事由により、<br />
                サービスが正常に提供されなかった場合はこの限りではありません。
              </div>
              
              <div className="font-semibold">解約方法</div>
              <div className="md:col-span-2">
                マイページの「プラン・支払い管理」より解約手続きが可能です。<br />
                解約はいつでも可能で、次回更新日の前日までに解約いただければ、<br />
                次回の課金は発生しません。
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
                    LINEアプリのインストールおよびLINE連携が必要です
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