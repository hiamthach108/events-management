import { ApiPropertyOptional } from "@nestjs/swagger";
import { EventStatus } from "@prisma/client";
import {
  IsString,
  MinLength,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsEnum,
} from "class-validator";

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(5)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(5)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(5)
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @IsOptional()
  openRegisterAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  closeRegisterAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  needApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
