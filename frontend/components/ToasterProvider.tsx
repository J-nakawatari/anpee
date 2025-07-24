"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function ToasterProvider() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // モバイルデバイスの検出
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // レスポンシブなスタイルを動的に追加
    const style = document.createElement('style');
    style.textContent = `
      /* デスクトップ用スタイル */
      @media (min-width: 640px) {
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
      }
      
      /* モバイル用スタイル */
      @media (max-width: 639px) {
        [data-sonner-toaster] {
          position: fixed !important;
          top: auto !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          right: auto !important;
          bottom: 20px !important;
          width: calc(100vw - 32px) !important;
          max-width: calc(100vw - 32px) !important;
          z-index: 100 !important;
        }
      }
      
      [data-sonner-toast] {
        margin: 8px 0 !important;
      }
      
      /* モバイルでのトースト内容の最適化 */
      @media (max-width: 639px) {
        [data-sonner-toast] {
          font-size: 14px !important;
          padding: 12px 16px !important;
        }
        
        [data-sonner-toast] [data-content] {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return <Toaster position={isMobile ? "bottom-center" : "top-center"} />;
}