import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="gentle-shadow border-orange-100">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-2xl text-orange-800">プライバシーポリシー</CardTitle>
            <p className="text-sm text-orange-600 mt-2">最終更新日: 2025年1月23日</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <section>
              <p className="text-orange-700 leading-relaxed mb-4">
                中渡 潤（以下「当社」といいます）は、お客様の個人情報保護の重要性について認識し、
                個人情報の保護に関する法律（以下「個人情報保護法」といいます）を遵守すると共に、
                以下のプライバシーポリシーに従って、お客様の個人情報を適切に取扱い、保護いたします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">1. 個人情報の定義</h2>
              <p className="text-orange-700 leading-relaxed">
                個人情報とは、個人情報保護法にいう「個人情報」を指すものとし、
                生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、
                住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報、
                並びに個人識別符号その他の個人を識別できる情報を指します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">2. 個人情報の収集方法</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本サービスの提供にあたり、以下の個人情報を収集します：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>アカウント情報：氏名、メールアドレス、パスワード</li>
                <li>家族情報：見守り対象者の氏名、関係性、電話番号（任意）</li>
                <li>LINE連携情報：LINEユーザーID、表示名</li>
                <li>決済情報：クレジットカード情報（Stripe経由）</li>
                <li>利用履歴：サービス利用状況、応答履歴、アクセスログ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">3. 個人情報を収集・利用する目的</h2>
              <p className="text-orange-700 leading-relaxed mb-3">
                当社が個人情報を収集・利用する目的は、以下のとおりです：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>本サービスの提供・運営のため</li>
                <li>家族の安否確認の実施と通知のため</li>
                <li>お客様からのお問い合わせに回答するため</li>
                <li>サービスの改善・新機能開発のため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反したお客様や、不正・不当な目的でサービスを利用しようとするお客様の特定をし、ご利用をお断りするため</li>
                <li>お客様にご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                <li>有料サービスにおいて、お客様に利用料金を請求するため</li>
                <li>上記の利用目的に付随する目的</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">4. 個人情報の第三者提供</h2>
              <p className="text-orange-700 leading-relaxed mb-3">
                1. 当社は、次に掲げる場合を除いて、あらかじめお客様の同意を得ることなく、
                第三者に個人情報を提供することはありません：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
              <p className="text-orange-700 leading-relaxed mt-3 mb-3">
                2. 以下のサービス提供者に対して、本サービスの提供に必要な範囲で個人情報を提供します：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>LINE株式会社：LINE連携機能の提供のため</li>
                <li>Stripe：決済処理のため</li>
                <li>MongoDB Atlas：データ保存のため</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">5. 個人情報のセキュリティ</h2>
              <p className="text-orange-700 leading-relaxed mb-3">
                当社は、お客様の個人情報を適切に管理し、以下のセキュリティ対策を実施しています：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>SSL/TLSによる通信の暗号化</li>
                <li>パスワードのハッシュ化保存</li>
                <li>アクセス権限の適切な管理</li>
                <li>定期的なセキュリティ監査</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">6. 個人情報の開示</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本人から個人情報の開示を求められたときは、本人に対し、
                遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、
                その全部または一部を開示しないこともあり、開示しない決定をした場合には、
                その旨を遅滞なく通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">7. 個人情報の訂正および削除</h2>
              <p className="text-orange-700 leading-relaxed">
                お客様は、当社の保有する自己の個人情報が誤った情報である場合には、
                当社が定める手続きにより、当社に対して個人情報の訂正または削除を請求することができます。
                当社は、お客様から前項の請求を受けてその請求に応じる必要があると判断した場合には、
                遅滞なく、当該個人情報の訂正または削除を行い、これをお客様に通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">8. 個人情報の利用停止等</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、
                または不正の手段により取得されたものであるという理由により、
                その利用の停止または消去（以下「利用停止等」といいます）を求められた場合には、
                遅滞なく必要な調査を行い、その結果に基づき、個人情報の利用停止等を行い、
                その旨本人に通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">9. Cookieの利用</h2>
              <p className="text-orange-700 leading-relaxed">
                本サービスでは、サービスの品質向上のためにCookieを利用しています。
                Cookieはログイン状態の維持や利用状況の把握に使用され、
                個人を特定する情報は含まれません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">10. お子様の個人情報</h2>
              <p className="text-orange-700 leading-relaxed">
                本サービスは18歳以上の方を対象としています。
                18歳未満の方は、保護者の同意を得た上で本サービスをご利用ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">11. プライバシーポリシーの変更</h2>
              <p className="text-orange-700 leading-relaxed">
                本ポリシーの内容は、お客様に通知することなく、変更することができるものとします。
                当社が別途定める場合を除いて、変更後のプライバシーポリシーは、
                本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">12. お問い合わせ窓口</h2>
              <p className="text-orange-700 leading-relaxed">
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
              </p>
              <div className="mt-3 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-700">
                  事業者名: 中渡 潤<br />
                  メールアドレス: support@anpee.jp<br />
                  お問い合わせフォーム: <a href="https://anpee.jp/contact" className="text-orange-600 underline">こちら</a>
                </p>
              </div>
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