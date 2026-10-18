import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./publication.module";

/** Starts a REPL with the publication application's providers loaded. */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
