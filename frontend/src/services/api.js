import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 20000,
})

export const simulateSystem = async (payload) => {
    const res = await api.post('/simulate', payload)
    return res.data
}

export const scanSystem = async (payload) => {
    const res = await api.post('/scan', payload)
    return res.data
  }
  

export default api