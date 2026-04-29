import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8001/api',
  timeout: 30000,
})

export const simulateSystem = async (payload) => {
    const res = await api.post('/simulate', payload)
    return res.data
}

export const detectParameters = async (payload) => {
    const res = await api.post('/detect-parameters', payload)
    return res.data
}
  

export default api