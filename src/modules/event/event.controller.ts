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
}
