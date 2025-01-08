import { JwtService } from "@/core/jwt/jwt.service";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class ProtectedGuard {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return false;
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      return false;
    }

    try {
      const decoded = await this.jwtService.verifyAccessToken(token);
      request.user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
