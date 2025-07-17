import { ClientLayout } from "@/components/ClientLayout";
import { DashboardPage } from "@/components/DashboardPage";

export default function Home() {
  return (
    <ClientLayout
      title="ダッシュボード"
      subtitle="本日の見守り状況"
      showAddButton={true}
      addButtonText="新規登録"
    >
      <DashboardPage />
    </ClientLayout>
  );
}