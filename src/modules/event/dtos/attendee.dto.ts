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
  eventId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  @IsEnum(UserRoles)
  role: UserRoles;
}

export class GetEventAttendeesDto {
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
  eventId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  @IsEnum(AttendeeStatus)
  status: AttendeeStatus;
}
