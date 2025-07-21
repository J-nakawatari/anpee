import { ClientLayout } from "@/components/ClientLayout";
import { BillingPageV2 } from "@/components/BillingPageV2";
import { Suspense } from "react";

export default function Billing() {
  return (
    <ClientLayout
      title="プラン・支払い管理"
      subtitle="契約情報の管理"
      showAddButton={false}
    >
      <Suspense fallback={<div>読み込み中...</div>}>
        <BillingPageV2 />
      </Suspense>
    </ClientLayout>
  );
}