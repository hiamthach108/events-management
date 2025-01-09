import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import {
  IsString,
  MinLength,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  MinDate,
} from "class-validator";

export class UpdateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @IsOptional()
  title?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  @IsOptional()
  openRegisterAt?: string;

  @ApiProperty()
  @IsDateString()
  @MinDate(new Date())
  @IsOptional()
  closeRegisterAt?: string;

  @ApiProperty()
  @IsDateString()
  @MinDate(new Date())
  @IsOptional()
  startAt?: string;

  @ApiProperty()
  @IsDateString()
  @MinDate(new Date())
  @IsOptional()
  endAt?: string;

  toEventInput() {
    return {
      title: this.title,
      description: this.description,
      location: this.location,
      capacity: this.capacity,
      openRegisterAt: this.openRegisterAt,
      closeRegisterAt: this.closeRegisterAt,
      startAt: this.startAt,
      endAt: this.endAt,
    } as Prisma.EventUpdateInput;
  }
}
