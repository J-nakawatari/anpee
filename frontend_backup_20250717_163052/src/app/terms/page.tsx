import { LegalPageLayout } from '@/components/LegalPageLayout'

export default function TermsPage() {
  return (
    <LegalPageLayout title="利用規約">
      <div className="space-y-6">
        <section>
          <p className="text-gray-600 mb-4">
            この利用規約（以下、「本規約」といいます。）は、あんぴーちゃん（以下、「当社」といいます。）が提供する高齢者見守りサービス「あんぴーちゃん」（以下、「本サービス」といいます。）の利用条件を定めるものです。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第1条（適用）</h2>
          <p className="text-gray-600">
            本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第2条（利用登録）</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</li>
            <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当社が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第3条（ユーザーIDおよびパスワードの管理）</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li>
            <li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第4条（利用料金および支払方法）</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>ユーザーは、本サービスの利用に対し、当社が別途定める利用料金を、当社が指定する方法により支払うものとします。</li>
            <li>ユーザーが利用料金の支払を遅滞した場合、ユーザーは年14.6％の割合による遅延損害金を支払うものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第5条（禁止事項）</h2>
          <p className="text-gray-600 mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当社、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>当社のサービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>当社が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第6条（本サービスの提供の停止等）</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ul>
            </li>
            <li>当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第7条（著作権）</h2>
          <p className="text-gray-600">
            本サービスによって提供される情報等のコンテンツの著作権は、当社または当社にライセンスを許諾している者に帰属します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第8条（保証の否認および免責事項）</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
            <li>当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第9条（サービス内容の変更等）</h2>
          <p className="text-gray-600">
            当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第10条（利用規約の変更）</h2>
          <p className="text-gray-600">
            当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第11条（通知または連絡）</h2>
          <p className="text-gray-600">
            ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">第12条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-600">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>

        <section className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            制定日：2024年7月16日<br />
            最終改定日：2024年7月16日
          </p>
        </section>
      </div>
    </LegalPageLayout>
  )
}