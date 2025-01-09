import { CacheService } from "@/infrastructure/cache/cache.service";
import { APP_ENV, APP_NAME, APP_VERSION } from "@/shared/constants/env.const";
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("HealthCheck")
@Controller("ping")
export class PingController {
  constructor(private readonly cache: CacheService) {}

  @Get()
  async ping() {
    return {
      message: "pong",
      app: APP_NAME,
      env: APP_ENV,
      version: APP_VERSION,
    };
  }

  @Get("cache")
  async pingCache() {
    const connection = await this.cache.checkConnection();

    return {
      message: "pong",
      app: APP_NAME,
      env: APP_ENV,
      version: APP_VERSION,
      cache: connection ? "connected" : "disconnected",
    };
  }
}
