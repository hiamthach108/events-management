import { UserRoles } from "@/shared/enums/user.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AttendeeStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class UserRegisterDto {
  @ApiProperty()
  eventId: string;
}

export class UserUnregisterDto {
  @ApiProperty()
  eventId: string;
}

export class AddAttendeeDto {
  @ApiProperty()
  eventId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  @IsEnum(UserRoles)
  role: string;
}

export class GetEventAttendeesDto {
  @ApiProperty()
  eventId: string;

  @ApiProperty()
  take: number;

  @ApiProperty()
  skip: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserRoles)
  role: UserRoles;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AttendeeStatus)
  status: AttendeeStatus;
}

export class UpdateAttendeeDto {
  @ApiProperty()
  eventId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  @IsEnum(AttendeeStatus)
  status: AttendeeStatus;
}
