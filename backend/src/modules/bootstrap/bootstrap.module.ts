import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { BootstrapController } from "./bootstrap.controller";

@Module({ imports: [PrismaModule], controllers: [BootstrapController] })
export class BootstrapModule {}
