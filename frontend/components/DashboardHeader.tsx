import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, Plus, BarChart3, Shield } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
  onAddElderly: () => void;
  onViewHistory: () => void;
}

export function DashboardHeader({ userName, onLogout, onAddElderly, onViewHistory }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* サービス名 */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl text-blue-900">見守りサポート</h1>
            <p className="text-sm text-gray-600">家族安心ダッシュボード</p>
          </div>
        </div>

        {/* 右側のアクション */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onViewHistory}
            className="hidden md:flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            履歴を見る
          </Button>
          
          <Button 
            onClick={onAddElderly}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規追加
          </Button>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gray-100">
                {userName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm">{userName}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}