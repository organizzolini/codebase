import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./main.module";

/** Starts a REPL with the installation application's providers loaded. */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
