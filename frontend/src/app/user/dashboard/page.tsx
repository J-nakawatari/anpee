"use client";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/components/DashboardPage";
import { ElderlyManagementPage } from "@/components/ElderlyManagementPage";
import { HistoryPage } from "@/components/HistoryPage";
import { NotificationSettingsPage } from "@/components/NotificationSettingsPage";
import { BillingPage } from "@/components/BillingPage";
import { AccountSettingsPage } from "@/components/AccountSettingsPage";

export default function UserDashboardPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const getPageConfig = () => {
    switch (currentPage) {
      case "dashboard":
        return {
          title: "ダッシュボード",
          subtitle: "本日の見守り状況",
          showAddButton: true,
          addButtonText: "新規登録",
          content: <DashboardPage />
        };
      
      case "elderly-management":
        return {
          title: "高齢者の管理",
          subtitle: "登録対象者の編集・削除",
          showAddButton: false, // ページ内で管理
          content: <ElderlyManagementPage />
        };
      
      case "history":
        return {
          title: "通話＆ボタン応答履歴",
          subtitle: "過去の記録確認",
          showAddButton: false,
          content: <HistoryPage />
        };
      
      case "notifications":
        return {
          title: "通知設定",
          subtitle: "LINE/メール・再通知の設定",
          showAddButton: false,
          content: <NotificationSettingsPage />
        };
      
      case "billing":
        return {
          title: "プラン・支払い管理",
          subtitle: "契約情報の管理",
          showAddButton: false,
          content: <BillingPage />
        };
      
      case "account":
        return {
          title: "アカウント設定",
          subtitle: "ユーザー自身の管理",
          showAddButton: false,
          content: <AccountSettingsPage />
        };
      
      default:
        return {
          title: "ダッシュボード",
          subtitle: "本日の見守り状況",
          showAddButton: true,
          addButtonText: "新規登録",
          content: <DashboardPage />
        };
    }
  };

  const pageConfig = getPageConfig();

  const handleAddClick = () => {
    if (currentPage === "dashboard") {
      // ダッシュボードから新規登録をクリックした場合は高齢者管理ページに遷移
      setCurrentPage("elderly-management");
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      title={pageConfig.title}
      subtitle={pageConfig.subtitle}
      showAddButton={pageConfig.showAddButton}
      addButtonText={pageConfig.addButtonText}
      onAddClick={handleAddClick}
    >
      {pageConfig.content}
    </Layout>
  );
}