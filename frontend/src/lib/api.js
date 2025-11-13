import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: false,
  headers: {}
})

apiClient.interceptors.request.use((config) => {
  try {
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      const { token } = JSON.parse(storedAuth)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (error) {
    console.error('Failed to attach auth token:', error)
  }
  return config
})

export default apiClient
