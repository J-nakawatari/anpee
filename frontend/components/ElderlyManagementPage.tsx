"use client";

import { useState } from "react";
import { Search, Edit, Trash2, Phone, MapPin, Heart, Clock, User, Plus, X, List } from "lucide-react";
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
import { elderlyData as initialElderlyData, type ElderlyPerson } from "../data/elderlyData";

const ITEMS_PER_PAGE = 20;


export function ElderlyManagementPage() {
  const [elderlyData, setElderlyData] = useState<ElderlyPerson[]>(initialElderlyData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPerson, setEditingPerson] = useState<ElderlyPerson | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 新規登録用の空のフォームデータ
  const emptyFormData: Omit<ElderlyPerson, 'id'> = {
    name: "",
    age: 0,
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    hasGenKiButton: false,
    callTime: "07:00",
    status: 'active',
    notes: "",
    registeredDate: new Date().toISOString().split('T')[0],
    lastContact: ""
  };

  const [formData, setFormData] = useState<Omit<ElderlyPerson, 'id'>>(emptyFormData);

  // フィルタリング
  const filteredData = elderlyData.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.phone.includes(searchTerm) ||
                         person.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // ページネーション計算
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // 検索時にページをリセット
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 新規登録
  const handleAdd = () => {
    const newId = Math.max(...elderlyData.map(p => p.id)) + 1;
    const newPerson: ElderlyPerson = {
      ...formData,
      id: newId,
      hasGenKiButton: false,
      callTime: "07:00",
      status: 'active',
      lastContact: formData.lastContact || new Date().toISOString().split('T')[0]
    };
    setElderlyData([...elderlyData, newPerson]);
    setFormData(emptyFormData);
    setIsAddDialogOpen(false);
  };

  // 編集
  const handleEdit = (person: ElderlyPerson) => {
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
      registeredDate: person.registeredDate,
      lastContact: person.lastContact
    });
    setIsEditDialogOpen(true);
  };

  // 更新
  const handleUpdate = () => {
    if (editingPerson) {
      const updated = elderlyData.map(person => 
        person.id === editingPerson.id 
          ? { ...person, ...formData }
          : person
      );
      setElderlyData(updated);
      setIsEditDialogOpen(false);
      setEditingPerson(null);
      setFormData(emptyFormData);
    }
  };

  // 削除
  const handleDelete = (id: number) => {
    if (confirm('本当に削除しますか？')) {
      setElderlyData(elderlyData.filter(person => person.id !== id));
      // 削除後、現在のページにデータがない場合は前のページに移動
      const newFilteredData = elderlyData.filter(person => person.id !== id).filter(person => {
        const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             person.phone.includes(searchTerm) ||
                             person.address.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
      const newTotalPages = Math.ceil(newFilteredData.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  // 連絡一覧を見る
  const handleViewHistory = (person: ElderlyPerson) => {
    alert(`${person.name}さんの連絡一覧を表示します。\n（実装予定の機能です）`);
  };

  // フォームの入力ハンドラー
  const handleInputChange = (field: keyof Omit<ElderlyPerson, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // フォームコンポーネント
  const PersonForm = ({ isEdit = false }: { isEdit?: boolean }) => (
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
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
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

  return (
    <>
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総登録者数</p>
              <p className="text-2xl font-bold text-gray-900">{elderlyData.length}人</p>
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
                {elderlyData.filter(p => p.status === 'active').length}人
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
                {elderlyData.filter(p => p.status !== 'active').length}人
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
              />
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新規登録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規登録</DialogTitle>
              </DialogHeader>
              <PersonForm />
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
            {filteredData.length} / {elderlyData.length} 件表示 
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
                <TableHead className="w-[120px]">お名前</TableHead>
                <TableHead className="w-[80px]">年齢</TableHead>
                <TableHead className="w-[120px]">電話番号</TableHead>
                <TableHead className="w-[250px]">住所</TableHead>
                <TableHead className="w-[100px]">最終連絡</TableHead>
                <TableHead className="w-[180px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((person) => {
                return (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.age}歳</TableCell>
                    <TableCell>{person.phone}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={person.address}>
                      {person.address}
                    </TableCell>
                    <TableCell>{person.lastContact}</TableCell>
                    <TableCell className="text-right">
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
                          onClick={() => handleDelete(person.id)}
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
          <PersonForm isEdit={true} />
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