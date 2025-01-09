import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString, IsString } from "class-validator";

export class EventSearchFilter {
  @ApiProperty({
    description: "Number of items to return",
    example: 10,
  })
  take: number;

  @ApiProperty({
    description: "Number of items to skip",
    example: 0,
  })
  skip: number;

  @ApiPropertyOptional({
    description: "Search by event name",
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: "Start date of event",
    example: "2021-01-01T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    description: "End date of event",
    example: "2021-01-01T00:00:00.000Z",
  })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizer?: string;
}
