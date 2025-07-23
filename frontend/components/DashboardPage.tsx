"use client";

import { useState, useEffect } from "react";
import { Heart, Users, AlertTriangle, CheckCircle, Clock, Phone, MessageSquare, TrendingUp, Shield, Activity, Calendar, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { elderlyService, ElderlyData } from "@/services/elderlyService";
import { apiClient } from "@/services/apiClient";
import { toast } from "@/lib/toast";
import { InitialPlanSelection } from "./InitialPlanSelection";
import { useDebugMode } from "@/hooks/useDebugMode";
import Link from "next/link";

export function DashboardPage() {
  const [currentTime] = useState(new Date());
  const [elderlyList, setElderlyList] = useState<ElderlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextNotificationTime, setNextNotificationTime] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; line: number; phone: number }>>([]);
  const [recentResponsesData, setRecentResponsesData] = useState<Array<any>>([]);
  const [safeDays, setSafeDays] = useState<number>(0);
  const { isExpired } = useDebugMode();

  useEffect(() => {
    fetchElderlyData();
    fetchNotificationSettings();
    fetchWeeklyResponses();
    fetchRecentResponses();
    fetchSafeDays();
  }, []);

  const fetchElderlyData = async () => {
    try {
      setIsLoading(true);
      const data = await elderlyService.getList();
      setElderlyList(data);
    } catch (error) {
      console.error("家族データの取得に失敗しました:", error);
      toast.error("家族データの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await apiClient.get('/notifications/settings');
      const settings = response.data.settings;
      if (settings?.timing?.morning?.enabled) {
        setNextNotificationTime(settings.timing.morning.time);
      } else if (settings?.timing?.evening?.enabled) {
        setNextNotificationTime(settings.timing.evening.time);
      }
    } catch (error) {
      console.error("通知設定の取得に失敗しました:", error);
    }
  };

  const fetchWeeklyResponses = async () => {
    try {
      const response = await apiClient.get('/elderly/weekly-responses');
      setWeeklyData(response.data.weeklyData);
    } catch (error) {
      console.error("週間応答状況の取得に失敗しました:", error);
      // エラー時はデフォルトデータを設定
      setWeeklyData([
        { day: "月", line: 0, phone: 0 },
        { day: "火", line: 0, phone: 0 },
        { day: "水", line: 0, phone: 0 },
        { day: "木", line: 0, phone: 0 },
        { day: "金", line: 0, phone: 0 },
        { day: "土", line: 0, phone: 0 },
        { day: "日", line: 0, phone: 0 }
      ]);
    }
  };

  const fetchRecentResponses = async () => {
    try {
      const response = await apiClient.get('/elderly/recent-responses?limit=5');
      setRecentResponsesData(response.data.recentResponses);
    } catch (error) {
      console.error("最新の応答記録の取得に失敗しました:", error);
    }
  };

  const fetchSafeDays = async () => {
    try {
      const response = await apiClient.get('/elderly/safe-days');
      setSafeDays(response.data.safeDays);
    } catch (error) {
      console.error("連続安全日数の取得に失敗しました:", error);
      setSafeDays(0);
    }
  };

  // 次回の通知が今日か明日かを判定
  const getNextNotificationDay = () => {
    if (!nextNotificationTime) return "";
    
    const now = new Date();
    const [hours, minutes] = nextNotificationTime.split(':').map(Number);
    const todayNotificationTime = new Date();
    todayNotificationTime.setHours(hours, minutes, 0, 0);
    
    // 現在時刻が今日の通知時刻より前なら「今日」、後なら「明日」
    return now < todayNotificationTime ? "今日" : "明日";
  };

  // 性別に基づいて敬称を取得
  const getHonorific = (gender: 'male' | 'female' | 'other') => {
    switch (gender) {
      case 'male':
        return 'おじいちゃん';
      case 'female':
        return 'おばあちゃん';
      default:
        return '';
    }
  };

  // 性別に基づいてアバターを取得
  const getAvatar = (gender: 'male' | 'female' | 'other') => {
    switch (gender) {
      case 'male':
        return '👴';
      case 'female':
        return '👵';
      default:
        return '👤';
    }
  };

  // 見守り対象者データを実際のデータから生成
  const elderlyPeople = elderlyList.map((elderly, index) => {
    // 本日のLINE応答があるかチェック
    const today = new Date();
    const hasResponseToday = elderly.lastResponseAt && 
      new Date(elderly.lastResponseAt).toDateString() === today.toDateString();
    
    return {
      id: elderly._id || `${index}`,
      name: getHonorific(elderly.gender),
      realName: elderly.name,
      age: elderly.age,
      gender: elderly.gender,
      status: "安全",
      lastLineResponse: hasResponseToday && elderly.lastResponseAt ? 
        new Date(elderly.lastResponseAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : 
        "未応答",
      todayLineResponse: hasResponseToday,
      avatar: getAvatar(elderly.gender),
      statusColor: "bg-green-100 text-green-700"
    };
  });

  // 統計データ（1-2人向け）
  const stats = [
    {
      title: "見守り中",
      value: `${elderlyPeople.length}名`,
      icon: Heart,
      color: "bg-pink-100 text-pink-700",
      change: "家族",
      changeColor: "text-orange-600"
    },
    {
      title: "今日のLINE応答",
      value: `${elderlyPeople.filter(p => p.todayLineResponse).length}/${elderlyPeople.length}`,
      icon: MessageSquare,
      color: "bg-green-100 text-green-700",
      change: elderlyPeople.every(p => p.todayLineResponse) ? "全員応答済み" : "一部未応答",
      changeColor: elderlyPeople.every(p => p.todayLineResponse) ? "text-green-600" : "text-orange-600"
    },
    {
      title: "連続安全日数",
      value: `${safeDays}日`,
      icon: Shield,
      color: "bg-purple-100 text-purple-700",
      change: safeDays > 0 ? "継続中" : "記録なし",
      changeColor: safeDays > 0 ? "text-purple-600" : "text-gray-600"
    },
    {
      title: "次回確認予定",
      value: nextNotificationTime || "未設定",
      icon: Calendar,
      color: "bg-blue-100 text-blue-700",
      change: getNextNotificationDay(),
      changeColor: "text-blue-600"
    }
  ];

  // 今週の応答データ（実データはuseStateから取得）
  const weeklyResponseData = weeklyData.length > 0 ? weeklyData : [
    { day: "月", line: 0, phone: 0 },
    { day: "火", line: 0, phone: 0 },
    { day: "水", line: 0, phone: 0 },
    { day: "木", line: 0, phone: 0 },
    { day: "金", line: 0, phone: 0 },
    { day: "土", line: 0, phone: 0 },
    { day: "日", line: 0, phone: 0 }
  ];

  // 最新の応答記録（APIから取得したデータを使用）
  const recentResponses = recentResponsesData.map(response => ({
    id: response.id,
    person: response.elderlyName,
    type: response.method === 'LINE' ? 'LINE' : '電話',
    action: response.method === 'LINE' ? '元気ですボタン' : '電話応答',
    status: '応答',
    time: new Date(response.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    icon: response.method === 'LINE' ? MessageSquare : Phone,
    color: 'text-green-600'
  }));

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 初回プラン選択モーダル（内部でサブスクリプション状態を確認） */}
      <InitialPlanSelection />
      
      <div className="space-y-6">
      {/* 期限切れ警告 */}
      {isExpired && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                サービスの利用期限が終了しました
              </h2>
              <p className="text-red-800 mb-4">
                現在、見守りサービスは停止されています。大切なご家族の安否確認を再開するには、プランを選択してください。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-red-900">見守り機能</p>
                  <p className="text-xs text-red-700">停止中</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <MessageSquare className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-red-900">LINE通知</p>
                  <p className="text-xs text-red-700">送信停止</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <Phone className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-red-900">電話確認</p>
                  <p className="text-xs text-red-700">利用不可</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/user/billing">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700">
                    プランを選択して再開
                  </Button>
                </Link>
                <Link href="/user/history">
                  <Button size="lg" variant="outline">
                    過去の履歴を確認
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ウェルカムメッセージ */}
      <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 gentle-shadow ${isExpired ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-4">
          <img 
            src="/logo.svg" 
            alt="あんぴーちゃんロゴ"
            width="64"
            height="64"
            className="block"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-orange-800 heart-accent">おはようございます！</h2>
            <p className="text-orange-600 mt-1">
              {formatDate(currentTime)} {formatTime(currentTime)}
            </p>
            <p className="text-orange-700 mt-2">
              大切なご家族の安否確認を続けています。LINEと電話で毎日の元気をチェックしています。
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-600">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">見守りサービス稼働中</span>
            </div>
          </div>
        </div>
      </div>

      {/* 見守り対象者カード */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
        {elderlyPeople.map((person) => (
          <Card key={person.id} className="cute-card hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={person.avatar === "👴" ? "/grandpas_face_2.png" : "/grandmas_face_v2.png"}
                    alt={person.name}
                    width="48"
                    height="48"
                    className="block rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-orange-800">{person.name}</h3>
                    <p className="text-sm text-orange-600">{person.realName} ({person.age}歳)</p>
                  </div>
                </div>
                <Badge className={person.statusColor}>
                  {person.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {/* LINE応答状況 */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">LINE</span>
                  </div>
                  <div className="text-right">
                    {person.todayLineResponse ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
                        <span className="text-sm text-green-700">応答済み</span>
                        <p className="text-xs text-green-600">{person.lastLineResponse}</p>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-orange-600 inline mr-1" />
                        <span className="text-sm text-orange-700">未応答</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="cute-card hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-orange-800 mt-1">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.changeColor}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 今週の応答状況 */}
      <Card className="cute-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calendar className="w-5 h-5 watching-icon" />
            今週の応答状況
          </CardTitle>
          <CardDescription className="text-orange-600">
            応答があった日は「済」マークが付きます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weeklyResponseData.map((data, index) => {
              const hasResponse = data.line > 0 || data.phone > 0;
              const today = new Date();
              const dayOfWeek = today.getDay();
              // 日曜日を0から6に変換（月曜始まりの場合）
              const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              const isToday = index === todayIndex;
              
              return (
                <div key={data.day} className="text-center">
                  <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isToday ? 'text-blue-700 font-bold' : 'text-orange-700'
                  }`}>
                    {data.day}
                  </div>
                  <div className={`
                    relative w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-lg border-2
                    ${hasResponse 
                      ? 'bg-green-50 border-green-300' 
                      : isToday 
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200'
                    }
                    flex items-center justify-center transition-all duration-200
                    ${hasResponse ? 'shadow-sm' : ''}
                    ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                  `}>
                    {hasResponse ? (
                      <div className="text-green-600">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="absolute -bottom-5 sm:-bottom-6 left-0 right-0 text-xs font-bold text-green-600">
                          済
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="mt-6 sm:mt-8 text-xs text-gray-600">
                    {hasResponse ? `${data.line}回` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 最新の応答記録 */}
      <Card className="cute-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Clock className="w-5 h-5 watching-icon" />
            最新の応答記録
          </CardTitle>
          <CardDescription className="text-orange-600">
            LINEの安否確認履歴
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentResponses.map((response) => {
              const Icon = response.icon;
              return (
                <div key={response.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${response.color}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-orange-800">{response.person}</span>
                        <Badge variant="outline" className="text-xs">
                          {response.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-600">{response.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={response.status === "応答" ? "default" : "secondary"}
                      className={response.status === "応答" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
                    >
                      {response.status}
                    </Badge>
                    <p className="text-sm text-orange-500 mt-1">{response.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
    </>
  );
}