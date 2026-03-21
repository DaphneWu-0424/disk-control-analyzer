import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 20000,
})

export const simulateSystem = (payload) => api.post('/simulate', payload)
export const scanSystem = (payload) => api.post('/scan', payload)

export default api