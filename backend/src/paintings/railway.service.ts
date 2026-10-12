import { Injectable, BadRequestException, ConflictException, ServiceUnavailableException, NotFoundException, Logger } from '@nestjs/common';
import { paintings } from './catalog.js';
type Deployment = { id: string; status: string; createdAt: string };
export type Log = { timestamp: string; message: string; severity: string };
@Injectable()
export class RailwayService {
  private busy = false;
  private readonly logger = new Logger(RailwayService.name);
  private config() {
    const { PROJECT_TOKEN, PROJECT_ID, ENVIRONMENT_ID, SERVICE_ID } = process.env;
    if (!PROJECT_TOKEN || !PROJECT_ID || !ENVIRONMENT_ID || !SERVICE_ID) throw new ServiceUnavailableException('Configure PROJECT_TOKEN, PROJECT_ID, ENVIRONMENT_ID and SERVICE_ID in the API.');
    return { token: PROJECT_TOKEN, projectId: PROJECT_ID, environmentId: ENVIRONMENT_ID, serviceId: SERVICE_ID };
  }
  async query<T>(query: string, variables: object): Promise<T> {
    const config = this.config();
    try {
      const response = await fetch('https://backboard.railway.com/graphql/v2', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Project-Access-Token': config.token }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(15000) });
      const body = await response.json() as { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };
      if (!response.ok || body.errors?.length || !body.data) {
        const detail = body.errors?.map(e => e.message).join('; ') ?? `HTTP ${response.status}`;
        this.logger.error(`Railway operation failed: ${detail}`);
        throw new ServiceUnavailableException(`Railway: ${detail}`);
      }
      return body.data;
    } catch (error) { if (error instanceof ServiceUnavailableException) throw error; throw new ServiceUnavailableException('Railway request failed. Check the project token, resource IDs and rate limits. Refresh status before retrying a start request.'); }
  }
  async list() {
    const { projectId, environmentId, serviceId } = this.config();
    const data = await this.query<{ deployments: { edges: { node: Deployment }[] } }>('query($input: DeploymentListInput!) { deployments(input: $input, first: 20) { edges { node { id status createdAt } } } }', { input: { projectId, environmentId, serviceId } });
    return data.deployments.edges.map(e => e.node);
  }
  async get(id: string) {
    const deployment = (await this.list()).find(d => d.id === id);
    if (!deployment) throw new NotFoundException('Deployment is not part of the configured runner service or has aged out of recent history.');
    return deployment;
  }
  async start(paintingId: unknown) {
    if (typeof paintingId !== 'string' || !paintings.some(p => p.id === paintingId)) throw new BadRequestException('Choose a painting from the catalog.');
    if (this.busy) throw new ConflictException('Another container operation is in progress.');
    this.busy = true;
    try {
      const deployments = await this.list();
      const { projectId, environmentId, serviceId } = this.config();
      await this.query('mutation($input: VariableUpsertInput!) { variableUpsert(input: $input) }', { input: { projectId, environmentId, serviceId, name: 'IMAGE_URL', value: paintings.find(p => p.id === paintingId)!.imageUrl, skipDeploys: true } });
      await this.query('mutation($serviceId: String!, $environmentId: String!) { serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId) }', { serviceId, environmentId });
      const previous = new Set(deployments.map(d => d.id));
      for (let attempt = 0; attempt < 6; attempt++) {
        const fresh = (await this.list()).find(d => !previous.has(d.id));
        if (fresh) return { ...fresh, paintingId };
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      throw new ServiceUnavailableException('Deployment was requested but has not appeared yet. Refresh status before retrying.');
    } finally { this.busy = false; }
  }
  async logs(id: string) {
    await this.get(id);
    return this.query<{ buildLogs: Log[]; deploymentLogs: Log[] }>('query($id: String!) { buildLogs(deploymentId: $id, limit: 500) { timestamp message severity } deploymentLogs(deploymentId: $id, limit: 500) { timestamp message severity } }', { id });
  }
}
