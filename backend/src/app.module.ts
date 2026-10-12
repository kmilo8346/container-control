import { PaintingsController } from './paintings/paintings.controller.js';
import { RailwayService } from './paintings/railway.service.js';
import { SessionGuard } from './auth/session.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AppController, PaintingsController],
  providers: [AppService, RailwayService, SessionGuard],
})
export class AppModule {}
