import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">

        <Card className="gentle-shadow border-orange-100">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-2xl text-orange-800">利用規約</CardTitle>
            <p className="text-sm text-orange-600 mt-2">最終更新日: 2025年1月17日</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第1条（利用規約の適用）</h2>
              <p className="text-orange-700 leading-relaxed">
                本利用規約は、株式会社あんぴー（以下「当社」といいます）が提供する「あんぴーちゃん」サービス（以下「本サービス」といいます）の利用に関する条件を定めるものです。
                利用者の皆様には、本規約に同意いただいた上で、本サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第2条（サービスの内容）</h2>
              <p className="text-orange-700 leading-relaxed mb-3">
                本サービスは、ご家族の安否確認を支援する見守りサービスです。主な機能は以下の通りです：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>LINEを通じた定期的な安否確認</li>
                <li>電話による安否確認</li>
                <li>応答履歴の記録・管理</li>
                <li>緊急時の通知機能</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第3条（利用登録）</h2>
              <p className="text-orange-700 leading-relaxed">
                本サービスの利用を希望する方は、当社の定める方法により利用登録を申請し、
                当社がこれを承認することによって、本サービスの利用登録が完了するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第4条（利用料金）</h2>
              <p className="text-orange-700 leading-relaxed">
                本サービスの利用料金は、別途定める料金表に従うものとします。
                利用者は、当社の定める方法により利用料金を支払うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第5条（禁止事項）</h2>
              <p className="text-orange-700 leading-relaxed mb-3">
                利用者は、本サービスの利用にあたり、以下の行為をしてはなりません：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>当社または第三者の権利を侵害する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>不正アクセスを試みる行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第6条（個人情報の取扱い）</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本サービスの利用によって取得する個人情報については、
                当社プライバシーポリシーに従い適切に取り扱うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第7条（免責事項）</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。
                また、本サービスに関して利用者が被った損害について、
                当社に故意または重過失がある場合を除き、賠償する責任を負わないものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第8条（サービスの変更・終了）</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、利用者に事前に通知することにより、本サービスの内容を変更し、
                または本サービスの提供を終了することができるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第9条（利用規約の変更）</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
                変更後の本規約は、当社ウェブサイトに掲示された時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">第10条（準拠法・裁判管轄）</h2>
              <p className="text-orange-700 leading-relaxed">
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </section>

            <div className="pt-6 border-t border-orange-200">
              <p className="text-orange-700 text-center">
                以上
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}