import { ApiProperty } from "@nestjs/swagger";

export class GetRefreshTokenDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  refreshToken: string;
}
