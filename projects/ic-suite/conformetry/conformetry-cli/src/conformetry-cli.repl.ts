import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./conformetry-cli.module";

/** Starts an interactive NestJS REPL session for development and debugging. */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
