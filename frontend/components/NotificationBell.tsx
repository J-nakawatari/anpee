"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { safeDate } from "@/lib/dateUtils";

export function NotificationBell() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "response":
        return "✅";
      case "no_response":
        return "⚠️";
      case "system":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-orange-600 hover:text-orange-800 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white shadow-lg border border-gray-200">
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-orange-600 hover:text-orange-800"
              >
                すべて既読にする
              </button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto bg-white">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              通知はありません
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                  !notification.read ? "bg-orange-50" : "bg-white"
                }`}
              >
                <div className="flex gap-3 w-full">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {safeDate(notification.createdAt) ? format(safeDate(notification.createdAt)!, "M月d日 HH:mm", {
                        locale: ja,
                      }) : '-'}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t border-gray-100 bg-white">
            <button className="w-full text-center text-sm text-orange-600 hover:text-orange-800 py-1">
              すべての通知を見る
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}