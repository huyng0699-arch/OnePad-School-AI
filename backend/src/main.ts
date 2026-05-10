import "reflect-metadata";
import { existsSync } from "fs";
import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { GlobalHttpExceptionFilter } from "./common/filters/http-exception.filter";

function resolvePublicDir() {
  const candidates = [
    join(process.cwd(), "public"),
    join(__dirname, "..", "public"),
    join(__dirname, "..", "..", "public"),
  ];

  return candidates.find((path) => existsSync(path)) ?? candidates[0];
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useStaticAssets(resolvePublicDir());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`OnePad Backend: http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}/index.html`);
}

bootstrap();
