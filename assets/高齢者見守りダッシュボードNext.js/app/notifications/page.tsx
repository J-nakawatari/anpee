import { ClientLayout } from "@/components/ClientLayout";
import { NotificationSettingsPage } from "@/components/NotificationSettingsPage";

export default function Notifications() {
  return (
    <ClientLayout
      title="通知設定"
      subtitle="LINE/メール・再通知の設定"
      showAddButton={false}
    >
      <NotificationSettingsPage />
    </ClientLayout>
  );
}