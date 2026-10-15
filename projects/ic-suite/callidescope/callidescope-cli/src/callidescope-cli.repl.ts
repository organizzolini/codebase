import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./callidescope-cli.module";

/**
 * Starts the NestJS REPL for the callidescope application.
 */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
