import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    try {
      delete api.defaults.headers.common['Authorization']
    } catch (e) {
      // ignore
    }
  }
}

export default api
