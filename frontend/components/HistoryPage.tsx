"use client";

import { useState, useMemo } from "react";
import { Search, Phone, Heart, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Edit3, Check, X, WifiOff, Battery, Clock3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { familyData, generateHistoryData, updateHistoryNotes, type FamilyPerson, type HistoryRecord } from "../data/familyData";

export function HistoryPage() {
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingNotes, setEditingNotes] = useState<{[key: number]: string}>({});
  const [isEditingNote, setIsEditingNote] = useState<{[key: number]: boolean}>({});
  const [isSaving, setIsSaving] = useState<{[key: number]: boolean}>({});
  const [sortField, setSortField] = useState<'date' | 'time' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 履歴データを生成（実際の実装では外部APIから取得）
  const [historyData, setHistoryData] = useState<HistoryRecord[]>(() => generateHistoryData());
  
  // 選択された家族の情報
  const selectedFamily = familyData.find(family => family.id === selectedFamilyId);
  
  // 選択された家族の履歴データをフィルタリング
  const filteredHistory = useMemo(() => {
    if (!selectedFamilyId) return [];
    
    let filtered = historyData.filter(record => record.familyId === selectedFamilyId);
    
    // 日付フィルタ
    if (dateFilter !== "all") {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setDate(today.getDate());
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          break;
        case "month":
          filterDate.setDate(today.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(record => new Date(record.date) >= filterDate);
    }
    
    // タイプフィルタ
    if (typeFilter !== "all") {
      filtered = filtered.filter(record => record.type === typeFilter);
    }
    
    // ソート処理
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (sortField === 'date') {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else if (sortField === 'time') {
          // 時刻を比較可能な形式に変換（HH:MM形式を分に変換）
          const [aHour, aMin] = a.time.split(':').map(Number);
          const [bHour, bMin] = b.time.split(':').map(Number);
          aValue = aHour * 60 + aMin;
          bValue = bHour * 60 + bMin;
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [selectedFamilyId, historyData, dateFilter, typeFilter, sortField, sortOrder]);

  // ステータスアイコンとスタイルを取得
  const getStatusInfo = (status: string, type: string) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: type === 'call' ? '応答' : '受信',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'no_answer':
        return {
          icon: <XCircle className="w-4 h-4 text-yellow-600" />,
          text: '不在',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'busy':
        return {
          icon: <AlertCircle className="w-4 h-4 text-orange-600" />,
          text: '話し中',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          text: '失敗',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'error':
        return {
          icon: <WifiOff className="w-4 h-4 text-red-600" />,
          text: 'エラー',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'low_battery':
        return {
          icon: <Battery className="w-4 h-4 text-orange-600" />,
          text: '電池低下',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        };
      case 'no_response':
        return {
          icon: <Clock3 className="w-4 h-4 text-yellow-600" />,
          text: '応答なし',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-gray-600" />,
          text: '不明',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  // 時間フォーマット
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  // 統計データの計算
  const stats = useMemo(() => {
    if (!selectedFamilyId) return null;
    
    const familyHistory = historyData.filter(record => record.familyId === selectedFamilyId);
    const callRecords = familyHistory.filter(record => record.type === 'call');
    const buttonRecords = familyHistory.filter(record => record.type === 'button');
    
    // 元気ボタンの状態別カウント
    const buttonSuccess = buttonRecords.filter(record => record.status === 'success').length;
    const buttonErrors = buttonRecords.filter(record => ['error', 'low_battery', 'no_response'].includes(record.status)).length;
    
    return {
      totalCalls: callRecords.length,
      totalButtonPresses: buttonRecords.length,
      buttonSuccess,
      buttonErrors
    };
  }, [selectedFamilyId, historyData]);

  // メモ編集開始
  const startEditingNote = (recordId: number, currentNotes: string) => {
    setIsEditingNote(prev => ({...prev, [recordId]: true}));
    setEditingNotes(prev => ({...prev, [recordId]: currentNotes || ''}));
  };

  // メモ編集キャンセル
  const cancelEditingNote = (recordId: number) => {
    setIsEditingNote(prev => ({...prev, [recordId]: false}));
    setEditingNotes(prev => {
      const newState = {...prev};
      delete newState[recordId];
      return newState;
    });
  };

  // メモ保存
  const saveNote = async (recordId: number) => {
    const newNotes = editingNotes[recordId] || '';
    
    setIsSaving(prev => ({...prev, [recordId]: true}));
    
    try {
      await updateHistoryNotes(recordId, newNotes);
      
      // 履歴データを更新
      setHistoryData(prev => prev.map(record => 
        record.id === recordId 
          ? {...record, notes: newNotes || undefined}
          : record
      ));
      
      // 編集状態をリセット
      setIsEditingNote(prev => ({...prev, [recordId]: false}));
      setEditingNotes(prev => {
        const newState = {...prev};
        delete newState[recordId];
        return newState;
      });
      
    } catch (error) {
      console.error('メモの保存に失敗しました:', error);
    } finally {
      setIsSaving(prev => ({...prev, [recordId]: false}));
    }
  };

  // フォーカスアウト時の自動保存
  const handleNoteBlur = (recordId: number) => {
    if (isEditingNote[recordId]) {
      saveNote(recordId);
    }
  };

  // ソートハンドラー
  const handleSort = (field: 'date' | 'time') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <>
      {/* 家族選択と統計セクション */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 家族選択 */}
          <div className="lg:col-span-1">
            <Label htmlFor="family-select" className="mb-2">
              履歴を確認する家族を選択
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedFamily ? selectedFamily.name : "家族を選択..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-white" align="start">
                <Command className="bg-white">
                  <CommandInput placeholder="名前で検索..." />
                  <CommandEmpty>該当する家族が見つかりません。</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {familyData.map((family) => (
                      <CommandItem
                        key={family.id}
                        value={family.name}
                        onSelect={() => {
                          setSelectedFamilyId(family.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{family.name}</span>
                          <span className="text-sm text-gray-500">
                            {family.age}歳 - {family.phone}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* 統計カード */}
          {selectedFamily && stats && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">総通話回数</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.totalCalls}回</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-pink-700">元気ボタン回数</p>
                    <p className="text-2xl font-bold text-pink-800">{stats.totalButtonPresses}回</p>
                    {stats.buttonErrors > 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        エラー: {stats.buttonErrors}回
                      </p>
                    )}
                  </div>
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 選択されていない場合の表示 */}
          {!selectedFamily && (
            <div className="lg:col-span-2 flex items-center justify-center bg-gray-50 rounded-lg p-8">
              <p className="text-gray-500">家族を選択すると統計が表示されます</p>
            </div>
          )}
        </div>
      </div>

      {/* 履歴テーブル */}
      {selectedFamily ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* フィルタ */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-filter">期間:</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="today">今日</SelectItem>
                  <SelectItem value="week">過去7日</SelectItem>
                  <SelectItem value="month">過去30日</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="type-filter">種類:</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="call">通話</SelectItem>
                  <SelectItem value="button">元気ボタン</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            {filteredHistory.length} 件の履歴
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[120px] cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      日付
                      {sortField === 'date' ? (
                        <img 
                          src={sortOrder === 'asc' ? '/sort-amount-asc.svg' : '/sort-amount-desc.svg'} 
                          alt={sortOrder === 'asc' ? '昇順' : '降順'}
                          className="w-4 h-4"
                        />
                      ) : (
                        <img 
                          src="/sort-amount-asc.svg" 
                          alt="ソート可能"
                          className="w-4 h-4 opacity-30"
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[100px] cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('time')}
                  >
                    <div className="flex items-center gap-1">
                      時刻
                      {sortField === 'time' ? (
                        <img 
                          src={sortOrder === 'asc' ? '/sort-amount-asc.svg' : '/sort-amount-desc.svg'} 
                          alt={sortOrder === 'asc' ? '昇順' : '降順'}
                          className="w-4 h-4"
                        />
                      ) : (
                        <img 
                          src="/sort-amount-asc.svg" 
                          alt="ソート可能"
                          className="w-4 h-4 opacity-30"
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[140px] pl-6">種類</TableHead>
                  <TableHead className="w-[160px] pl-6">ステータス</TableHead>
                  <TableHead className="w-[120px] pl-6">通話時間</TableHead>
                  <TableHead className="min-w-[250px] pl-6">メモ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((record) => {
                    const statusInfo = getStatusInfo(record.status, record.type);
                    const isEditing = isEditingNote[record.id];
                    const isSavingNote = isSaving[record.id];
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            {record.type === 'call' ? (
                              <Phone className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Heart className="w-4 h-4 text-pink-600" />
                            )}
                            <span>{record.type === 'call' ? '通話' : '元気ボタン'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            {statusInfo.icon}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="pl-6">
                          {record.duration ? formatDuration(record.duration) : '-'}
                        </TableCell>
                        <TableCell className="pl-6 min-w-[250px] max-w-[400px]">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Textarea
                                value={editingNotes[record.id] || ''}
                                onChange={(e) => setEditingNotes(prev => ({...prev, [record.id]: e.target.value}))}
                                onBlur={() => handleNoteBlur(record.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    cancelEditingNote(record.id);
                                  }
                                }}
                                placeholder="メモを入力..."
                                className="min-h-[60px] resize-none"
                                autoFocus
                                disabled={isSavingNote}
                              />
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveNote(record.id)}
                                  disabled={isSavingNote}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => cancelEditingNote(record.id)}
                                  disabled={isSavingNote}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="group flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                              onClick={() => startEditingNote(record.id, record.notes || '')}
                            >
                              <div className="flex-1 min-w-0">
                                {record.notes ? (
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {record.notes}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    クリックしてメモを追加...
                                  </p>
                                )}
                              </div>
                              <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      履歴データがありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">履歴を表示するには</h3>
            <p className="text-gray-600">上記のプルダウンから家族を選択してください。</p>
            <p className="text-sm text-gray-500 mt-2">通話履歴と元気ボタンの応答履歴を確認できます。</p>
          </div>
        </div>
      )}
    </>
  );
}