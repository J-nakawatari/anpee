import { ClientLayout } from "@/components/ClientLayout";
import { BillingPageV2 } from "@/components/BillingPageV2";

export default function Billing() {
  return (
    <ClientLayout
      title="プラン・支払い管理"
      subtitle="契約情報の管理"
      showAddButton={false}
    >
      <BillingPageV2 />
    </ClientLayout>
  );
}