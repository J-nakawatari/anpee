"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Phone, Heart, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Edit3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { apiClient } from "@/services/apiClient";
import { toast } from "@/lib/toast";

interface Response {
  _id: string;
  elderlyId: {
    _id: string;
    name: string;
    phone?: string;
  };
  type: 'genki_button' | 'phone_call' | 'auto_call';
  status: 'pending' | 'success' | 'no_answer' | 'failed' | 'expired';
  respondedAt?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
}

interface Elderly {
  _id: string;
  name: string;
  phone?: string;
  lastResponseAt?: string;
}

const typeLabels = {
  genki_button: '元気ボタン',
  phone_call: '電話確認',
  auto_call: '自動架電'
};

const statusLabels = {
  pending: '確認待ち',
  success: '応答あり',
  no_answer: '応答なし',
  failed: '失敗',
  expired: '期限切れ'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  no_answer: 'bg-red-100 text-red-800',
  failed: 'bg-gray-100 text-gray-800',
  expired: 'bg-gray-100 text-gray-800'
};

const typeIcons = {
  genki_button: Heart,
  phone_call: Phone,
  auto_call: Phone
};

export function HistoryPage() {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [elderlyList, setElderlyList] = useState<Elderly[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingElderly, setIsLoadingElderly] = useState(true);
  const [open, setOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingNotes, setEditingNotes] = useState<{[key: string]: string}>({});
  const [isEditingNote, setIsEditingNote] = useState<{[key: string]: boolean}>({});
  const [isSaving, setIsSaving] = useState<{[key: string]: boolean}>({});
  const [sortField, setSortField] = useState<'date' | 'time' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 選択された家族の情報
  const selectedFamily = elderlyList.find(elderly => elderly._id === selectedFamilyId);
  
  // 家族リストを取得
  useEffect(() => {
    fetchElderlyList();
  }, []);

  // 選択された家族が変更されたら履歴を取得
  useEffect(() => {
    if (selectedFamilyId) {
      fetchResponses();
    }
  }, [selectedFamilyId, dateFilter, typeFilter, page]);

  // 家族リストを取得
  const fetchElderlyList = async () => {
    try {
      setIsLoadingElderly(true);
      const response = await apiClient.get('/elderly');
      if (response.data.elderlyList) {
        setElderlyList(response.data.elderlyList);
      }
    } catch (error) {
      console.error('家族リスト取得エラー:', error);
      toast.error('家族リストの取得に失敗しました');
    } finally {
      setIsLoadingElderly(false);
    }
  };

  // 履歴データを取得
  const fetchResponses = async () => {
    if (!selectedFamilyId) return;
    
    try {
      setIsLoading(true);
      
      const params: any = {
        elderlyId: selectedFamilyId,
        page,
        limit: 50
      };
      
      // フィルター条件を追加
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      
      if (dateFilter !== 'all') {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        
        let startDate = new Date();
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setDate(today.getDate() - 30);
            break;
        }
        
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      
      const response = await apiClient.get('/responses/history', { params });
      
      if (response.data) {
        setResponses(response.data.responses || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('履歴取得エラー:', error);
      toast.error('履歴の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 選択された家族の履歴データをフィルタリング
  const filteredHistory = useMemo(() => {
    if (!responses) return [];
    
    let filtered = [...responses];
    
    // ソート処理
    if (sortField) {
      filtered = filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        if (sortField === 'date') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else if (sortField === 'time') {
          // 時刻を比較可能な形式に変換
          const aDate = new Date(a.createdAt);
          const bDate = new Date(b.createdAt);
          aValue = aDate.getHours() * 60 + aDate.getMinutes();
          bValue = bDate.getHours() * 60 + bDate.getMinutes();
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [responses, sortField, sortOrder]);

  // ステータスアイコンとスタイルを取得
  const getStatusInfo = (status: Response['status']) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: '応答あり',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'no_answer':
        return {
          icon: <XCircle className="w-4 h-4 text-yellow-600" />,
          text: '応答なし',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          text: '確認待ち',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          text: '失敗',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'expired':
        return {
          icon: <AlertCircle className="w-4 h-4 text-gray-600" />,
          text: '期限切れ',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
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
    if (!selectedFamilyId || !responses) return null;
    
    const genkiRecords = responses.filter(r => r.type === 'genki_button');
    const phoneRecords = responses.filter(r => r.type === 'phone_call');
    const autoCallRecords = responses.filter(r => r.type === 'auto_call');
    
    // 元気ボタンの状態別カウント
    const genkiSuccess = genkiRecords.filter(r => r.status === 'success').length;
    const genkiPending = genkiRecords.filter(r => r.status === 'pending').length;
    const genkiExpired = genkiRecords.filter(r => r.status === 'expired').length;
    
    return {
      totalGenki: genkiRecords.length,
      genkiSuccess,
      genkiPending,
      genkiExpired,
      totalPhoneCalls: phoneRecords.length,
      totalAutoCalls: autoCallRecords.length
    };
  }, [selectedFamilyId, responses]);

  // メモ編集開始
  const startEditingNote = (recordId: string, currentNotes: string) => {
    setIsEditingNote(prev => ({...prev, [recordId]: true}));
    setEditingNotes(prev => ({...prev, [recordId]: currentNotes || ''}));
  };

  // メモ編集キャンセル
  const cancelEditingNote = (recordId: string) => {
    setIsEditingNote(prev => ({...prev, [recordId]: false}));
    setEditingNotes(prev => {
      const newState = {...prev};
      delete newState[recordId];
      return newState;
    });
  };

  // メモ保存
  const saveNote = async (recordId: string) => {
    const newNotes = editingNotes[recordId] || '';
    
    setIsSaving(prev => ({...prev, [recordId]: true}));
    
    try {
      await apiClient.patch(`/responses/${recordId}/notes`, { notes: newNotes });
      
      // 履歴データを更新
      setResponses(prev => prev.map(record => 
        record._id === recordId 
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
      
      toast.success('メモを保存しました');
    } catch (error) {
      console.error('メモの保存に失敗しました:', error);
      toast.error('メモの保存に失敗しました');
    } finally {
      setIsSaving(prev => ({...prev, [recordId]: false}));
    }
  };

  // フォーカスアウト時の自動保存
  const handleNoteBlur = (recordId: string) => {
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

  // 日付フィルターが変更されたらページをリセット
  useEffect(() => {
    setPage(1);
  }, [dateFilter, typeFilter]);

  return (
    <>
      {/* 家族選択と統計セクション */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">履歴を表示する家族を選択</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 家族選択 */}
          <div className="lg:col-span-1">
            <Label htmlFor="family-select" className="mb-2">
              履歴を確認する家族を選択
            </Label>
            <Select value={selectedFamilyId || ''} onValueChange={setSelectedFamilyId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="家族を選択..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {isLoadingElderly ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : elderlyList.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    家族が登録されていません
                  </div>
                ) : (
                  elderlyList.map((elderly) => (
                    <SelectItem key={elderly._id} value={elderly._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{elderly.name}</span>
                        {elderly.phone && (
                          <span className="text-sm text-gray-500 ml-2">
                            {elderly.phone}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* 統計カード */}
          {selectedFamily && stats && (
            <>
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-pink-700">元気ボタン</p>
                    <p className="text-2xl font-bold text-pink-800">{stats.totalGenki}回</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600">応答: {stats.genkiSuccess}</span>
                      {stats.genkiPending > 0 && (
                        <span className="text-xs text-blue-600">待機: {stats.genkiPending}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">電話確認</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {stats.totalPhoneCalls + stats.totalAutoCalls}回
                    </p>
                    <div className="text-xs text-gray-600 mt-1">
                      手動: {stats.totalPhoneCalls}, 自動: {stats.totalAutoCalls}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
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
      {selectedFamilyId ? (
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
                  <SelectItem value="genki_button">元気ボタン</SelectItem>
                  <SelectItem value="phone_call">電話確認</SelectItem>
                  <SelectItem value="auto_call">自動架電</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            {filteredHistory.length} 件の履歴
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">履歴を読み込んでいます...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th 
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        日付・時刻
                        {sortField === 'date' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">種類</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ステータス</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">応答時刻</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">メモ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((record) => {
                      const statusInfo = getStatusInfo(record.status);
                      const isEditing = isEditingNote[record._id];
                      const isSavingNote = isSaving[record._id];
                      const TypeIcon = typeIcons[record.type];
                      
                      return (
                        <tr key={record._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">
                                {format(new Date(record.createdAt), 'M月d日', { locale: ja })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(record.createdAt), 'HH:mm', { locale: ja })}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="w-4 h-4 text-gray-600" />
                              <span>{typeLabels[record.type]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {statusInfo.icon}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {record.respondedAt ? (
                              <span className="text-sm">
                                {format(new Date(record.respondedAt), 'HH:mm', { locale: ja })}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 min-w-[250px] max-w-[400px]">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Textarea
                                  value={editingNotes[record._id] || ''}
                                  onChange={(e) => setEditingNotes(prev => ({...prev, [record._id]: e.target.value}))}
                                  onBlur={() => handleNoteBlur(record._id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      cancelEditingNote(record._id);
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
                                    onClick={() => saveNote(record._id)}
                                    disabled={isSavingNote}
                                    className="h-6 w-6 p-0"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => cancelEditingNote(record._id)}
                                    disabled={isSavingNote}
                                    className="h-6 w-6 p-0"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="group flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                                onClick={() => startEditingNote(record._id, record.notes || '')}
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
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        履歴データがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                {page} / {totalPages} ページ
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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