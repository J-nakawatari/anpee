import { ClientLayout } from "@/components/ClientLayout";
import { ElderlyManagementPage } from "@/components/ElderlyManagementPage";

export default function ElderlyManagement() {
  return (
    <ClientLayout
      title="高齢者の管理"
      subtitle="登録対象者の編集・削除"
      showAddButton={false}
    >
      <ElderlyManagementPage />
    </ClientLayout>
  );
}