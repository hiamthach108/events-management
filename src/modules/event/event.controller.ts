import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EventSearchFilter } from "./dtos/filter.dto";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dtos/create.dto";
import { UpdateEventDto } from "./dtos/update.dto";
import { ProtectedGuard } from "@/shared/middlewares/protected.guard";
import { GetEventAttendeesDto, UpdateAttendeeDto } from "./dtos/attendee.dto";

@ApiTags("Events")
@Controller("api/v1/events")
export class EventController {
  constructor(private readonly _service: EventService) {}

  @Get()
  async getListEvents(@Query() query: EventSearchFilter) {
    return await this._service.handleGetListEvents(query);
  }

  @Get(":id")
  async getEventDetail(@Param("id") id: string) {
    return await this._service.handleGetEventDetail(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  async createEvent(@Body() body: CreateEventDto) {
    return await this._service.handleCreateEvent(body);
  }

  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  @Put(":id")
  async updateEvent(@Param("id") id: string, @Body() body: UpdateEventDto) {
    return await this._service.handleUpdateEvent(id, body);
  }

  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  @Post(":id/register")
  async registerEvent(@Param("id") id: string) {
    return await this._service.handleUserRegisterEvent(id);
  }

  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  @Post(":id/unregister")
  async unregisterEvent(@Param("id") id: string) {
    return await this._service.handleUserUnregisterEvent(id);
  }

  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  @Post("attendees")
  async addAttendee(@Body() body: GetEventAttendeesDto) {
    return await this._service.handleGetEventAttendees(body);
  }

  @ApiBearerAuth()
  @UseGuards(ProtectedGuard)
  @Put("attendees")
  async updateAttendee(@Body() body: UpdateAttendeeDto) {
    return await this._service.handleUpdateAttendee(body);
  }
}
