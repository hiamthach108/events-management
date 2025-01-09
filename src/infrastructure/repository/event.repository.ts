import { Injectable } from "@nestjs/common";
import { AttendeeStatus, EventStatus, Prisma } from "@prisma/client";
import { DbService } from "../database/db.service";
import { EventSearchFilter } from "@/modules/event/dtos/filter.dto";
import { UserRoles } from "@/shared/enums/user.enum";
import { GetEventAttendeesDto } from "@/modules/event/dtos/attendee.dto";

@Injectable()
export class EventRepository {
  constructor(private dbCtx: DbService) {}

  async getListEvents(params: EventSearchFilter) {
    const OR = [] as Prisma.EventWhereInput[];
    const AND = [
      { endAt: { gte: new Date() } },
      {
        status: {
          equals: EventStatus.ACTIVE,
        },
      },
    ] as Prisma.EventWhereInput[];

    // Search conditions
    if (params.search) {
      OR.push(
        { title: { contains: params.search } },
        { location: { contains: params.search } },
        { description: { contains: params.search } },
      );
    }

    // Filter conditions
    if (params.startDate) {
      AND.push({ startAt: { gte: params.startDate } });
    }
    if (params.endDate) {
      AND.push({ endAt: { lte: params.endDate } });
    }
    if (params.location) {
      AND.push({ location: { contains: params.location } });
    }
    if (params.organizer) {
      AND.push({ createdBy: { contains: params.organizer } });
    }

    const where: Prisma.EventWhereInput = {
      AND,
      ...(OR.length > 0 && { OR }),
    };

    const total = await this.dbCtx.event.count({ where });
    const data = await this.dbCtx.event.findMany({
      where,
      take: Number(params.take),
      skip: Number(params.skip),
    });

    return { total, data };
  }

  async getEventsByOrganizerId(organizerId: string) {
    return this.dbCtx.event.findMany({ where: { createdBy: organizerId } });
  }

  async findEventById(id: Prisma.EventWhereUniqueInput) {
    return this.dbCtx.event.findUnique({ where: id });
  }

  async createEvent(data: Prisma.EventCreateInput) {
    return this.dbCtx.event.create({ data });
  }

  async updateEvent(
    id: Prisma.EventWhereUniqueInput,
    data: Prisma.EventUpdateInput,
  ) {
    return this.dbCtx.event.update({ where: id, data });
  }

  async addUserToEvent(
    eventId: string,
    userId: string,
    status: AttendeeStatus,
    role: UserRoles,
  ) {
    return this.dbCtx.eventAttendee.create({
      data: {
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
        role,
        status: status,
      },
    });
  }

  async removeUserFromEvent(eventId: string, userId: string) {
    return this.dbCtx.eventAttendee.delete({
      where: {
        userId_eventId: {
          eventId,
          userId,
        },
      },
    });
  }

  async getEventAttendees(query: GetEventAttendeesDto) {
    const where: Prisma.EventAttendeeWhereInput = {
      eventId: query.eventId,
    };

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    const total = await this.dbCtx.eventAttendee.count({ where });
    const data = await this.dbCtx.eventAttendee.findMany({
      where,
      take: Number(query.take),
      skip: Number(query.skip),
    });

    return { total, data };
  }

  async countEventAttendees(eventId: string) {
    return this.dbCtx.eventAttendee.count({
      where: { eventId, status: AttendeeStatus.CONFIRMED },
    });
  }

  async getEventAttendeeStatus(eventId: string, userId: string) {
    return this.dbCtx.eventAttendee.findUnique({
      where: { userId_eventId: { eventId, userId } },
    });
  }

  async updateAttendeeStatus(
    eventId: string,
    userId: string,
    status: AttendeeStatus,
  ) {
    return this.dbCtx.eventAttendee.update({
      where: { userId_eventId: { eventId, userId } },
      data: { status },
    });
  }
}
