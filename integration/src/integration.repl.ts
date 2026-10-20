import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./integration.module";

/** Starts a REPL with the integration application's providers loaded. */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
