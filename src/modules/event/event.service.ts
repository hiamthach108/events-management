import { CacheService } from "@/infrastructure/cache/cache.service";
import { EventRepository } from "@/infrastructure/repository/event.repository";
import { Injectable, LoggerService } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EventSearchFilter } from "./dtos/filter.dto";
import { CreateEventDto } from "./dtos/create.dto";
import { UpdateEventDto } from "./dtos/update.dto";

@Injectable()
export class EventService {
  constructor(
    private readonly _logger: LoggerService,
    private readonly _jwt: JwtService,
    private readonly _cache: CacheService,
    private readonly _userRepo: EventRepository,
  ) {}

  async handleGetListEvents(query: EventSearchFilter) {
    this._logger.log("[GetListEvents]");
    return await this._userRepo.getListEvents(query);
  }

  async handleGetEventDetail(id: string) {
    this._logger.log("[GetEventDetail]");
    return await this._userRepo.findEventById({
      id,
    });
  }

  async handleCreateEvent(body: CreateEventDto) {
    this._logger.log("[CreateEvent]");
    return await this._userRepo.createEvent(body.toEventInput());
  }

  async handleUpdateEvent(id: string, body: UpdateEventDto) {
    this._logger.log("[UpdateEvent]");
    return await this._userRepo.updateEvent(
      {
        id,
      },
      body.toEventInput(),
    );
  }
}
