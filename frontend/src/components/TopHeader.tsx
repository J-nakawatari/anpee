import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, Plus, Bell } from "lucide-react";

interface TopHeaderProps {
  userName: string;
  onLogout: () => void;
  onAddElderly: () => void;
  unreadCount?: number;
}

export function TopHeader({ userName, onLogout, onAddElderly, unreadCount = 0 }: TopHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-600 mt-1">本日の見守り状況</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* 通知ベル */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* 新規追加ボタン */}
          <Button 
            onClick={onAddElderly}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規登録
          </Button>

          {/* ユーザー情報 */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {userName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">管理者</p>
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