import { LegalPageLayout } from '@/components/LegalPageLayout'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="プライバシーポリシー">
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">基本方針</h2>
          <p className="text-gray-600">
            当サービスは、お客様の個人情報保護の重要性を認識し、適切に管理・保護することをお約束します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">収集する情報</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>お名前、メールアドレス、電話番号</li>
            <li>見守り対象者の情報</li>
            <li>サービス利用履歴</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">利用目的</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-600">
            <li>サービスの提供・運営</li>
            <li>お客様へのご連絡</li>
            <li>サービスの改善</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">情報の管理</h2>
          <p className="text-gray-600">
            お客様の個人情報は適切に管理し、不正アクセス・紛失・破損・改ざん・漏洩などを防ぐため、必要な対策を講じます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">お問い合わせ</h2>
          <p className="text-gray-600">
            個人情報に関するお問い合わせは、サポートまでご連絡ください。
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