import { IsDateAfter } from "@/shared/decorators/date-after.decorator";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  Min,
  MinLength,
} from "class-validator";

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  description: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  location: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  capacity: number;

  @ApiProperty({
    example: "2021-09-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  openRegisterAt: string;

  @ApiProperty({
    example: "2021-09-02T00:00:00.000Z",
  })
  @IsDateString()
  @IsDateAfter("openRegisterAt", {
    message: "Close date must be after open date",
  })
  closeRegisterAt: string;

  @ApiProperty({
    example: "2021-09-01T00:00:00.000Z",
  })
  @IsDateString()
  startAt: string;

  @ApiProperty({
    example: "2021-09-02T00:00:00.000Z",
  })
  @IsDateString()
  @IsDateAfter("startAt", { message: "End date must be after start date" })
  endAt: string;

  @ApiProperty()
  needApproval: boolean;
}
