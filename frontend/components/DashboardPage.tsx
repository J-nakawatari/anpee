"use client";

import { useState, useEffect } from "react";
import { Heart, Users, AlertTriangle, CheckCircle, Clock, Phone, MessageSquare, TrendingUp, Shield, Activity, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { elderlyService, ElderlyData } from "@/services/elderlyService";
import { toast } from "@/lib/toast";

export function DashboardPage() {
  const [currentTime] = useState(new Date());
  const [elderlyList, setElderlyList] = useState<ElderlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchElderlyData();
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
      value: "7日",
      icon: Shield,
      color: "bg-purple-100 text-purple-700",
      change: "継続中",
      changeColor: "text-purple-600"
    }
  ];

  // 今週の応答データ
  const weeklyData = [
    { day: "月", line: elderlyPeople.length },
    { day: "火", line: elderlyPeople.length },
    { day: "水", line: elderlyPeople.length },
    { day: "木", line: elderlyPeople.length },
    { day: "金", line: elderlyPeople.length },
    { day: "土", line: elderlyPeople.length },
    { day: "日", line: elderlyPeople.length }
  ];

  // 最新の応答記録（実際のデータから生成）
  const recentResponses = elderlyPeople.flatMap(person => {
    const responses = [];
    
    // LINE応答があれば追加
    if (person.lastLineResponse !== "未応答") {
      responses.push({
        id: `${person.id}-line`,
        person: person.name || person.realName,
        type: "LINE",
        action: "元気ですボタン",
        status: "応答",
        time: person.lastLineResponse,
        icon: MessageSquare,
        color: "text-green-600"
      });
    }
    
    
    return responses;
  }).sort((a, b) => {
    // 時刻でソート（新しい順）
    const timeA = a.time.includes(':') ? a.time : '00:00';
    const timeB = b.time.includes(':') ? b.time : '00:00';
    return timeB.localeCompare(timeA);
  }).slice(0, 4); // 最新4件のみ表示

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
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 gentle-shadow">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* 今週の応答状況グラフ */}
      <Card className="cute-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TrendingUp className="w-5 h-5 watching-icon" />
            今週の応答状況
          </CardTitle>
          <CardDescription className="text-orange-600">
            LINEの応答数推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
              <XAxis dataKey="day" stroke="#c2410c" />
              <YAxis stroke="#c2410c" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px'
                }}
                formatter={(value) => [value, 'LINE応答']}
              />
              <Bar dataKey="line" fill="#22c55e" radius={[2, 2, 0, 0]} name="LINE応答" />
            </BarChart>
          </ResponsiveContainer>
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

      {/* 次回確認予定 */}
      <Card className="cute-card border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar className="w-5 h-5" />
            次回の確認予定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span className="text-blue-700 font-medium">LINE元気ですボタン</span>
              </div>
              <span className="text-blue-600 text-sm">明日 07:00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}