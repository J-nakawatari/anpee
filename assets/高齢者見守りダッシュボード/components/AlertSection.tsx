import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle, Bell, Shield } from "lucide-react";
import { Button } from "./ui/button";

interface AlertItem {
  type: 'warning' | 'info' | 'success';
  message: string;
  action?: string;
}

interface AlertSectionProps {
  alerts: AlertItem[];
}

export function AlertSection({ alerts }: AlertSectionProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert 
          key={index}
          className={`border-l-4 p-4 ${
            alert.type === 'warning' 
              ? 'border-l-red-500 bg-red-50 border-red-200' 
              : alert.type === 'success'
              ? 'border-l-green-500 bg-green-50 border-green-200'
              : 'border-l-blue-500 bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            {/* アイコン */}
            <div className="flex-shrink-0">
              {alert.type === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : alert.type === 'success' ? (
                <Shield className="h-5 w-5 text-green-600" />
              ) : (
                <Bell className="h-5 w-5 text-blue-600" />
              )}
            </div>
            
            {/* メッセージとアクション */}
            <div className="flex-1">
              <AlertDescription className={`text-sm mb-0 ${
                alert.type === 'warning' ? 'text-red-800' : 
                alert.type === 'success' ? 'text-green-800' : 'text-blue-800'
              }`}>
                {alert.message}
              </AlertDescription>
              
              {alert.action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    className={`text-sm ${
                      alert.type === 'warning' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : alert.type === 'success'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {alert.action}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}