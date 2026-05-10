import { Body, Controller, Post } from "@nestjs/common";
import { BatchStudentEventsDto } from "./dto/batch-student-events.dto";
import { StudentEventsService } from "./student-events.service";

@Controller("v1/student/events")
export class StudentEventsController {
  constructor(private readonly service: StudentEventsService) {}

  @Post("batch")
  acceptBatch(@Body() body: BatchStudentEventsDto) {
    return this.service.acceptBatch(body);
  }
}
