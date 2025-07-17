import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // トークンがある場合は追加
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

    return Promise.reject(error)
  }
)