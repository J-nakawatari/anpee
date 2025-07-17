import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { TrendingUp, Users, Phone } from "lucide-react";

interface MainStatsCardProps {
  totalCalls: number;
  responseRate: number;
  onViewDetails: () => void;
}

export function MainStatsCard({ totalCalls, responseRate, onViewDetails }: MainStatsCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* メイン統計カード */}
      <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-lg">
        <div className="flex items-center justify-between h-full">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-blue-100 mb-2">本日の通話実績</p>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-semibold">{totalCalls}</span>
                <span className="text-xl text-blue-100">件</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-sm text-blue-100">応答率</span>
                <span className="text-xl font-semibold">{responseRate}%</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-200" />
                <span className="text-sm text-blue-100">登録者</span>
                <span className="text-xl font-semibold">4名</span>
              </div>
            </div>

            <Button 
              onClick={onViewDetails}
              className="bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium mt-4"
            >
              詳細統計を見る
            </Button>
          </div>

          {/* イラストエリア */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="w-32 h-32 bg-blue-400/30 rounded-full flex items-center justify-center">
              <Phone className="w-16 h-16 text-blue-100" />
            </div>
          </div>
        </div>
      </Card>

      {/* 応答率カード */}
      <Card className="p-6 bg-gradient-to-br from-green-400 to-green-600 text-white border-0 shadow-lg">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-green-100 mb-2">本日の応答率</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-semibold">{responseRate}</span>
              <span className="text-lg text-green-100">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-green-100">
              昨日より <span className="text-lg font-semibold">+5%</span> 向上
            </p>
            <p className="text-xs text-green-200">
              継続して良好な状態を保っています
            </p>
          </div>

          <div className="w-full bg-green-400/30 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${responseRate}%` }}
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
}