import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

@Injectable()
export class DbService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DbService.name);

  async onModuleInit() {
    try {
      this.logger.log("Running database migrations...");
      execSync("npx prisma migrate deploy", { stdio: "inherit" });

      this.logger.log("Connecting to database...");
      await this.$connect();

      this.logger.log("Database initialization completed");
    } catch (error) {
      this.logger.error("Database initialization failed:", error);
      throw error;
    }
  }
}
