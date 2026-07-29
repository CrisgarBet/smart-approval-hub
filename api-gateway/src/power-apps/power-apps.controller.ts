import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRequestDto, ApproveDto } from '../requests/dto';
import { PurchaseRequestsService } from '../requests/purchase-requests.service';
import { PowerAppsApiKeyGuard, PublicPowerApps } from './power-apps-api-key.guard';
import { PowerAppsRejectDto } from './power-apps.dto';

@ApiTags('Power Apps')
@ApiHeader({ name: 'x-api-key', required: false, description: 'Requerida cuando POWER_APPS_DEMO_KEY está configurada' })
@UseGuards(PowerAppsApiKeyGuard)
@Controller('powerapps')
export class PowerAppsController {
  constructor(private readonly requests: PurchaseRequestsService) {}

  @PublicPowerApps()
  @Get('health')
  @ApiOperation({ operationId: 'PowerAppsHealth', summary: 'Estado de integración Power Apps' })
  async health() {
    try {
      await this.requests.metrics();
      return this.healthBody(true);
    } catch {
      return this.healthBody(false);
    }
  }

  @Get('requests')
  @ApiOperation({ operationId: 'ListRequests', summary: 'Listar solicitudes para Power Apps' })
  async list(@Query('status') status?: string, @Query('search') search?: string) {
    const items = await this.requests.list(status, search);
    return { items, total: items.length };
  }

  @Get('requests/:id')
  @ApiOperation({ operationId: 'GetRequest', summary: 'Consultar solicitud para Power Apps' })
  get(@Param('id') id: string) { return this.requests.get(id); }

  @Post('requests')
  @ApiOperation({ operationId: 'CreateRequest', summary: 'Crear solicitud desde Power Apps' })
  create(@Body() dto: CreateRequestDto) { return this.requests.create(dto); }

  @Patch('requests/:id/approve')
  @ApiOperation({ operationId: 'ApproveRequest', summary: 'Aprobar solicitud desde Power Apps' })
  approve(@Param('id') id: string, @Body() dto: ApproveDto) { return this.requests.approve(id, dto.comment); }

  @Patch('requests/:id/reject')
  @ApiOperation({ operationId: 'RejectRequest', summary: 'Rechazar solicitud desde Power Apps' })
  reject(@Param('id') id: string, @Body() dto: PowerAppsRejectDto) { return this.requests.reject(id, dto.rejectionComment); }

  @Get('metrics')
  @ApiOperation({ operationId: 'GetMetrics', summary: 'Consultar métricas para Power Apps' })
  metrics() { return this.requests.metrics(); }

  private healthBody(domainService: boolean) {
    const powerAutomate = process.env.POWER_AUTOMATE_WEBHOOK_URL ? 'CONFIGURADO' : 'SIMULADO';
    return { status: domainService ? 'ok' : 'degraded', apiGateway: true, domainService, customConnector: 'PREPARADO', powerAutomate, endpoint: '/api/powerapps' };
  }
}
