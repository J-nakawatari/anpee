import { ClientLayout } from "@/components/ClientLayout";
import { BillingPage } from "@/components/BillingPage";

export default function Billing() {
  return (
    <ClientLayout
      title="プラン・支払い管理"
      subtitle="契約情報の管理"
      showAddButton={false}
    >
      <BillingPage />
    </ClientLayout>
  );
}