import { Home, BarChart3, Users, Settings, Shield, Heart } from "lucide-react";
import { Button } from "./ui/button";

interface SideNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function SideNavigation({ currentPage, onPageChange }: SideNavigationProps) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'insights',
      label: '分析',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'contacts',
      label: '連絡先',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: '設定',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* ロゴ部分 */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sidebar-primary rounded-lg">
            <Shield className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg text-sidebar-foreground">見守りサポート</h1>
          </div>
        </div>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              onClick={() => onPageChange(item.id)}
              className={`w-full justify-start h-12 px-4 ${
                currentPage === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* 底部の情報 */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm text-sidebar-accent-foreground">24時間見守り</p>
              <p className="text-xs text-sidebar-accent-foreground/70">安心サービス稼働中</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}