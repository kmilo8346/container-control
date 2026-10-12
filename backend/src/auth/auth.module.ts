import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { AuthController } from './auth.controller.js';

const secret = process.env.JWT_SECRET ?? (process.env.NODE_ENV !== 'production' ? randomBytes(32).toString('hex') : undefined);
if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters in production.');

@Module({ imports: [JwtModule.register({ secret })], controllers: [AuthController] })
export class AuthModule {}
