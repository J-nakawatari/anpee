"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

export function ToasterProvider() {
  useEffect(() => {
    // トースターを画面中央に配置するスタイルを動的に追加
    const style = document.createElement('style');
    style.textContent = `
      [data-sonner-toaster] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        right: auto !important;
        bottom: auto !important;
        width: auto !important;
        max-width: 420px !important;
        z-index: 100 !important;
      }
      
      [data-sonner-toast] {
        margin: 8px 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return <Toaster position="top-center" />;
}