import { Global, Module } from "@nestjs/common";
import { DbService } from "../database/db.service";
import { UserRepository } from "./user.repository";
import { EventRepository } from "./event.repository";

@Global()
@Module({
  imports: [],
  providers: [DbService, UserRepository, EventRepository],
  exports: [UserRepository, EventRepository],
})
export class RepositoryModule {}
