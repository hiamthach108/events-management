import { IsDateAfter } from "@/shared/decorators/date-after.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  Min,
  MinDate,
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

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  openRegisterAt: string;

  @ApiProperty()
  @IsDateString()
  @MinDate(new Date())
  @IsDateAfter("openRegisterAt", {
    message: "Close date must be after open date",
  })
  closeRegisterAt: string;

  @ApiProperty()
  @IsDateString()
  @MinDate(new Date())
  startAt: string;

  @ApiProperty()
  @IsDateString()
  @MinDate(new Date())
  @IsDateAfter("startAt", { message: "End date must be after start date" })
  endAt: string;

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
    } as Prisma.EventCreateInput;
  }
}
