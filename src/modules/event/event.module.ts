import { RepositoryModule } from "@/infrastructure/repository/repository.module";
import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";

@Module({
  imports: [RepositoryModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
