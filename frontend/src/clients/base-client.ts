import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const baseURL = `${(import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '')}/`
export const sessionExpiredEvent = 'session-expired'
export function apiUrl(path: string) {
  return new URL(path.replace(/^\/+/, ''), baseURL).toString()
}
export const baseClient = axios.create({ baseURL, withCredentials: true, timeout: 20000 })
baseClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event(sessionExpiredEvent))
    }
    const message = axios.isAxiosError(error)
      ? (error.response?.data?.message ??
        (error.response?.status === 401 ? 'Your session expired.' : error.message))
      : 'Request failed'
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : String(message)))
  },
)
export async function request<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
  const response = await baseClient.request<T>({ ...config, url: apiUrl(path) })
  return response.data
}
