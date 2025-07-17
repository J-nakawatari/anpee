import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, Clock, Phone, Heart, User } from "lucide-react";

interface ElderlyStatusCardProps {
  name: string;
  status: 'responded' | 'no_response' | 'pending';
  lastResponseTime?: string;
  lastResponseDate?: string;
  genKiButtonTime?: string;
  callDuration?: string;
  avatar?: string;
}

export function ElderlyStatusCard({ 
  name, 
  status, 
  lastResponseTime, 
  lastResponseDate, 
  genKiButtonTime, 
  callDuration,
  avatar
}: ElderlyStatusCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'responded':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: `本日 ${lastResponseTime} 応答あり`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          statusBadge: 'bg-green-100 text-green-800'
        };
      case 'no_response':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: `本日 ${lastResponseTime} 未応答`,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          statusBadge: 'bg-red-100 text-red-800'
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-amber-600" />,
          text: '昨日応答あり、本日は未通知',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          statusBadge: 'bg-amber-100 text-amber-800'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`p-5 ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 hover:shadow-lg transition-all duration-200`}>
      <div className="space-y-4">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.statusBadge}`}>
                {status === 'responded' ? '応答済み' : status === 'no_response' ? '未応答' : '待機中'}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            詳細
          </Button>
        </div>

        {/* ステータス表示 */}
        <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
          {statusInfo.icon}
          <span className="text-sm text-gray-700">{statusInfo.text}</span>
        </div>

        {/* 詳細情報 */}
        <div className="space-y-3">
          {genKiButtonTime && (
            <div className="flex items-center space-x-3 p-3 bg-green-100/50 rounded-lg">
              <Heart className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                {genKiButtonTime}に元気ボタンが押されました
              </span>
            </div>
          )}

          {callDuration && (
            <div className="flex items-center space-x-3 p-3 bg-blue-100/50 rounded-lg">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">通話時間: {callDuration}</span>
            </div>
          )}

          {lastResponseDate && (
            <div className="text-sm text-gray-600 px-3">
              最終応答: {lastResponseDate}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}