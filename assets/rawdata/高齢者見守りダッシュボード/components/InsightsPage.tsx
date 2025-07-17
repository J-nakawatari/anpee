import { TrendingUp, TrendingDown, Users, Phone, Heart, Calendar } from "lucide-react";

export function InsightsPage() {
  // サンプルデータ
  const weeklyStats = [
    { day: "月", calls: 4, responses: 4, rate: 100 },
    { day: "火", calls: 4, responses: 3, rate: 75 },
    { day: "水", calls: 4, responses: 4, rate: 100 },
    { day: "木", calls: 4, responses: 3, rate: 75 },
    { day: "金", calls: 4, responses: 4, rate: 100 },
    { day: "土", calls: 4, responses: 2, rate: 50 },
    { day: "日", calls: 4, responses: 3, rate: 75 },
  ];

  const monthlyTrends = [
    { month: "1月", avgResponseRate: 85, avgResponseTime: "2.3分", genKiButtonUsage: 78 },
    { month: "2月", avgResponseRate: 89, avgResponseTime: "2.1分", genKiButtonUsage: 82 },
    { month: "3月", avgResponseRate: 92, avgResponseTime: "1.9分", genKiButtonUsage: 85 },
    { month: "4月", avgResponseRate: 88, avgResponseTime: "2.2分", genKiButtonUsage: 80 },
    { month: "5月", avgResponseRate: 94, avgResponseTime: "1.8分", genKiButtonUsage: 88 },
    { month: "6月", avgResponseRate: 91, avgResponseTime: "2.0分", genKiButtonUsage: 86 },
  ];

  return (
    <>
      {/* 概要統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均応答率</p>
              <p className="text-2xl font-bold text-green-600">91.2%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">+3.2%</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均通話時間</p>
              <p className="text-2xl font-bold text-blue-600">2.1分</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600">-0.3分</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">元気ボタン使用率</p>
              <p className="text-2xl font-bold text-pink-600">84.5%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-pink-600">+2.8%</span>
              </div>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">登録者数</p>
              <p className="text-2xl font-bold text-gray-900">4人</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-600">変動なし</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 週次応答率チャート */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">週次応答率</h2>
              <p className="text-sm text-gray-600 mt-1">過去7日間の通話応答状況</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
              詳細レポート
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <div 
                    className="bg-blue-500 rounded-t mx-auto"
                    style={{ 
                      height: `${Math.max(stat.rate * 0.8, 10)}px`,
                      width: '24px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1">{stat.rate}%</div>
                </div>
                <div className="text-sm font-medium text-gray-900">{stat.day}</div>
                <div className="text-xs text-gray-600">{stat.responses}/{stat.calls}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 月次トレンド */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">月次トレンド</h2>
              <p className="text-sm text-gray-600 mt-1">過去6ヶ月の推移</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">2024年1月〜6月</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">月</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">応答率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">平均通話時間</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-900">元気ボタン使用率</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((trend, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{trend.month}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-sm font-medium ${
                        trend.avgResponseRate >= 90 ? 'text-green-600' : 
                        trend.avgResponseRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {trend.avgResponseRate}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-900">{trend.avgResponseTime}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-sm font-medium ${
                        trend.genKiButtonUsage >= 85 ? 'text-green-600' : 
                        trend.genKiButtonUsage >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {trend.genKiButtonUsage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* インサイト */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">インサイト</h2>
          <p className="text-sm text-gray-600 mt-1">データに基づく気づき</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">応答率が向上しています</p>
              <p className="text-sm text-green-700 mt-1">過去3ヶ月で応答率が平均91.7%に向上。特に平日の応答が安定しています。</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">元気ボタンの利用が増加</p>
              <p className="text-sm text-blue-700 mt-1">元気ボタンの使用率が84.5%に達し、利用者の健康意識の向上が見られます。</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">週末の応答率に注意</p>
              <p className="text-sm text-yellow-700 mt-1">土日の応答率がやや低い傾向があります。週末の見守り体制の見直しをおすすめします。</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}