"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash2, Phone, MapPin, Heart, Clock, User, Plus, X, List, ChevronUp, ChevronDown } from "lucide-react";
import { elderlyService, ElderlyData } from "../services/elderlyService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const ITEMS_PER_PAGE = 20;


// フォームコンポーネントを外部に定義
interface PersonFormProps {
  formData: Omit<ElderlyData, '_id' | 'createdAt' | 'updatedAt'>;
  handleInputChange: (field: keyof Omit<ElderlyData, '_id' | 'createdAt' | 'updatedAt'>, value: any) => void;
  isEdit?: boolean;
}

const PersonForm = ({ formData, handleInputChange, isEdit = false }: PersonFormProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name" className="mb-2">お名前 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="山田 太郎"
        />
      </div>
      <div>
        <Label htmlFor="age" className="mb-2">年齢</Label>
        <Input
          id="age"
          type="number"
          value={formData.age || ''}
          onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : 0)}
          placeholder="75"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="phone" className="mb-2">電話番号 *</Label>
      <Input
        id="phone"
        value={formData.phone}
        onChange={(e) => handleInputChange('phone', e.target.value)}
        placeholder="03-1234-5678"
      />
    </div>

    <div>
      <Label htmlFor="address" className="mb-2">住所</Label>
      <Input
        id="address"
        value={formData.address}
        onChange={(e) => handleInputChange('address', e.target.value)}
        placeholder="東京都新宿区..."
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="emergencyContact" className="mb-2">緊急連絡先（人）</Label>
        <Input
          id="emergencyContact"
          value={formData.emergencyContact}
          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
          placeholder="田中 次郎（息子）"
        />
      </div>
      <div>
        <Label htmlFor="emergencyPhone" className="mb-2">緊急連絡先（電話）</Label>
        <Input
          id="emergencyPhone"
          value={formData.emergencyPhone}
          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
          placeholder="090-1234-5678"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="notes" className="mb-2">メモ</Label>
      <Textarea
        id="notes"
        value={formData.notes}
        onChange={(e) => handleInputChange('notes', e.target.value)}
        placeholder="特記事項があれば記入してください..."
        rows={3}
      />
    </div>
  </div>
);

export function FamilyManagementPage() {
  const [familyData, setFamilyData] = useState<ElderlyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPerson, setEditingPerson] = useState<ElderlyData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'age' | 'lastResponseAt' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新規登録用の空のフォームデータ
  const emptyFormData: Omit<ElderlyData, '_id' | 'createdAt' | 'updatedAt'> = {
    name: "",
    age: 0,  // 0は有効な値として扱われる
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    hasGenKiButton: false,
    callTime: "07:00",
    status: 'active',
    notes: "",
  };

  const [formData, setFormData] = useState<Omit<ElderlyData, '_id' | 'createdAt' | 'updatedAt'>>(emptyFormData);

  // データの取得
  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setIsLoading(true);
      const data = await elderlyService.getList();
      setFamilyData(data);
      setError(null);
    } catch (err) {
      console.error('家族データ取得エラー:', err);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // フィルタリング
  const filteredData = familyData.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.phone.includes(searchTerm) ||
                         person.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // ソート処理
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    // 最終連絡日の場合、空の値を最後にする
    if (sortField === 'lastResponseAt') {
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // ページネーション計算
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = sortedData.slice(startIndex, endIndex);

  // 検索時にページをリセット
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 新規登録
  const handleAdd = async () => {
    // フロントエンド側のバリデーション
    if (!formData.name || !formData.phone || !formData.address || 
        !formData.emergencyContact || !formData.emergencyPhone) {
      alert('必須項目（*印の項目）をすべて入力してください。');
      return;
    }
    
    try {
      console.log('送信データ:', formData); // デバッグ用
      const newPerson = await elderlyService.create(formData);
      setFamilyData([...familyData, newPerson]);
      setFormData(emptyFormData);
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error('登録エラー:', err);
      // エラーの詳細を表示
      const errorMessage = err.response?.data?.message || '登録に失敗しました';
      const missingFields = err.response?.data?.missingFields;
      if (missingFields) {
        alert(`登録に失敗しました。\n不足している項目: ${missingFields.join(', ')}`);
      } else {
        alert(errorMessage);
      }
    }
  };

  // 編集
  const handleEdit = (person: ElderlyData) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      age: person.age,
      phone: person.phone,
      address: person.address,
      emergencyContact: person.emergencyContact,
      emergencyPhone: person.emergencyPhone,
      hasGenKiButton: person.hasGenKiButton,
      callTime: person.callTime,
      status: person.status,
      notes: person.notes,
    });
    setIsEditDialogOpen(true);
  };

  // 更新
  const handleUpdate = async () => {
    if (editingPerson && editingPerson._id) {
      try {
        const updatedPerson = await elderlyService.update(editingPerson._id, formData);
        const updated = familyData.map(person => 
          person._id === editingPerson._id 
            ? updatedPerson
            : person
        );
        setFamilyData(updated);
        setIsEditDialogOpen(false);
        setEditingPerson(null);
        setFormData(emptyFormData);
      } catch (err) {
        console.error('更新エラー:', err);
        alert('更新に失敗しました');
      }
    }
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (confirm('本当に削除しますか？')) {
      try {
        await elderlyService.delete(id);
        setFamilyData(familyData.filter(person => person._id !== id));
        // 削除後、現在のページにデータがない場合は前のページに移動
        const newFilteredData = familyData.filter(person => person._id !== id).filter(person => {
          const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               person.phone.includes(searchTerm) ||
                               person.address.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesSearch;
        });
        const newTotalPages = Math.ceil(newFilteredData.length / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      } catch (err) {
        console.error('削除エラー:', err);
        alert('削除に失敗しました');
      }
    }
  };

  // 連絡一覧を見る
  const handleViewHistory = (person: ElderlyData) => {
    alert(`${person.name}さんの連絡一覧を表示します。\n（実装予定の機能です）`);
  };

  // 電話番号フォーマット関数
  const formatPhoneNumber = (value: string): string => {
    // 数字以外を除去
    const numbers = value.replace(/[^\d]/g, '');
    
    // 入力が空の場合
    if (!numbers) return '';
    
    // 携帯電話番号のパターン（070, 080, 090）
    const mobilePattern = /^0[789]0/;
    
    // 市外局番が3桁のパターン（東京03、大阪06など）
    const threeCityCodePattern = /^0[346]/;
    
    // 市外局番が4桁のパターン（一部の地域）
    const fourCityCodePattern = /^0[1-9][0-9]{2}/;
    
    if (mobilePattern.test(numbers)) {
      // 携帯電話番号（11桁）: 090-1234-5678
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    } else if (threeCityCodePattern.test(numbers)) {
      // 市外局番2桁（10桁）: 03-1234-5678
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    } else if (fourCityCodePattern.test(numbers)) {
      // 市外局番4桁（10桁）: 0422-12-3456
      if (numbers.length <= 4) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 10)}`;
    } else {
      // その他の場合（市外局番3桁として扱う）: 045-123-4567
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  // フォームの入力ハンドラー
  const handleInputChange = (field: keyof Omit<ElderlyData, '_id' | 'createdAt' | 'updatedAt'>, value: any) => {
    // 電話番号フィールドの場合は自動フォーマット
    if (field === 'phone' || field === 'emergencyPhone') {
      value = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ソートハンドラー
  const handleSort = (field: 'age' | 'lastResponseAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総登録者数</p>
              <p className="text-2xl font-bold text-gray-900">{familyData.length}人</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-green-600">
                {familyData.filter(p => p.status === 'active').length}人
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">非アクティブ</p>
              <p className="text-2xl font-bold text-gray-600">
                {familyData.filter(p => p.status !== 'active').length}人
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルタセクション */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="名前、電話番号、住所で検索..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: '#FFEDD5', height: '48px', fontSize: '16px' }}
              />
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" style={{ height: '48px', fontSize: '16px' }}>
                <Plus className="w-4 h-4 mr-2" />
                新規登録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規登録</DialogTitle>
              </DialogHeader>
              <PersonForm formData={formData} handleInputChange={handleInputChange} />
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormData(emptyFormData);
                }}>
                  キャンセル
                </Button>
                <Button onClick={handleAdd}>
                  登録
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {filteredData.length} / {familyData.length} 件表示 
            {totalPages > 1 && (
              <span className="ml-2">
                （{currentPage} / {totalPages} ページ）
              </span>
            )}
          </div>
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] text-base">お名前</TableHead>
                <TableHead 
                  className="w-[80px] text-base cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center gap-1">
                    年齢
                    {sortField === 'age' ? (
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
                <TableHead className="w-[120px] text-base">電話番号</TableHead>
                <TableHead className="w-[250px] text-base">住所</TableHead>
                <TableHead 
                  className="w-[100px] text-base cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('lastResponseAt')}
                >
                  <div className="flex items-center gap-1">
                    最終連絡
                    {sortField === 'lastResponseAt' ? (
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
                <TableHead className="w-[180px] text-right text-base">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((person) => {
                return (
                  <TableRow key={person._id}>
                    <TableCell className="font-medium text-base">{person.name}</TableCell>
                    <TableCell className="text-base">{person.age}歳</TableCell>
                    <TableCell className="text-base">{person.phone}</TableCell>
                    <TableCell className="max-w-[250px] truncate text-base" title={person.address}>
                      {person.address}
                    </TableCell>
                    <TableCell className="text-base">
                      {person.lastResponseAt ? new Date(person.lastResponseAt).toLocaleDateString('ja-JP') : '-'}
                    </TableCell>
                    <TableCell className="text-right text-base">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(person)}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(person)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(person._id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {/* ページ番号 */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  
                  // 現在のページの前後2ページを表示
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // 省略記号
                  if (
                    pageNumber === currentPage - 3 ||
                    pageNumber === currentPage + 3
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>登録情報の編集</DialogTitle>
          </DialogHeader>
          <PersonForm formData={formData} handleInputChange={handleInputChange} isEdit={true} />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditingPerson(null);
              setFormData(emptyFormData);
            }}>
              キャンセル
            </Button>
            <Button onClick={handleUpdate}>
              更新
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}