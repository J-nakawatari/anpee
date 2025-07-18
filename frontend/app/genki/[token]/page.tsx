"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Heart, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/services/apiClient";

type Status = 'loading' | 'ready' | 'success' | 'error' | 'expired';

export default function GenkiPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<Status>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // ページ読み込み時の初期チェック
    if (!token) {
      setStatus('error');
      setErrorMessage('無効なリンクです。');
    } else {
      setStatus('ready');
    }
  }, [token]);

  const handleGenkiButton = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(`/responses/genki/${token}`, {});
      
      if (response.data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(response.data.message || 'エラーが発生しました。');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setStatus('error');
        setErrorMessage('無効なリンクです。');
      } else if (error.response?.status === 410) {
        setStatus('expired');
      } else {
        setStatus('error');
        setErrorMessage('エラーが発生しました。しばらく経ってからお試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
            <Heart className="w-12 h-12 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">あんぴーちゃん</h1>
          <p className="text-gray-600 mt-1">毎日の安否確認</p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          )}

          {status === 'ready' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  おはようございます！
                </h2>
                <p className="mt-2 text-gray-600">
                  今日も元気にお過ごしですか？
                </p>
              </div>

              <button
                onClick={handleGenkiButton}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-2xl font-bold py-8 px-8 rounded-2xl hover:from-pink-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    送信中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Heart className="w-8 h-8 mr-3" />
                    元気です！
                  </span>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center">
                ボタンを押すと、ご家族に元気なことが伝わります
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800">
                送信完了！
              </h2>
              <p className="text-gray-600">
                ご家族に元気なことが伝わりました。
              </p>
              <p className="text-sm text-gray-500 mt-4">
                今日も素敵な一日をお過ごしください！
              </p>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                リンクの有効期限切れ
              </h2>
              <p className="text-gray-600">
                このリンクの有効期限が切れています。
              </p>
              <p className="text-sm text-gray-500">
                明日の朝、新しいリンクをお送りします。
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                エラー
              </h2>
              <p className="text-gray-600">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-500">
                お困りの場合は、ご家族にご連絡ください。
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 あんぴーちゃん
          </p>
        </div>
      </div>
    </div>
  );
}