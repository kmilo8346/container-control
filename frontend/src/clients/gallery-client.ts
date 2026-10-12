import { request } from './base-client'

export type Painting = { id: string; title: string; artist: string; imageUrl: string }
export type Deployment = { id: string; status: string; createdAt?: string; paintingId?: string }
export type Log = { timestamp: string; message: string; severity: string }
export type DeploymentLogs = { buildLogs: Log[]; deploymentLogs: Log[] }

export const galleryClient = {
  listPaintings: () => request<Painting[]>('/paintings'),
  listDeployments: () => request<Deployment[]>('/deployments'),
  createDeployment: (paintingId: string) =>
    request<Deployment>('/deployments', { method: 'POST', data: { paintingId } }),
  getDeployment: (id: string) => request<Deployment>(`/deployments/${encodeURIComponent(id)}`),
  getLogs: (id: string) => request<DeploymentLogs>(`/deployments/${encodeURIComponent(id)}/logs`),
}
