import { useState } from "react";
import { Heart, Users, AlertTriangle, CheckCircle, Clock, Phone, MessageSquare, TrendingUp, Shield, Activity, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import anpeechanImage from "figma:asset/8044dd3c50661d1e6746e0bc3e98566187669130.png";

export function DashboardPage() {
  const [currentTime] = useState(new Date());

  // 見守り対象者データ（1-2人想定）
  const elderlyPeople = [
    {
      id: 1,
      name: "おばあちゃん",
      realName: "田中花子",
      age: 78,
      status: "安全",
      lastLineResponse: "07:30",
      lastPhoneResponse: "昨日 19:00",
      todayLineResponse: true,
      todayPhoneResponse: false,
      avatar: "👵",
      statusColor: "bg-green-100 text-green-700"
    },
    {
      id: 2,
      name: "おじいちゃん",
      realName: "田中太郎",
      age: 82,
      status: "安全",
      lastLineResponse: "08:15",
      lastPhoneResponse: "今日 17:30",
      todayLineResponse: true,
      todayPhoneResponse: true,
      avatar: "👴",
      statusColor: "bg-green-100 text-green-700"
    }
  ];

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
      title: "今日の電話応答",
      value: `${elderlyPeople.filter(p => p.todayPhoneResponse).length}/${elderlyPeople.length}`,
      icon: Phone,
      color: "bg-blue-100 text-blue-700",
      change: elderlyPeople.every(p => p.todayPhoneResponse) ? "全員応答済み" : "一部未応答",
      changeColor: elderlyPeople.every(p => p.todayPhoneResponse) ? "text-green-600" : "text-orange-600"
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
    { day: "月", line: 2, phone: 1 },
    { day: "火", line: 2, phone: 2 },
    { day: "水", line: 2, phone: 1 },
    { day: "木", line: 2, phone: 2 },
    { day: "金", line: 2, phone: 1 },
    { day: "土", line: 2, phone: 2 },
    { day: "日", line: 2, phone: 1 }
  ];

  // 最新の応答記録
  const recentResponses = [
    {
      id: 1,
      person: "おばあちゃん",
      type: "LINE",
      action: "元気ですボタン",
      status: "応答",
      time: "07:30",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      id: 2,
      person: "おじいちゃん",
      type: "電話",
      action: "安否確認電話",
      status: "応答",
      time: "17:30",
      icon: Phone,
      color: "text-green-600"
    },
    {
      id: 3,
      person: "おじいちゃん",
      type: "LINE",
      action: "元気ですボタン",
      status: "応答",
      time: "08:15",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      id: 4,
      person: "おばあちゃん",
      type: "電話",
      action: "安否確認電話",
      status: "未応答",
      time: "12:00",
      icon: Phone,
      color: "text-orange-600"
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 gentle-shadow">
        <div className="flex items-center gap-4">
          <img 
            src={anpeechanImage} 
            alt="あんぴーちゃん" 
            className="w-16 h-16 rounded-full"
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
                  <div className="text-3xl">{person.avatar}</div>
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

                {/* 電話応答状況 */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">電話</span>
                  </div>
                  <div className="text-right">
                    {person.todayPhoneResponse ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
                        <span className="text-sm text-green-700">応答済み</span>
                        <p className="text-xs text-green-600">{person.lastPhoneResponse}</p>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-gray-600 inline mr-1" />
                        <span className="text-sm text-gray-700">今日はまだ</span>
                        <p className="text-xs text-gray-600">最後: {person.lastPhoneResponse}</p>
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
            LINEと電話の応答数推移
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
                formatter={(value, name) => [value, name === 'line' ? 'LINE応答' : '電話応答']}
              />
              <Bar dataKey="line" fill="#22c55e" radius={[2, 2, 0, 0]} name="LINE応答" />
              <Bar dataKey="phone" fill="#3b82f6" radius={[2, 2, 0, 0]} name="電話応答" />
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
            LINEと電話の安否確認履歴
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
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium">安否確認電話</span>
              </div>
              <span className="text-blue-600 text-sm">明日 18:00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}