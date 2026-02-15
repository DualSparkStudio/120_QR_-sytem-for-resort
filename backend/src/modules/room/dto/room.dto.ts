import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  roomNumber!: string;

  @IsString()
  roomType!: string;

  @IsNumber()
  @Min(0)
  floor!: number;

  @IsNumber()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  floor?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}
