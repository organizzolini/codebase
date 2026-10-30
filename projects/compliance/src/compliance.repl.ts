import "reflect-metadata";
import { repl } from "@nestjs/core";

import { MainModule } from "./compliance.module";

/** Starts the compliance command-line REPL. */
async function bootstrap(): Promise<void> {
  await repl(MainModule);
}

void bootstrap();
