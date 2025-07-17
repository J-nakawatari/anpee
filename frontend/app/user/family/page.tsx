import { ClientLayout } from "@/components/ClientLayout";
import { FamilyManagementPage } from "@/components/FamilyManagementPage";

export default function FamilyManagement() {
  return (
    <ClientLayout
      title="家族管理"
      subtitle="登録対象者の編集・削除"
      showAddButton={false}
    >
      <FamilyManagementPage />
    </ClientLayout>
  );
}