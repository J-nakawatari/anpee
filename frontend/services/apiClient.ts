import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// CSRFトークンを取得して保存
let csrfToken: string | null = null

const getCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true })
    csrfToken = response.data.csrfToken
    return csrfToken
  } catch (error) {
    console.error('CSRF token fetch error:', error)
    return null
  }
}

// 初回のCSRFトークン取得
if (typeof window !== 'undefined') {
  getCsrfToken()
}

// リクエストインターセプター
apiClient.interceptors.request.use(
  async (config) => {
    // トークンがある場合は追加
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // CSRFトークンを追加（GET以外のリクエストの場合）
    if (config.method !== 'get') {
      if (!csrfToken) {
        await getCsrfToken()
      }
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 403エラーの場合、CSRFトークンを再取得
    if (error.response?.status === 403 && !originalRequest._retryCSRF) {
      originalRequest._retryCSRF = true
      
      // CSRFトークンを再取得
      await getCsrfToken()
      
      if (csrfToken) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken
        return apiClient(originalRequest)
      }
    }

    // 401エラーの場合、トークンをリフレッシュ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await apiClient.post('/auth/refresh')
        const { accessToken } = response.data.data
        
        // 新しいトークンを保存
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', accessToken)
        } else {
          sessionStorage.setItem('token', accessToken)
        }

        // リクエストを再実行
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // リフレッシュに失敗した場合はログインページへ
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // エラーの詳細をログ出力
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      })
    }

    return Promise.reject(error)
  }
)