// 高齢者データの型定義
export interface ElderlyPerson {
  id: number;
  name: string;
  age: number;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  hasGenKiButton: boolean;
  callTime: string;
  status: 'active' | 'inactive' | 'suspended';
  notes: string;
  registeredDate: string;
  lastContact: string;
}

// 履歴データの型定義
export interface HistoryRecord {
  id: number;
  elderlyId: number;
  type: 'call' | 'button';
  date: string;
  time: string;
  status: 'success' | 'no_answer' | 'busy' | 'failed' | 'error' | 'low_battery' | 'no_response';
  duration?: number; // 通話時間（秒）
  notes?: string;
}

// 25人の高齢者データ
export const elderlyData: ElderlyPerson[] = [
  {
    id: 1,
    name: "田中 一郎",
    age: 78,
    phone: "03-1234-5678",
    address: "東京都新宿区西新宿1-1-1",
    emergencyContact: "田中 次郎（息子）",
    emergencyPhone: "090-1234-5678",
    hasGenKiButton: true,
    callTime: "07:00",
    status: 'active',
    notes: "毎朝散歩をされています。",
    registeredDate: "2024-01-15",
    lastContact: "2024-07-14"
  },
  {
    id: 2,
    name: "佐藤 花子",
    age: 82,
    phone: "03-2345-6789",
    address: "東京都渋谷区恵比寿1-2-3",
    emergencyContact: "佐藤 美子（娘）",
    emergencyPhone: "090-2345-6789",
    hasGenKiButton: false,
    callTime: "07:00",
    status: 'active',
    notes: "聞き取りにくい場合があります。",
    registeredDate: "2024-02-20",
    lastContact: "2024-07-11"
  },
  {
    id: 3,
    name: "山田 太郎",
    age: 75,
    phone: "03-3456-7890",
    address: "東京都品川区五反田2-3-4",
    emergencyContact: "山田 花子（妻）",
    emergencyPhone: "090-3456-7890",
    hasGenKiButton: true,
    callTime: "08:00",
    status: 'inactive',
    notes: "一時的に入院中です。",
    registeredDate: "2024-03-10",
    lastContact: "2024-07-10"
  },
  {
    id: 4,
    name: "鈴木 美代子",
    age: 79,
    phone: "03-4567-8901",
    address: "東京都目黒区自由が丘3-4-5",
    emergencyContact: "鈴木 健一（息子）",
    emergencyPhone: "090-4567-8901",
    hasGenKiButton: true,
    callTime: "07:15",
    status: 'active',
    notes: "とても元気で話好きです。",
    registeredDate: "2024-04-05",
    lastContact: "2024-07-14"
  },
  {
    id: 5,
    name: "高橋 勝男",
    age: 81,
    phone: "03-5678-9012",
    address: "東京都中央区銀座1-1-1",
    emergencyContact: "高橋 明子（娘）",
    emergencyPhone: "090-5678-9012",
    hasGenKiButton: false,
    callTime: "07:30",
    status: 'active',
    notes: "料理が趣味です。",
    registeredDate: "2024-01-20",
    lastContact: "2024-07-13"
  },
  {
    id: 6,
    name: "伊藤 幸子",
    age: 77,
    phone: "03-6789-0123",
    address: "東京都豊島区池袋2-2-2",
    emergencyContact: "伊藤 隆（息子）",
    emergencyPhone: "090-6789-0123",
    hasGenKiButton: true,
    callTime: "08:15",
    status: 'active',
    notes: "毎日ラジオ体操をしています。",
    registeredDate: "2024-02-10",
    lastContact: "2024-07-14"
  },
  {
    id: 7,
    name: "渡辺 健三",
    age: 84,
    phone: "03-7890-1234",
    address: "東京都世田谷区三軒茶屋3-3-3",
    emergencyContact: "渡辺 恵子（妻）",
    emergencyPhone: "090-7890-1234",
    hasGenKiButton: false,
    callTime: "07:45",
    status: 'suspended',
    notes: "短期入所中です。",
    registeredDate: "2024-03-15",
    lastContact: "2024-07-08"
  },
  {
    id: 8,
    name: "中村 春美",
    age: 73,
    phone: "03-8901-2345",
    address: "東京都杉並区荻窪4-4-4",
    emergencyContact: "中村 大輔（息子）",
    emergencyPhone: "090-8901-2345",
    hasGenKiButton: true,
    callTime: "07:00",
    status: 'active',
    notes: "園芸が好きです。",
    registeredDate: "2024-01-25",
    lastContact: "2024-07-14"
  },
  {
    id: 9,
    name: "小林 正夫",
    age: 80,
    phone: "03-9012-3456",
    address: "東京都練馬区大泉学園5-5-5",
    emergencyContact: "小林 真理子（娘）",
    emergencyPhone: "090-9012-3456",
    hasGenKiButton: true,
    callTime: "08:00",
    status: 'active',
    notes: "将棋が趣味です。",
    registeredDate: "2024-02-28",
    lastContact: "2024-07-12"
  },
  {
    id: 10,
    name: "加藤 静江",
    age: 86,
    phone: "03-0123-4567",
    address: "東京都足立区北千住6-6-6",
    emergencyContact: "加藤 康夫（息子）",
    emergencyPhone: "090-0123-4567",
    hasGenKiButton: false,
    callTime: "07:30",
    status: 'active',
    notes: "読書が好きです。",
    registeredDate: "2024-03-05",
    lastContact: "2024-07-13"
  },
  {
    id: 11,
    name: "吉田 良一",
    age: 76,
    phone: "03-1357-2468",
    address: "東京都江戸川区葛西7-7-7",
    emergencyContact: "吉田 由美（娘）",
    emergencyPhone: "090-1357-2468",
    hasGenKiButton: true,
    callTime: "07:15",
    status: 'active',
    notes: "散歩が日課です。",
    registeredDate: "2024-01-30",
    lastContact: "2024-07-14"
  },
  {
    id: 12,
    name: "森田 キヨ",
    age: 88,
    phone: "03-2468-1357",
    address: "東京都墨田区押上8-8-8",
    emergencyContact: "森田 裕太（孫）",
    emergencyPhone: "090-2468-1357",
    hasGenKiButton: false,
    callTime: "08:30",
    status: 'inactive',
    notes: "デイサービス利用中です。",
    registeredDate: "2024-02-14",
    lastContact: "2024-07-09"
  },
  {
    id: 13,
    name: "石川 清",
    age: 74,
    phone: "03-3691-4702",
    address: "東京都台東区浅草9-9-9",
    emergencyContact: "石川 和子（妻）",
    emergencyPhone: "090-3691-4702",
    hasGenKiButton: true,
    callTime: "07:00",
    status: 'active',
    notes: "お寺参りが日課です。",
    registeredDate: "2024-03-20",
    lastContact: "2024-07-14"
  },
  {
    id: 14,
    name: "橋本 たつ子",
    age: 85,
    phone: "03-4815-2639",
    address: "東京都荒川区日暮里10-10-10",
    emergencyContact: "橋本 誠（息子）",
    emergencyPhone: "090-4815-2639",
    hasGenKiButton: true,
    callTime: "08:15",
    status: 'active',
    notes: "編み物が得意です。",
    registeredDate: "2024-01-10",
    lastContact: "2024-07-13"
  },
  {
    id: 15,
    name: "藤田 武夫",
    age: 79,
    phone: "03-5927-3840",
    address: "東京都板橋区大山11-11-11",
    emergencyContact: "藤田 麻衣（娘）",
    emergencyPhone: "090-5927-3840",
    hasGenKiButton: false,
    callTime: "07:45",
    status: 'active',
    notes: "野球観戦が趣味です。",
    registeredDate: "2024-02-05",
    lastContact: "2024-07-12"
  },
  {
    id: 16,
    name: "岡田 ヨシ子",
    age: 83,
    phone: "03-6048-1593",
    address: "東京都北区赤羽12-12-12",
    emergencyContact: "岡田 博（息子）",
    emergencyPhone: "090-6048-1593",
    hasGenKiButton: true,
    callTime: "07:30",
    status: 'active',
    notes: "カラオケが好きです。",
    registeredDate: "2024-03-25",
    lastContact: "2024-07-14"
  },
  {
    id: 17,
    name: "松本 勇",
    age: 77,
    phone: "03-7159-2604",
    address: "東京都葛飾区金町13-13-13",
    emergencyContact: "松本 恵美（娘）",
    emergencyPhone: "090-7159-2604",
    hasGenKiButton: false,
    callTime: "08:00",
    status: 'suspended',
    notes: "リハビリ中です。",
    registeredDate: "2024-01-18",
    lastContact: "2024-07-07"
  },
  {
    id: 18,
    name: "井上 ミサ子",
    age: 81,
    phone: "03-8260-3715",
    address: "東京都江東区豊洲14-14-14",
    emergencyContact: "井上 健太（息子）",
    emergencyPhone: "090-8260-3715",
    hasGenKiButton: true,
    callTime: "07:15",
    status: 'active',
    notes: "水泳を続けています。",
    registeredDate: "2024-02-22",
    lastContact: "2024-07-13"
  },
  {
    id: 19,
    name: "木村 栄三",
    age: 78,
    phone: "03-9371-4826",
    address: "東京都港区六本木15-15-15",
    emergencyContact: "木村 さくら（娘）",
    emergencyPhone: "090-9371-4826",
    hasGenKiButton: true,
    callTime: "08:30",
    status: 'active',
    notes: "美術館巡りが趣味です。",
    registeredDate: "2024-03-12",
    lastContact: "2024-07-14"
  },
  {
    id: 20,
    name: "斎藤 ハナ",
    age: 87,
    phone: "03-0482-5937",
    address: "東京都文京区本郷16-16-16",
    emergencyContact: "斎藤 雅弘（息子）",
    emergencyPhone: "090-0482-5937",
    hasGenKiButton: false,
    callTime: "07:00",
    status: 'active',
    notes: "俳句を詠んでいます。",
    registeredDate: "2024-01-28",
    lastContact: "2024-07-11"
  },
  {
    id: 21,
    name: "山口 信夫",
    age: 75,
    phone: "03-1593-6048",
    address: "東京都千代田区神田17-17-17",
    emergencyContact: "山口 亜希子（娘）",
    emergencyPhone: "090-1593-6048",
    hasGenKiButton: true,
    callTime: "07:45",
    status: 'active',
    notes: "毎日新聞を読んでいます。",
    registeredDate: "2024-02-18",
    lastContact: "2024-07-14"
  },
  {
    id: 22,
    name: "青木 トシ",
    age: 84,
    phone: "03-2604-7159",
    address: "東京都中野区中野18-18-18",
    emergencyContact: "青木 直樹（息子）",
    emergencyPhone: "090-2604-7159",
    hasGenKiButton: false,
    callTime: "08:15",
    status: 'inactive',
    notes: "体調管理中です。",
    registeredDate: "2024-03-08",
    lastContact: "2024-07-06"
  },
  {
    id: 23,
    name: "内田 豊",
    age: 80,
    phone: "03-3715-8260",
    address: "東京都大田区蒲田19-19-19",
    emergencyContact: "内田 理恵（娘）",
    emergencyPhone: "090-3715-8260",
    hasGenKiButton: true,
    callTime: "07:30",
    status: 'active',
    notes: "ゲートボールをしています。",
    registeredDate: "2024-01-22",
    lastContact: "2024-07-13"
  },
  {
    id: 24,
    name: "長谷川 アキ子",
    age: 76,
    phone: "03-4826-9371",
    address: "東京都品川区大崎20-20-20",
    emergencyContact: "長谷川 拓也（息子）",
    emergencyPhone: "090-4826-9371",
    hasGenKiButton: true,
    callTime: "08:00",
    status: 'active',
    notes: "お茶の稽古をしています。",
    registeredDate: "2024-02-25",
    lastContact: "2024-07-12"
  },
  {
    id: 25,
    name: "菊池 正雄",
    age: 82,
    phone: "03-5937-0482",
    address: "東京都武蔵野市吉祥寺21-21-21",
    emergencyContact: "菊池 千春（妻）",
    emergencyPhone: "090-5937-0482",
    hasGenKiButton: false,
    callTime: "07:15",
    status: 'active',
    notes: "音楽鑑賞が趣味です。",
    registeredDate: "2024-03-30",
    lastContact: "2024-07-14"
  }
];

// 履歴データのダミー
export const generateHistoryData = (): HistoryRecord[] => {
  const records: HistoryRecord[] = [];
  let id = 1;

  // 各高齢者に対して過去30日分の履歴を生成
  elderlyData.forEach((elderly) => {
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateString = date.toISOString().split('T')[0];

      // 通話記録（毎日1回）
      if (Math.random() > 0.1) { // 90%の確率で記録有り
        const callTime = elderly.callTime.split(':');
        const hour = parseInt(callTime[0]);
        const minute = parseInt(callTime[1]);
        
        records.push({
          id: id++,
          elderlyId: elderly.id,
          type: 'call',
          date: dateString,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          status: Math.random() > 0.15 ? 'success' : (Math.random() > 0.5 ? 'no_answer' : 'busy'),
          duration: Math.random() > 0.15 ? Math.floor(Math.random() * 300) + 60 : undefined,
          notes: Math.random() > 0.7 ? '体調良好です' : undefined
        });
      }

      // 元気ボタン記録（元気ボタン利用者のみ、ランダム）
      if (elderly.hasGenKiButton && Math.random() > 0.3) { // 70%の確率で記録有り
        const buttonHour = Math.floor(Math.random() * 12) + 8; // 8:00-19:59
        const buttonMinute = Math.floor(Math.random() * 60);
        
        // 元気ボタンの状態を確率的に決定
        let buttonStatus: 'success' | 'error' | 'low_battery' | 'no_response';
        const random = Math.random();
        if (random > 0.15) {
          buttonStatus = 'success'; // 85%の確率で成功
        } else if (random > 0.10) {
          buttonStatus = 'error'; // 5%の確率でエラー
        } else if (random > 0.05) {
          buttonStatus = 'low_battery'; // 5%の確率で電池低下
        } else {
          buttonStatus = 'no_response'; // 5%の確率で応答なし
        }
        
        // 状態に応じたメモを生成
        let buttonNotes: string | undefined;
        switch (buttonStatus) {
          case 'success':
            buttonNotes = Math.random() > 0.7 ? '元気です！' : undefined;
            break;
          case 'error':
            buttonNotes = 'ボタンエラーが発生しました';
            break;
          case 'low_battery':
            buttonNotes = 'ボタンの電池残量が少なくなっています';
            break;
          case 'no_response':
            buttonNotes = '24時間以上ボタンが押されていません';
            break;
        }
        
        records.push({
          id: id++,
          elderlyId: elderly.id,
          type: 'button',
          date: dateString,
          time: `${buttonHour.toString().padStart(2, '0')}:${buttonMinute.toString().padStart(2, '0')}`,
          status: buttonStatus,
          notes: buttonNotes
        });
      }
    }
  });

  return records.sort((a, b) => {
    if (a.elderlyId !== b.elderlyId) return a.elderlyId - b.elderlyId;
    if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    return b.time.localeCompare(a.time);
  });
};

// 履歴データのメモを更新する関数（実際の実装ではAPIコール）
export const updateHistoryNotes = (recordId: number, notes: string): Promise<void> => {
  return new Promise((resolve) => {
    // 実際の実装では、APIにPOSTリクエストを送信
    console.log(`Updating history record ${recordId} with notes: "${notes}"`);
    
    // 模擬的な遅延
    setTimeout(() => {
      resolve();
    }, 500);
  });
};