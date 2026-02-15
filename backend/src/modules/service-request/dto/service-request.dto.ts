import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  serviceType!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsDateString()
  requestedTime?: string;
}

export class UpdateServiceRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  assignedStaffId?: string;

  @IsOptional()
  @IsDateString()
  completedTime?: string;
}
