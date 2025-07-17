import { ClientLayout } from "@/components/ClientLayout";
import { AccountSettingsPage } from "@/components/AccountSettingsPage";

export default function Account() {
  return (
    <ClientLayout
      title="アカウント設定"
      subtitle="ユーザー自身の管理"
      showAddButton={false}
    >
      <AccountSettingsPage />
    </ClientLayout>
  );
}