import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api/v1'

// Axiosインスタンスの作成
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// CSRFトークンを初期化
let csrfToken: string | null = null

// CSRFトークンを取得
export const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/csrf-token')
    csrfToken = response.data.csrfToken
    return csrfToken
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    return null
  }
}

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // アクセストークンの取得
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // CSRFトークンの取得
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    } else {
      // Cookieからも取得を試みる
      const cookieToken = Cookies.get('_csrf')
      if (cookieToken) {
        config.headers['X-CSRF-Token'] = cookieToken
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // 401エラーでリトライしていない場合（リフレッシュエンドポイント自体は除外）
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        // トークンリフレッシュ
        const response = await api.post('/auth/refresh')
        const { accessToken } = response.data.data
        
        // 新しいトークンを保存
        localStorage.setItem('accessToken', accessToken)
        
        // リトライ
        return api(originalRequest)
      } catch (refreshError) {
        // リフレッシュ失敗時はログイン画面へ
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API関数のエクスポート
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (data: {
    email: string
    password: string
    name: string
    phone: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    localStorage.removeItem('accessToken')
    return response.data
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password })
    return response.data
  },
}