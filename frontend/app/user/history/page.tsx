import { ClientLayout } from "@/components/ClientLayout";
import { HistoryPage } from "@/components/HistoryPage";
import { Suspense } from "react";

export default function History() {
  return (
    <ClientLayout
      title="通話＆ボタン応答履歴"
      subtitle="過去の記録確認"
      showAddButton={false}
    >
      <Suspense fallback={<div>読み込み中...</div>}>
        <HistoryPage />
      </Suspense>
    </ClientLayout>
  );
}