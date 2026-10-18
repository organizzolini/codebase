import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./database.module";

/**
 * Starts the NestJS REPL for the database command line.
 */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
