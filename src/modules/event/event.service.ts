import { CacheService } from "@/infrastructure/cache/cache.service";
import { EventRepository } from "@/infrastructure/repository/event.repository";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EventSearchFilter } from "./dtos/filter.dto";
import { CreateEventDto } from "./dtos/create.dto";
import { UpdateEventDto } from "./dtos/update.dto";
import { Payload } from "@/core/jwt/payload";
import { get } from "lodash";
import { REQUEST } from "@nestjs/core";
import ApiResp from "@/shared/helpers/api.helper";
import { LoggerService } from "@/core/log/log.service";
import { EventStatus } from "@prisma/client";

@Injectable()
export class EventService {
  constructor(
    @Inject(REQUEST) private readonly httpReq: Request,
    private readonly _logger: LoggerService,
    private readonly _jwt: JwtService,
    private readonly _cache: CacheService,
    private readonly _eventRepo: EventRepository,
  ) {}

  async handleGetListEvents(query: EventSearchFilter) {
    this._logger.log("[GetListEvents]");
    const { total, data } = await this._eventRepo.getListEvents(query);

    return ApiResp.Ok({
      take: query.take,
      skip: query.skip,
      total,
      data,
    });
  }

  async handleGetEventDetail(id: string) {
    this._logger.log("[GetEventDetail]");
    const result = await this._eventRepo.findEventById({
      id,
    });

    if (!result) {
      return ApiResp.NotFound("Event not found");
    }

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleCreateEvent(body: CreateEventDto) {
    this._logger.log("[CreateEvent]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[CreateEvent] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const result = await this._eventRepo.createEvent({
      ...body,
      status: EventStatus.ACTIVE,
      createdUser: {
        connect: {
          id: payload.iss,
        },
      },
    });

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleUpdateEvent(id: string, body: UpdateEventDto) {
    this._logger.log("[UpdateEvent]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[UpdateEvent] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const event = await this._eventRepo.findEventById({ id });
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    if (event.createdBy !== payload.iss) {
      return ApiResp.Forbidden("Forbidden");
    }

    const result = await this._eventRepo.updateEvent(
      { id },
      {
        ...body,
      },
    );

    return ApiResp.Ok({
      data: result,
    });
  }
}
