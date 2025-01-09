import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsDateString, IsString } from "class-validator";

export class EventSearchFilter {
  @ApiProperty()
  @IsNumber()
  take: number;

  @ApiProperty()
  @IsNumber()
  skip: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  organizer?: string;
}
