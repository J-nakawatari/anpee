"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/services/apiClient";
import { safeDate } from "@/lib/dateUtils";

interface Notification {
  id: string;
  type: "response" | "no_response" | "system";
  title: string;
  message: string;
  elderlyName?: string;
  createdAt: Date;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // 通知を取得
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiClient.get("/app-notifications");
      if (response.data.success) {
        setNotifications(response.data.data.map((n: any) => ({
          ...n,
          createdAt: safeDate(n.createdAt) || new Date(),
        })));
      }
    } catch (error) {
      console.error("通知の取得に失敗しました:", error);
    }
  }, []);

  // 通知を既読にする
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.put(`/app-notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("通知の既読処理に失敗しました:", error);
    }
  }, []);

  // すべての通知を既読にする
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put("/app-notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("通知の一括既読処理に失敗しました:", error);
    }
  }, []);

  // Server-Sent Events (SSE) でリアルタイム通知を受信
  useEffect(() => {
    // 初回の通知を取得
    fetchNotifications();

    // 認証トークンを取得
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error('認証トークンが見つかりません');
      return;
    }

    // SSE接続を確立（トークンをクエリパラメータとして送信）
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/app-notifications/stream?token=${encodeURIComponent(token)}`,
      {
        withCredentials: true,
      }
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("通知ストリームに接続しました");
    };

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setNotifications((prev) => [
          {
            ...notification,
            createdAt: safeDate(notification.createdAt) || new Date(),
          },
          ...prev,
        ]);

        // ブラウザ通知を表示（許可されている場合）
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/anpeechan-icon.png",
          });
        }
      } catch (error) {
        console.error("通知の解析に失敗しました:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error("通知ストリームでエラーが発生しました");
    };

    // ブラウザ通知の許可をリクエスト
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}