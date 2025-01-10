import { CacheService } from "@/infrastructure/cache/cache.service";
import { EventRepository } from "@/infrastructure/repository/event.repository";
import { Inject, Injectable } from "@nestjs/common";
import { EventSearchFilter } from "./dtos/filter.dto";
import { CreateEventDto } from "./dtos/create.dto";
import { UpdateEventDto } from "./dtos/update.dto";
import { Payload } from "@/core/jwt/payload";
import { get } from "lodash";
import { REQUEST } from "@nestjs/core";
import ApiResp from "@/shared/helpers/api.helper";
import { LoggerService } from "@/core/log/log.service";
import { AttendeeStatus, Event, EventStatus } from "@prisma/client";
import { UserRoles } from "@/shared/enums/user.enum";
import { GetEventAttendeesDto, UpdateAttendeeDto } from "./dtos/attendee.dto";

@Injectable()
export class EventService {
  constructor(
    @Inject(REQUEST) private readonly httpReq: Request,
    private readonly _logger: LoggerService,
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
    const result = await this.getEventDetail(id);

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

    this.updateEventCache(result);

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

    this.updateEventCache(result);

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleUserRegisterEvent(eventId: string) {
    this._logger.log("[UserRegisterEvent]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[UserRegisterEvent] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const event = await this.getEventDetail(eventId);
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    // check if event is still open for registration
    if (event.status !== EventStatus.ACTIVE) {
      return ApiResp.BadRequest("Event is not active");
    }

    if (event.closeRegisterAt && new Date() > event.closeRegisterAt) {
      return ApiResp.BadRequest("Event registration is closed");
    }

    // check if capacity is full
    const attendeeCount = await this.getEventAttendeeCount(eventId);
    if (event.capacity && attendeeCount >= event.capacity) {
      return ApiResp.BadRequest("Event is full");
    }

    // check if user is already registered
    const attendee = await this._eventRepo.getEventAttendeeStatus(
      eventId,
      payload.iss,
    );

    if (attendee && attendee.status === AttendeeStatus.CONFIRMED) {
      return ApiResp.BadRequest("User already registered to event");
    }

    if (attendee) {
      const result = await this._eventRepo.updateAttendeeStatus(
        eventId,
        payload.iss,
        event.needApproval ? AttendeeStatus.PENDING : AttendeeStatus.CONFIRMED,
      );

      return ApiResp.Ok({
        data: result,
      });
    }

    const result = await this._eventRepo.addUserToEvent(
      eventId,
      payload.iss,
      event.needApproval ? AttendeeStatus.PENDING : AttendeeStatus.CONFIRMED,
      UserRoles.USER,
    );

    await this.updateCacheEventAttendeeCount(eventId, attendeeCount + 1);

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleUserUnregisterEvent(eventId: string) {
    this._logger.log("[UserUnregisterEvent]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[UserUnregisterEvent] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const event = await this.getEventDetail(eventId);
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    // check if user is already registered
    const attendee = await this._eventRepo.getEventAttendeeStatus(
      eventId,
      payload.iss,
    );

    if (!attendee) {
      return ApiResp.NotFound("User not registered to event");
    }

    const attendCount = await this.getEventAttendeeCount(eventId);

    const result = await this._eventRepo.removeUserFromEvent(
      eventId,
      payload.iss,
    );

    await this.updateCacheEventAttendeeCount(eventId, attendCount - 1);

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleAddUserToEvent(eventId: string, userId: string, role: UserRoles) {
    this._logger.log("[AddUserToEvent]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[AddUserToEvent] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const event = await this.getEventDetail(eventId);
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    if (event.createdBy !== payload.iss) {
      return ApiResp.Forbidden("Forbidden");
    }

    // check if user is already registered
    const attendee = await this._eventRepo.getEventAttendeeStatus(
      eventId,
      userId,
    );

    if (attendee) {
      return ApiResp.BadRequest("User already registered to event");
    }

    const result = await this._eventRepo.addUserToEvent(
      eventId,
      userId,
      AttendeeStatus.CONFIRMED,
      role,
    );

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleGetEventAttendees(params: GetEventAttendeesDto) {
    this._logger.log("[GetEventAttendees]");
    const event = await this.getEventDetail(params.eventId);
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    const { total, data } = await this._eventRepo.getEventAttendees(params);

    return ApiResp.Ok({
      total,
      take: params.take,
      skip: params.skip,
      data,
    });
  }

  async handleUpdateAttendee(body: UpdateAttendeeDto) {
    this._logger.log("[UpdateAttendee]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[UpdateAttendee] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const event = await this.getEventDetail(body.eventId);
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    if (event.createdBy !== payload.iss) {
      return ApiResp.Forbidden("Forbidden");
    }

    const result = await this._eventRepo.updateAttendeeStatus(
      body.eventId,
      body.userId,
      body.status,
    );

    return ApiResp.Ok({
      data: result,
    });
  }

  async handleUserCheckInEvent(eventId: string) {
    this._logger.log("[UserCheckinEvent]");
    const payload = get(this.httpReq, "user") as Payload;

    if (!payload) {
      this._logger.error("[UserCheckinEvent] Payload is empty");
      return ApiResp.Unauthorized("Unauthorized");
    }

    const event = await this.getEventDetail(eventId);
    if (!event) {
      return ApiResp.NotFound("Event not found");
    }

    const attendee = await this._eventRepo.getEventAttendeeStatus(
      eventId,
      payload.iss,
    );

    if (!attendee) {
      return ApiResp.NotFound("User not registered to event");
    }

    if (attendee.status !== AttendeeStatus.CONFIRMED) {
      return ApiResp.BadRequest("User not confirmed to event");
    }

    const result = await this._eventRepo.updateCheckIn(eventId, payload.iss);

    return ApiResp.Ok({
      data: result,
    });
  }

  async getEventDetail(id: string): Promise<Event | null> {
    // get from cache
    const cacheKey = `events:${id}`;
    const cache = await this._cache.get(cacheKey);
    if (cache) {
      return cache as Event;
    }

    // get from database
    const result = await this._eventRepo.findEventById({
      id,
    });

    if (!result) {
      return null;
    }

    // set cache
    await this._cache.set(cacheKey, result);

    return result;
  }

  async updateEventCache(data: Event) {
    const cacheKey = `events:${data.id}`;
    await this._cache.set(cacheKey, data);
  }

  async getEventAttendeeCount(eventId: string): Promise<number> {
    const cacheKey = `events:${eventId}:attendees:count`;
    const cache = await this._cache.get(cacheKey);
    if (cache) {
      return cache as number;
    }

    const count = await this._eventRepo.countEventAttendees(eventId);
    await this._cache.set(cacheKey, count);

    return count;
  }

  async updateCacheEventAttendeeCount(eventId: string, count: number) {
    const cacheKey = `events:${eventId}:attendees:count`;
    await this._cache.set(cacheKey, count);
  }
}
