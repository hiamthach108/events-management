import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { ProtectedGuard } from "@/shared/middlewares/protected.guard";

@ApiTags("Users")
@Controller("api/v1/users")
export class UserController {
  constructor(private readonly _service: UserService) {}

  @Get()
  async getUsers() {
    return await this._service.handleGetUsers();
  }

  @Get("profile")
  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  async getProfile() {
    return await this._service.handleGetProfile();
  }
}
