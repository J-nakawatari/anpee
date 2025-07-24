"use client";

import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Users, History, Bell, CreditCard, User, LogOut, Plus, ExternalLink, Heart, Menu, X } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useIsMobile } from "./ui/use-mobile";

interface ClientLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
}

export function ClientLayout({ 
  children, 
  title, 
  subtitle, 
  showAddButton = false, 
  addButtonText = "新規登録",
  onAddClick 
}: ClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: "/user/dashboard",
      label: "ダッシュボード",
      icon: Home,
      description: "見守り状況の概要"
    },
    {
      id: "/user/family",
      label: "家族管理",
      icon: Users,
      description: "登録対象者の編集・削除"
    },
    {
      id: "/user/history",
      label: "通話＆ボタン応答履歴",
      icon: History,
      description: "過去の記録確認"
    },
    {
      id: "/user/notifications",
      label: "通知設定",
      icon: Bell,
      description: "LINE/メール・再通知の設定"
    },
    {
      id: "/user/billing",
      label: "プラン・支払い管理",
      icon: CreditCard,
      description: "契約情報の管理"
    },
    {
      id: "/user/account",
      label: "アカウント設定",
      icon: User,
      description: "ユーザー自身の管理"
    }
  ];

  const legalLinks = [
    {
      label: "利用規約",
      url: "/terms",
    },
    {
      label: "プライバシーポリシー",
      url: "/privacy",
    },
    {
      label: "特定商取引法の表示",
      url: "/commercial-law",
    }
  ];

  const handleLegalLinkClick = (url: string, label: string) => {
    // 新しいタブで開く
    window.open(url, '_blank');
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    // モバイルの場合はサイドバーを閉じる
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleAddClick = () => {
    if (pathname === "/user/dashboard") {
      // ダッシュボードから新規登録をクリックした場合は家族管理ページに遷移
      router.push("/user/family");
    } else if (onAddClick) {
      onAddClick();
    }
  };

  // サイドバーコンテンツ（PC・モバイル共通）
  const SidebarContent = () => (
    <>
      {/* ロゴ部分 */}
      <div className="p-6 border-b border-orange-200" style={{ height: '95px' }}>
        <div className="flex items-center gap-3 h-full">
          <div className="relative">
            <img 
              src="/logo.svg" 
              alt="あんぴーちゃんロゴ"
              width="48"
              height="48"
              className="block"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-orange-800">あんぴーちゃん</h1>
            <p className="text-xs text-orange-600">見守りサポート</p>
          </div>
          {/* モバイル用閉じるボタン */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-2 rounded-lg hover:bg-orange-50 transition-colors md:hidden"
            >
              <X className="w-5 h-5 text-orange-600" />
            </button>
          )}
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group cute-button ${
                  isActive
                    ? "bg-orange-100 text-orange-700 border border-orange-200 gentle-shadow" 
                    : "text-orange-600 hover:bg-orange-50 hover:text-orange-800"
                }`}
              >
                <Icon className={`w-5 h-5 watching-icon ${isActive ? 'text-orange-600' : 'text-orange-500 group-hover:text-orange-700'}`} />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isActive ? 'text-orange-700' : 'text-orange-800'}`}>
                    {item.label}
                  </div>
                  {!isActive && (
                    <div className="text-xs text-orange-500 group-hover:text-orange-600">
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 法的文書リンク */}
      <div className="px-4 pb-4">
        <div className="space-y-1">
          {legalLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLegalLinkClick(link.url, link.label)}
              className="w-full flex items-center justify-between px-2 py-1 text-orange-500 hover:text-orange-700 transition-colors group"
              style={{ fontSize: '14px' }}
            >
              <span>{link.label}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* ログアウトボタン */}
      <div className="p-4">
        <button 
          onClick={() => {
            // 認証トークンをクリア
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            // ログインページへリダイレクト
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-orange-600 hover:bg-orange-50 hover:text-orange-800 transition-all duration-200 cute-button"
        >
          <LogOut className="w-5 h-5" />
          ログアウト
        </button>
      </div>

      {/* 底部の情報 */}
      <div className="p-4 border-t border-orange-200">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 cute-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800 heart-accent">サービス稼働中</p>
              <p className="text-xs text-orange-600">24時間見守り中</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen warm-gradient flex">
      {/* モバイル用オーバーレイ */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <div className={`
        ${isMobile ? 'fixed' : 'fixed'} 
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        w-64 bg-white border-r border-orange-200 flex flex-col gentle-shadow h-screen overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'z-50' : 'z-30'}
        md:translate-x-0
      `}>
        <SidebarContent />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* トップヘッダー */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 px-4 md:px-6 py-4 gentle-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* モバイル用メニューボタン */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-orange-50 transition-colors md:hidden"
              >
                <Menu className="w-5 h-5 text-orange-600" />
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-semibold text-orange-800 heart-accent">{title}</h1>
                <p className="text-sm md:text-base text-orange-600 mt-1">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* 通知ベル */}
              <NotificationBell />

              {/* 新規追加ボタン */}
              {showAddButton && (
                <button 
                  onClick={handleAddClick}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 cute-button font-medium text-sm md:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{addButtonText}</span>
                  <span className="sm:hidden">追加</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {children}
          </div>
        </main>

        {/* フッター */}
        <footer className="bg-white border-t border-orange-100 px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs md:text-sm text-gray-500">
            <a 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600"
            >
              利用規約
            </a>
            <span className="hidden sm:inline">・</span>
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600"
            >
              プライバシーポリシー
            </a>
            <span className="hidden sm:inline">・</span>
            <a 
              href="/commercial-law" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-orange-600"
            >
              特定商取引法
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}