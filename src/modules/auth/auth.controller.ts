import {
  Controller,
  Get,
  UseGuards,
  Query,
  Post,
  Request,
  Body,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiTags } from "@nestjs/swagger";
import { GoogleOAuthGuard } from "@/core/oauth/google.guard";
import { GetRefreshTokenDto } from "./dtos/refresh-token.dto";
import { GgAuthReqDto } from "./dtos/gg-auth.dto";
import { LoginDto, RegisterDto } from "./dtos/password-auth.dto";

@ApiTags("Auth")
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly _service: AuthService) {}

  // @Get("admin-token")
  // async generateAdminToken() {
  //   return await this._service.handleGenerateAdminToken();
  // }

  // Google OAuth
  @Post("login-google")
  async loginGoogle(@Body() body: GgAuthReqDto) {
    return await this._service.handleGoogleAuth(body);
  }

  @Get("verify-token")
  async verifyToken(@Query("token") token: string) {
    return await this._service.handleVerifyLocalToken(token);
  }

  @Get("google")
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res) {
    return await this._service.handleGoogleLogin(req, res);
  }

  // Password Auth
  @Post("login")
  async login(@Body() body: LoginDto) {
    return await this._service.handlePasswordLogin(body);
  }

  @Post("register")
  async register(@Body() body: RegisterDto) {
    return await this._service.handleRegister(body);
  }

  @Post("refresh-token")
  async refreshToken(@Body() token: GetRefreshTokenDto) {
    return await this._service.handleRefreshToken(token);
  }

  @Post("force-logout")
  async forceLogout(@Query("userId") userId: string) {
    return await this._service.handleForceLogout(userId);
  }
}
