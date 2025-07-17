import { Card } from "./ui/card";
import { CheckCircle, Users, AlertTriangle, Clock } from "lucide-react";

interface SummaryCardsProps {
  totalElderly: number;
  respondedToday: number;
  noResponseToday: number;
  pendingToday: number;
}

export function SummaryCards({ 
  totalElderly, 
  respondedToday, 
  noResponseToday, 
  pendingToday 
}: SummaryCardsProps) {
  const summaryData = [
    {
      title: "登録者数",
      value: totalElderly,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-900"
    },
    {
      title: "本日応答あり",
      value: respondedToday,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bgColor: "bg-green-50",
      textColor: "text-green-900"
    },
    {
      title: "未応答",
      value: noResponseToday,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bgColor: "bg-red-50",
      textColor: "text-red-900"
    },
    {
      title: "未通知",
      value: pendingToday,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-900"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {summaryData.map((item, index) => (
        <Card key={index} className={`p-4 ${item.bgColor} border-0`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{item.title}</p>
              <p className={`text-2xl ${item.textColor}`}>{item.value}</p>
            </div>
            {item.icon}
          </div>
        </Card>
      ))}
    </div>
  );
}