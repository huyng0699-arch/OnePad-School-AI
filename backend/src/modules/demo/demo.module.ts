import { Module } from "@nestjs/common";
import { DemoController } from "./demo.controller";
import { StudentEventsModule } from "../student-events/student-events.module";

@Module({
  imports: [StudentEventsModule],
  controllers: [DemoController],
})
export class DemoModule {}
