import { Module } from '@nestjs/common';
import { PurchaseRequestsModule } from '../requests/purchase-requests.module';
import { PowerAppsController } from './power-apps.controller';
import { PowerAppsApiKeyGuard } from './power-apps-api-key.guard';

@Module({ imports: [PurchaseRequestsModule], controllers: [PowerAppsController], providers: [PowerAppsApiKeyGuard] })
export class PowerAppsModule {}
