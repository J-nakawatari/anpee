"use client";

import { useState, useCallback } from "react";
import { CustomToast } from "@/components/ui/custom-toast";

interface ToastState {
  message: string;
  type: "success" | "error" | "info" | "warning";
  isOpen: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    isOpen: false,
  });

  const showToast = useCallback((message: string, type: ToastState["type"] = "info") => {
    setToast({ message, type, isOpen: true });
    
    // 3秒後に自動で閉じる
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isOpen: false }));
    }, 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ToastComponent = toast.isOpen ? (
    <CustomToast
      message={toast.message}
      type={toast.type}
      onClose={closeToast}
    />
  ) : null;

  return {
    showToast,
    ToastComponent,
  };
}