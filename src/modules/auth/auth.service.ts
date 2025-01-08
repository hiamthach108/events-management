import { JwtService } from "@/core/jwt/jwt.service";
import { LoggerService } from "@/core/log/log.service";
import { CacheService } from "@/infrastructure/cache/cache.service";
import { UserRepository } from "@/infrastructure/repository/user.repository";
import {
  GOOGLE_LOGIN_URL,
  JWT_AT_EXPIRED,
  JWT_RT_EXPIRED,
} from "@/shared/constants/env.const";
import { DEFAULT_USER_ID, ROLE_USER } from "@/shared/constants/user.const";
import ApiResp from "@/shared/helpers/api.helper";
import { randomString } from "@/shared/helpers/str.helper";
import { Injectable } from "@nestjs/common";

import { get } from "lodash";
import { GetRefreshTokenDto } from "./dtos/refresh-token.dto";
import { GgAuthReqDto } from "./dtos/gg-auth.dto";
import { Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly _logger: LoggerService,
    private readonly _jwt: JwtService,
    private readonly _cache: CacheService,
    private readonly _userRepo: UserRepository,
  ) {
    this._logger.setContext("AuthService");
  }

  async handleGenerateAdminToken() {
    const expAt = 60 * 60 * 24 * 60; // 60 days

    const token = await this._jwt.generateAccessToken(
      DEFAULT_USER_ID,
      "admin",
      expAt,
    );

    await this._cache.set("admin-token", token, expAt);

    return ApiResp.Ok({ token });
  }

  async handleGoogleAuth(body: GgAuthReqDto) {
    this._logger.log("[GoogleAuth]");

    const localToken = await this._jwt.generateLocalToken();

    const url = `${GOOGLE_LOGIN_URL}?token=${localToken}`;

    if (body.redirect) {
      this._cache.set(
        `local-token:redirect:${localToken}`,
        body.redirect,
        60 * 60 * 30,
      );
    }

    return ApiResp.Ok({
      localToken,
      url: url,
    });
  }

  async handleGoogleLogin(req: any, res: Response) {
    this._logger.log("[GoogleLogin]");

    const user = req.user;
    const localToken = req.query.state;

    if (!localToken) {
      this._logger.error("[GoogleLogin]: Invalid state");
      return ApiResp.Unauthorized("Invalid state");
    }

    await this._cache.set(`local-token:${localToken}`, user, 60 * 60 * 30);

    const redirect = (await this._cache.get(
      `local-token:redirect:${localToken}`,
    )) as string;

    if (redirect) {
      return res.redirect(redirect);
    }

    return ApiResp.Ok(undefined, "Login success you can close this tab now");
  }

  async handleVerifyLocalToken(token: string) {
    const user = await this._cache.get(`local-token:${token}`);

    if (!user) {
      this._logger.error("[VerifyLocalToken]: Invalid token");
      return ApiResp.Unauthorized("Invalid token");
    }

    const email = get(user, "email");
    const name = get(user, "firstName");
    const picture = get(user, "picture");

    const u = await this._userRepo.getUserByEmail(email);

    if (!u) {
      const created = await this._userRepo.createUser({
        email: email,
        fullName: name,
        avatar: picture,
        isActive: true,
        lastAccess: new Date(),
        Role: {
          connect: {
            id: ROLE_USER,
          },
        },
      });

      if (!created) {
        this._logger.error("[VerifyLocalToken]: Failed to create user");

        return ApiResp.InternalServerError("Failed to create user");
      }

      u.id = created.id;
    }
    const rtk = await this._jwt.generateRefreshToken();
    const sessionId = randomString(32);
    const atk = await this._jwt.generateAccessToken(
      u.id,
      sessionId,
      JWT_AT_EXPIRED * 60,
    );

    await this._cache.set(
      `rft:${u.id}:${rtk}`,
      {
        userId: u.id,
        sessionId: sessionId,
      },
      JWT_RT_EXPIRED * 60,
    );

    const now = new Date().getTime();
    const atExpAt = now + JWT_AT_EXPIRED * 60 * 1000;
    const rtExpAt = now + JWT_RT_EXPIRED * 60 * 1000;

    return ApiResp.Ok({
      userId: u.id,
      sessionId: sessionId,
      accessToken: atk,
      refreshToken: rtk,
      accessTokenExpiredAt: atExpAt,
      refreshTokenExpiredAt: rtExpAt,
    });
  }

  async handleRefreshToken({ userId, refreshToken }: GetRefreshTokenDto) {
    const data = (await this._cache.get(`rft:${userId}:${refreshToken}`)) as {
      userId: string;
      sessionId: string;
    };

    if (!data) {
      this._logger.error("[RefreshToken]: Invalid token");
      return ApiResp.Unauthorized("Token is invalid or expired");
    }

    const atk = await this._jwt.generateAccessToken(
      userId,
      data.sessionId,
      JWT_AT_EXPIRED * 60,
    );

    const now = new Date().getTime();
    const atExpAt = now + JWT_AT_EXPIRED * 60 * 1000;

    return ApiResp.Ok({
      accessToken: atk,
      accessTokenExpiredAt: atExpAt,
    });
  }

  async handleForceLogout(userId: string) {
    await this._cache.clearWithPrefix(`rft:${userId}`);

    return ApiResp.Ok();
  }
}
