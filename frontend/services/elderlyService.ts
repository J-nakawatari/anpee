import { apiClient } from './apiClient'

export interface ElderlyData {
  _id?: string
  name: string
  age: number
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  hasGenKiButton: boolean
  callTime: string
  status: 'active' | 'inactive' | 'suspended'
  notes: string
  lastResponseAt?: string
  createdAt?: string
  updatedAt?: string
}

export const elderlyService = {
  // 家族一覧の取得
  async getList(): Promise<ElderlyData[]> {
    const response = await apiClient.get('/elderly')
    return response.data.data
  },

  // 家族の詳細取得
  async getById(id: string): Promise<ElderlyData> {
    const response = await apiClient.get(`/elderly/${id}`)
    return response.data.data
  },

  // 家族の新規登録
  async create(data: Omit<ElderlyData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ElderlyData> {
    const response = await apiClient.post('/elderly', data)
    return response.data.data
  },

  // 家族情報の更新
  async update(id: string, data: Partial<ElderlyData>): Promise<ElderlyData> {
    const response = await apiClient.put(`/elderly/${id}`, data)
    return response.data.data
  },

  // 家族の削除
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/elderly/${id}`)
  },
}