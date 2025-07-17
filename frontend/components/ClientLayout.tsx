"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Users, History, Bell, CreditCard, User, LogOut, Plus, ExternalLink, Heart } from "lucide-react";
// import anpeechanImage from "figma:asset/8044dd3c50661d1e6746e0bc3e98566187669130.png";

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

  const menuItems = [
    {
      id: "/",
      label: "ダッシュボード",
      icon: Home,
      description: "見守り状況の概要"
    },
    {
      id: "/elderly-management",
      label: "高齢者の管理",
      icon: Users,
      description: "登録対象者の編集・削除"
    },
    {
      id: "/history",
      label: "通話＆ボタン応答履歴",
      icon: History,
      description: "過去の記録確認"
    },
    {
      id: "/notifications",
      label: "通知設定",
      icon: Bell,
      description: "LINE/メール・再通知の設定"
    },
    {
      id: "/billing",
      label: "プラン・支払い管理",
      icon: CreditCard,
      description: "契約情報の管理"
    },
    {
      id: "/account",
      label: "アカウント設定",
      icon: User,
      description: "ユーザー自身の管理"
    }
  ];

  const legalLinks = [
    {
      label: "利用規約",
      url: "#", // 実際のURLに置き換え
    },
    {
      label: "プライバシーポリシー",
      url: "#", // 実際のURLに置き換え
    },
    {
      label: "特定商取引法の表示",
      url: "#", // 実際のURLに置き換え
    }
  ];

  const handleLegalLinkClick = (url: string, label: string) => {
    // 実際の実装では、新しいウィンドウで開くか、モーダルで表示する
    // 現在はダミーの処理
    console.log(`Opening ${label}: ${url}`);
    // window.open(url, '_blank');
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  const handleAddClick = () => {
    if (pathname === "/") {
      // ダッシュボードから新規登録をクリックした場合は高齢者管理ページに遷移
      router.push("/elderly-management");
    } else if (onAddClick) {
      onAddClick();
    }
  };

  return (
    <div className="min-h-screen warm-gradient flex">
      {/* サイドバー */}
      <div className="w-64 bg-white border-r border-orange-200 flex flex-col gentle-shadow">
        {/* ロゴ部分 */}
        <div className="p-6 border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                🧡
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-orange-800">あんぴーちゃん</h1>
              <p className="text-xs text-orange-600">見守りサポート</p>
            </div>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group cute-button ${
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-orange-600 hover:bg-orange-50 hover:text-orange-800 transition-all duration-200 cute-button">
            <LogOut className="w-5 h-5" />
            ログアウト
          </button>
        </div>

        {/* 底部の情報 */}
        <div className="p-4 border-t border-orange-200">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 cute-card">
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
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* トップヘッダー */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 px-6 py-4 gentle-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-orange-800 heart-accent">{title}</h1>
              <p className="text-orange-600 mt-1">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* 通知ベル */}
              <button className="relative p-2 text-orange-600 hover:text-orange-800 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  1
                </span>
              </button>

              {/* 新規追加ボタン */}
              {showAddButton && (
                <button 
                  onClick={handleAddClick}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 cute-button font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {addButtonText}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}