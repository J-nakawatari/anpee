import { LegalPageLayout } from '@/components/LegalPageLayout'

export default function CommercialLawPage() {
  return (
    <LegalPageLayout title="特定商取引法に基づく表記">
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">販売業者</h2>
          <p className="text-gray-600">あんぴーちゃん運営事務局</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">販売価格</h2>
          <p className="text-gray-600">
            サービス内の料金表示をご確認ください。
            全て税込価格で表示しています。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">お支払い方法</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>クレジットカード決済</li>
            <li>デビットカード決済</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">サービスの提供時期</h2>
          <p className="text-gray-600">
            お支払い確認後、即時サービスをご利用いただけます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">返品・キャンセル</h2>
          <p className="text-gray-600">
            サービスの性質上、返品・返金はお受けできません。
            解約はいつでも可能です。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">お問い合わせ</h2>
          <p className="text-gray-600">
            ご不明な点はサポートまでお問い合わせください。
          </p>
        </section>

        <section className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            最終更新日：2024年7月16日
          </p>
        </section>
      </div>
    </LegalPageLayout>
  )
}