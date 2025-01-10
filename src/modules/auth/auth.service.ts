import { JwtService } from "@/core/jwt/jwt.service";
import { LoggerService } from "@/core/log/log.service";
import { CacheService } from "@/infrastructure/cache/cache.service";
import { UserRepository } from "@/infrastructure/repository/user.repository";
import {
  GOOGLE_CALLBACK_URL,
  JWT_ACCESS_TOKEN_EXPIRED_MIN,
  JWT_REFRESH_TOKEN_EXPIRED_MIN,
} from "@/shared/constants/env.const";
import { DEFAULT_USER_ID } from "@/shared/constants/user.const";
import ApiResp from "@/shared/helpers/api.helper";
import {
  comparePassword,
  hashPassword,
  randomString,
} from "@/shared/helpers/str.helper";
import { Injectable } from "@nestjs/common";

import { get } from "lodash";
import { GetRefreshTokenDto } from "./dtos/refresh-token.dto";
import { GgAuthReqDto } from "./dtos/gg-auth.dto";
import { Response } from "express";
import { AuthTokenResp, LoginDto, RegisterDto } from "./dtos/password-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly _logger: LoggerService,
    private readonly _jwt: JwtService,
    private readonly _cache: CacheService,
    private readonly _userRepo: UserRepository,
  ) {}

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

    const url = `${GOOGLE_CALLBACK_URL}?token=${localToken}`;

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
    this._logger.log(`[GoogleLogin] ${req.user.email}`);

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
    this._logger.log(`[VerifyLocalToken] ${token}`);
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
        phone: "",
        passwordHash: "",
      });

      if (!created) {
        this._logger.error("[VerifyLocalToken]: Failed to create user");

        return ApiResp.InternalServerError("Failed to create user");
      }

      u.id = created.id;
    }
    const sessionId = randomString(32);
    const { accessToken, refreshToken, accessTokenExpAt, refreshTokenExpAt } =
      await this.generateToken(u.id, sessionId);

    return ApiResp.Ok({
      userId: u.id,
      sessionId,
      accessToken,
      refreshToken,
      accessTokenExpAt,
      refreshTokenExpAt,
    });
  }

  async handlePasswordLogin(body: LoginDto) {
    this._logger.log(`[PasswordLogin] ${body.email}`);

    const user = await this._userRepo.getUserByEmail(body.email);

    if (!user) {
      this._logger.error("[PasswordLogin]: User not found");
      return ApiResp.NotFound("User not found");
    }

    const isValid = await comparePassword(user.passwordHash, body.password);

    if (!isValid) {
      this._logger.error("[PasswordLogin]: Invalid password");
      return ApiResp.Unauthorized("Invalid password");
    }

    const sessionId = randomString(32);
    const { accessToken, refreshToken, accessTokenExpAt, refreshTokenExpAt } =
      await this.generateToken(user.id, sessionId);

    return ApiResp.Ok({
      userId: user.id,
      sessionId,
      accessToken,
      refreshToken,
      accessTokenExpAt,
      refreshTokenExpAt,
    } as AuthTokenResp);
  }

  async handleRegister(body: RegisterDto) {
    this._logger.log("[Register]");

    const user = await this._userRepo.getUserByEmail(body.email);

    if (user) {
      this._logger.error("[Register]: User already exists");
      return ApiResp.BadRequest("User already exists");
    }

    const hashedPassword = await hashPassword(body.password);

    const created = await this._userRepo.createUser({
      email: body.email,
      fullName: body.fullName,
      phone: body.phone,
      avatar: body.avatar,
      isActive: true,
      lastAccess: new Date(),
      passwordHash: hashedPassword,
    });

    if (!created) {
      this._logger.error("[Register]: Failed to create user");
      return ApiResp.InternalServerError("Failed to create user");
    }

    const sessionId = randomString(32);
    const { accessToken, refreshToken, accessTokenExpAt, refreshTokenExpAt } =
      await this.generateToken(created.id, sessionId);

    return ApiResp.Ok({
      userId: created.id,
      sessionId,
      accessToken,
      refreshToken,
      accessTokenExpAt,
      refreshTokenExpAt,
    } as AuthTokenResp);
  }

  async handleRefreshToken({ userId, refreshToken }: GetRefreshTokenDto) {
    const data = (await this._cache.get(
      `refresh-token:${userId}:${refreshToken}`,
    )) as {
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
      JWT_ACCESS_TOKEN_EXPIRED_MIN * 60,
    );

    const now = new Date().getTime();
    const atExpAt = now + JWT_ACCESS_TOKEN_EXPIRED_MIN * 60 * 1000;

    return ApiResp.Ok({
      accessToken: atk,
      accessTokenExpAt: atExpAt,
    });
  }

  async handleForceLogout(userId: string) {
    await this._cache.clearWithPrefix(`refresh-token:${userId}`);

    return ApiResp.Ok();
  }

  async generateToken(userId: string, sessionId: string) {
    const atk = await this._jwt.generateAccessToken(
      userId,
      sessionId,
      JWT_ACCESS_TOKEN_EXPIRED_MIN * 60,
    );

    const rtk = await this._jwt.generateRefreshToken();

    const rtDuration = JWT_REFRESH_TOKEN_EXPIRED_MIN * 60;
    await this._cache.set(
      `refresh-token:${userId}:${rtk}`,
      {
        userId: userId,
        sessionId: sessionId,
      },
      rtDuration,
    );

    const now = new Date().getTime();
    const atExpAt = now + JWT_ACCESS_TOKEN_EXPIRED_MIN * 60 * 1000;
    const rtExpAt = now + rtDuration * 1000;

    return {
      accessToken: atk,
      refreshToken: rtk,
      accessTokenExpAt: atExpAt,
      refreshTokenExpAt: rtExpAt,
    };
  }
}
