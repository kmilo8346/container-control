import { RailwayService } from './railway.service.js';
describe('Runner service boundaries', () => {
  const service = () => new RailwayService();
  it('rejects unsupported painting IDs before any Railway request', async () => {
    const s = service(); const query = vi.spyOn(s, 'query');
    await expect(s.start('../secret')).rejects.toThrow('Choose a painting');
    expect(query).not.toHaveBeenCalled();
  });
  it('rejects access to a deployment outside the runner', async () => {
    const s = service(); vi.spyOn(s, 'list').mockResolvedValue([]);
    await expect(s.logs('other-service-deployment')).rejects.toThrow('not part of');
  });
  it('sets IMAGE_URL without auto-deploying, then creates a deployment', async () => {
    vi.stubEnv('PROJECT_TOKEN','test'); vi.stubEnv('PROJECT_ID','project'); vi.stubEnv('ENVIRONMENT_ID','environment'); vi.stubEnv('SERVICE_ID','runner');
    const s = service(); vi.spyOn(s, 'list').mockResolvedValueOnce([{ id:'old',status:'SUCCESS',createdAt:'' }]).mockResolvedValueOnce([{ id:'new',status:'QUEUED',createdAt:'' }]);
    const query = vi.spyOn(s,'query').mockResolvedValue({});
    expect(await s.start('mona-lisa')).toMatchObject({id:'new',paintingId:'mona-lisa'});
    expect(query.mock.calls[0][1]).toMatchObject({input:{name:'IMAGE_URL',skipDeploys:true,serviceId:'runner'}});
    expect((query.mock.calls[0][1] as {input:{value:string}}).input.value).toMatch(/^https:\/\//);
    expect(query.mock.calls[1][0]).toContain('serviceInstanceDeploy');
    vi.unstubAllEnvs();
  });
});
