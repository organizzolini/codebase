import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { createLightship } from "lightship";

import { LoggerService } from "@codebase/observability";

import { environmentSchema } from "./caelundas-api.constants";
import { CaelundasApiModule } from "./caelundas-api.module";
import { CorsService } from "./cors.service";

import type { INestApplication } from "@nestjs/common";

/**
 * Bootstraps the NestJS GraphQL API application.
 */
async function bootstrap(): Promise<void> {
  const environment = environmentSchema.parse(process.env);
  const logger = new LoggerService();
  logger.setContext("NestApplication");

  const lightship = await createLightship({
    port: environment.CAELUNDAS_API_LIGHTSHIP_PORT,
  });

  const application: INestApplication = await NestFactory.create(
    CaelundasApiModule,
    {
      bufferLogs: true,
      logger,
    },
  );

  application.enableCors(
    new CorsService().getOptions(environment.CAELUNDAS_API_CORS_ORIGINS),
  );

  lightship.registerShutdownHandler(async () => {
    await application.close();
  });

  await application.listen(environment.CAELUNDAS_API_PORT);
  lightship.signalReady();

  logger.log(
    `🌐 Serving GraphQL API on http://localhost:${environment.CAELUNDAS_API_PORT}/graphql`,
  );
}

void bootstrap();
