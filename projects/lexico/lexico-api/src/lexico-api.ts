import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { createLightship } from "lightship";

import { LoggerService } from "@codebase/observability";

import { environmentSchema } from "./lexico-api.constants";
import { LexicoApiModule } from "./lexico-api.module";
import { CorsService } from "./modules/cors/cors.service";

import type { INestApplication } from "@nestjs/common";

/**
 * Boots the GraphQL API with its CORS options and health probes.
 */
async function bootstrap(): Promise<void> {
  const environment = environmentSchema.parse(process.env);
  const logger = new LoggerService();
  logger.setContext("NestApplication");

  const lightship = await createLightship({
    port: environment.LEXICO_API_LIGHTSHIP_PORT,
  });

  const application: INestApplication = await NestFactory.create(
    LexicoApiModule,
    new ExpressAdapter(),
    {
      bufferLogs: true,
      logger,
    },
  );

  application.enableCors(
    application
      .get(CorsService)
      .getOptions(environment.LEXICO_API_CORS_ORIGINS),
  );

  lightship.registerShutdownHandler(async () => {
    await application.close();
  });

  await application.listen(environment.LEXICO_API_PORT);
  lightship.signalReady();

  logger.log(
    `🌐 Serving GraphQL API on http://localhost:${environment.LEXICO_API_PORT}/graphql`,
  );
}

void bootstrap();
