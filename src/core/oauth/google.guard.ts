// import { encodeBase64 } from "@/shared/helpers/str.helper";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleOAuthGuard extends AuthGuard("google") {
  constructor(private configService: ConfigService) {
    super({
      accessType: "offline",
      prompt: "consent",
    });
  }

  getAuthenticateOptions(context: ExecutionContext) {
    // get the path out of the query parameters
    const { token } = context.switchToHttp().getRequest().query;

    return {
      state: token,
    };
  }
}
