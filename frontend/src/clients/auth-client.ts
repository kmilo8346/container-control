import { baseClient, apiUrl, request } from './base-client'
export type User = { id: number; login: string; name: string | null; avatarUrl: string }
export const authClient = {
  async me(): Promise<User | null> {
    // A missing session at app startup is expected and must not open a modal.
    const response = await baseClient.get<User>(apiUrl('/auth/me'), {
      validateStatus: (status) => status === 200 || status === 401,
    })
    return response.status === 401 ? null : response.data
  },
  logout: () => request('/auth/logout', { method: 'POST' }),
  authorizeUrl: () => apiUrl('/auth/github'),
}
