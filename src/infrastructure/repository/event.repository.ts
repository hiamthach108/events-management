import { Injectable } from "@nestjs/common";
import { EventStatus, Prisma } from "@prisma/client";
import { DbService } from "../database/db.service";
import { EventSearchFilter } from "@/modules/event/dtos/filter.dto";

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

    const conditions = {
      OR,
      AND,
    };

    const total = await this.dbCtx.event.count({
      where: conditions,
    });

    const data = await this.dbCtx.event.findMany({
      where: conditions,
      take: params.take,
      skip: params.skip,
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
}
