import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="gentle-shadow border-orange-100">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-2xl text-orange-800">プライバシーポリシー</CardTitle>
            <p className="text-sm text-orange-600 mt-2">最終更新日: 2025年1月17日</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <section>
              <p className="text-orange-700 leading-relaxed mb-4">
                株式会社あんぴー（以下「当社」といいます）は、お客様の個人情報保護の重要性について認識し、
                個人情報の保護に関する法律（以下「個人情報保護法」といいます）を遵守すると共に、
                以下のプライバシーポリシーに従って、お客様の個人情報を適切に取扱い、保護いたします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">1. 個人情報の定義</h2>
              <p className="text-orange-700 leading-relaxed">
                個人情報とは、個人情報保護法にいう「個人情報」を指すものとし、
                生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、
                住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">2. 個人情報の収集方法</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、お客様が利用登録をする際に氏名、生年月日、住所、電話番号、
                メールアドレスなどの個人情報をお尋ねすることがあります。
                また、お客様と提携先などとの間でなされたお客様の個人情報を含む取引記録に関する情報を、
                当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下「提携先」といいます）
                などから収集することがあります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">3. 個人情報を収集・利用する目的</h2>
              <p className="text-orange-700 leading-relaxed mb-3">
                当社が個人情報を収集・利用する目的は、以下のとおりです：
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>サービスの提供・運営のため</li>
                <li>お客様からのお問い合わせに回答するため</li>
                <li>お客様に対してサービスに関する情報を提供するため</li>
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
                当社は、次に掲げる場合を除いて、あらかじめお客様の同意を得ることなく、
                第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-1 ml-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">5. 個人情報の開示</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本人から個人情報の開示を求められたときは、本人に対し、
                遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、
                その全部または一部を開示しないこともあり、開示しない決定をした場合には、
                その旨を遅滞なく通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">6. 個人情報の訂正および削除</h2>
              <p className="text-orange-700 leading-relaxed">
                お客様は、当社の保有する自己の個人情報が誤った情報である場合には、
                当社が定める手続きにより、当社に対して個人情報の訂正または削除を請求することができます。
                当社は、お客様から前項の請求を受けてその請求に応じる必要があると判断した場合には、
                遅滞なく、当該個人情報の訂正または削除を行い、これをお客様に通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">7. 個人情報の利用停止等</h2>
              <p className="text-orange-700 leading-relaxed">
                当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、
                または不正の手段により取得されたものであるという理由により、
                その利用の停止または消去（以下「利用停止等」といいます）を求められた場合には、
                遅滞なく必要な調査を行い、その結果に基づき、個人情報の利用停止等を行い、
                その旨本人に通知します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">8. プライバシーポリシーの変更</h2>
              <p className="text-orange-700 leading-relaxed">
                本ポリシーの内容は、お客様に通知することなく、変更することができるものとします。
                当社が別途定める場合を除いて、変更後のプライバシーポリシーは、
                本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-orange-800 mb-3">9. お問い合わせ窓口</h2>
              <p className="text-orange-700 leading-relaxed">
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
              </p>
              <div className="mt-3 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-700">
                  社名: 株式会社あんぴー<br />
                  住所: 〒100-0001 東京都千代田区千代田1-1<br />
                  メールアドレス: privacy@anpee.jp
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