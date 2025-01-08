import { Payload } from "@/core/jwt/payload";
import { LoggerService } from "@/core/log/log.service";
import { CacheService } from "@/infrastructure/cache/cache.service";
import { UserRepository } from "@/infrastructure/repository/user.repository";

import ApiResp from "@/shared/helpers/api.helper";
import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { get } from "lodash";

@Injectable()
export class UserService {
  constructor(
    @Inject(REQUEST) private readonly httpReq: Request,
    private readonly _logger: LoggerService,
    private readonly _cache: CacheService,
    private readonly _userRepo: UserRepository,
  ) {
    this._logger.setContext("UserServices");
  }

  async handleGetUsers() {
    this._logger.log("[GetUsers]");

    const users = await this._userRepo.getListUsers();

    return ApiResp.Ok({
      users,
    });
  }

  async handleGetUserById(id: string) {
    this._logger.log("[GetUserById]");

    const user = await this._userRepo.findUserById({ id });

    return ApiResp.Ok(user);
  }

  async handleGetProfile() {
    this._logger.log("[GetProfile]");

    // Get user payload from request
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[GetProfile] Payload is empty");

      return ApiResp.Unauthorized();
    }

    const user = await this._userRepo.findUserById({ id: payload.sub });

    return ApiResp.Ok({
      user,
    });
  }
}
