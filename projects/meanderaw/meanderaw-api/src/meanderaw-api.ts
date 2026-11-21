import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { createLightship } from "lightship";

import { LoggerService } from "@codebase/observability";

import { environmentSchema } from "./meanderaw-api.constants";
import { MeanderawApiModule } from "./meanderaw-api.module";
import { CorsService } from "./modules/cors/cors.service";

import type { INestApplication } from "@nestjs/common";

/**
 * Bootstraps the NestJS GraphQL API application.
 */
async function bootstrap(): Promise<void> {
  const environment = environmentSchema.parse(process.env);
  const logger = new LoggerService();
  logger.setContext("NestApplication");

  const lightship = await createLightship({
    port: environment.MEANDERAW_API_LIGHTSHIP_PORT,
  });

  const application: INestApplication = await NestFactory.create(
    MeanderawApiModule,
    {
      bufferLogs: true,
      logger,
    },
  );

  application.enableCors(
    new CorsService().getOptions(environment.MEANDERAW_API_CORS_ORIGINS),
  );

  lightship.registerShutdownHandler(async () => {
    await application.close();
  });

  await application.listen(environment.MEANDERAW_API_PORT);
  lightship.signalReady();

  logger.log(
    `🌐 Serving GraphQL API on http://localhost:${environment.MEANDERAW_API_PORT}/graphql`,
  );
}

void bootstrap();
