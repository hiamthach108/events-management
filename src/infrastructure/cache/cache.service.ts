import type { RedisClientOptions } from "redis";
import { Global, Inject, Injectable, Module } from "@nestjs/common";

import * as redisStore from "cache-manager-redis-store";

import {
  CACHE_MANAGER,
  CacheModule as NestCacheModule,
  // CacheStore as Cache,
} from "@nestjs/cache-manager";

import { Cache } from "cache-manager";

import {
  APP_NAME,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
} from "@/shared/constants/env.const";

@Injectable()
export class CacheService {
  // Cache service implementation
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async get(key: string) {
    return this.cacheManager.get(`${APP_NAME}:${key}`);
  }

  async set(key: string, value: any, ttl?: number) {
    const TTL = ttl || 60 * 60 * 24; // 1 day

    const k = `${APP_NAME}:${key}`;

    return this.cacheManager.set(k, value, {
      ttl: TTL,
    });
  }

  async del(key: string) {
    return this.cacheManager.del(`${APP_NAME}:${key}`);
  }

  async clearWithPrefix(prefix: string) {
    return this.cacheManager.store
      .keys(`${APP_NAME}:${prefix}*`)
      .then((keys) => {
        return Promise.all(keys.map((key) => this.cacheManager.del(key)));
      });
  }

  async checkConnection(): Promise<boolean> {
    const testKey = "test_connection";
    const testValue = "ok";
    try {
      const result = await this.set(testKey, testValue, 60 * 60);
      console.log("Redis connection test result:", result);
      const value = await this.get(testKey);
      return value === testValue;
    } catch (error) {
      console.error("Redis connection error:", error);
      return false;
    }
  }
}

@Global()
@Module({
  imports: [
    NestCacheModule.register<RedisClientOptions>({
      store: redisStore,
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    } as RedisClientOptions),
  ], // Configure as needed
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
