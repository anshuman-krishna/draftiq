import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { raw } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.enableCors();

  // raw body needed for stripe webhook signature verification
  app.use("/api/v1/payments/webhook", raw({ type: "application/json" }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`draftiq api running on port ${port}`);
}

bootstrap();
