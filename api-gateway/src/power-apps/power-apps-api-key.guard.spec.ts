import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PowerAppsApiKeyGuard } from './power-apps-api-key.guard';

describe('PowerAppsApiKeyGuard', () => {
  const context = (key?: string) => ({
    getHandler: () => function handler() {}, getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => ({ headers: key === undefined ? {} : { 'x-api-key': key } }) }),
  } as unknown as ExecutionContext);
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as unknown as Reflector;
  afterEach(() => delete process.env.POWER_APPS_DEMO_KEY);

  it('permite desarrollo local sin clave configurada', () => expect(new PowerAppsApiKeyGuard(reflector).canActivate(context())).toBe(true));
  it('responde 401 cuando falta la clave', () => { process.env.POWER_APPS_DEMO_KEY='secreta'; expect(() => new PowerAppsApiKeyGuard(reflector).canActivate(context())).toThrow(UnauthorizedException); });
  it('responde 403 cuando la clave es incorrecta', () => { process.env.POWER_APPS_DEMO_KEY='secreta'; expect(() => new PowerAppsApiKeyGuard(reflector).canActivate(context('otra'))).toThrow(ForbiddenException); });
  it('permite la clave correcta', () => { process.env.POWER_APPS_DEMO_KEY='secreta'; expect(new PowerAppsApiKeyGuard(reflector).canActivate(context('secreta'))).toBe(true); });
});
