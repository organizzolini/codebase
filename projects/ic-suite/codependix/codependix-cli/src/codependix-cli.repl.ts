import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./codependix-cli.module";

/**
 * Starts the NestJS REPL for the codependix application.
 */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
