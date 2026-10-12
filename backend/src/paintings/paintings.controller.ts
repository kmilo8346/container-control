import { Body, Controller, Get, Post, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { paintings } from './catalog.js';
import { RailwayService } from './railway.service.js';
import { SessionGuard } from '../auth/session.guard.js';
@Controller()
@UseGuards(SessionGuard)
export class PaintingsController {
  constructor(private readonly railway: RailwayService) {}
  @Get('paintings') catalog() { return paintings; }
  @Get('deployments') list() { return this.railway.list(); }
  @Get('deployments/:id') get(@Param('id') id: string) { return this.railway.get(id); }
  @Get('deployments/:id/logs') logs(@Param('id') id: string) { return this.railway.logs(id); }
  private checkOrigin(req: Request) {
    if (req.headers.origin !== new URL(process.env.WEB_URL ?? 'http://localhost:5173').origin) throw new ForbiddenException('Untrusted request origin.');
  }
  @Post('deployments') start(@Body() body: { paintingId?: unknown }, @Req() req: Request) { this.checkOrigin(req); return this.railway.start(body?.paintingId); }
}
