import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'node:crypto';

export const POWER_APPS_PUBLIC = 'powerAppsPublic';
export const PublicPowerApps = () => SetMetadata(POWER_APPS_PUBLIC, true);

@Injectable()
export class PowerAppsApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(PowerAppsApiKeyGuard.name);
  private warned = false;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(POWER_APPS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const expected = process.env.POWER_APPS_DEMO_KEY;
    if (!expected) {
      if (!this.warned) {
        this.logger.warn('POWER_APPS_DEMO_KEY no configurada: endpoints Power Apps habilitados solo para demostración local');
        this.warned = true;
      }
      return true;
    }
    const supplied = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>().headers['x-api-key'];
    if (typeof supplied !== 'string' || supplied.length === 0) throw new UnauthorizedException('Falta el header x-api-key');
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);
    if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
      throw new ForbiddenException('API key incorrecta');
    }
    return true;
  }
}
