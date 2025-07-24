import { ClientLayout } from "@/components/ClientLayout";
import { DashboardPage } from "@/components/DashboardPage";

export default function Home() {
  return (
    <ClientLayout
      title="ダッシュボード"
      subtitle="本日の見守り状況"
      showAddButton={false}
    >
      <DashboardPage />
    </ClientLayout>
  );
}