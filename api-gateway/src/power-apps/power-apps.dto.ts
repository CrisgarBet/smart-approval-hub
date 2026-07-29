import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PowerAppsRejectDto {
  @ApiProperty({ description: 'Motivo obligatorio del rechazo' })
  @IsString()
  @IsNotEmpty()
  rejectionComment!: string;
}
