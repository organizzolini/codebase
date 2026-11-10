import "reflect-metadata";
import { parentPort } from "node:worker_threads";

import { NestFactory } from "@nestjs/core";

import { DrawWorkerModule } from "./modules/draw/draw-worker.module";
import { DrawWorkerService } from "./modules/draw/draw-worker.service";

import type {
  DrawWorkerReply,
  DrawWorkerTask,
} from "./modules/draw/draw.types";

/**
 * Entry point of one worker thread: boots `DrawWorkerModule`, then draws each
 * batch sent to it. Failures are posted, not thrown.
 */
async function bootstrap(): Promise<void> {
  const port = parentPort;

  if (port === null) {
    throw new Error("src/worker.ts runs only as a worker thread");
  }

  const context = await NestFactory.createApplicationContext(DrawWorkerModule, {
    logger: false,
  });
  const drawWorkerService = context.get(DrawWorkerService);

  port.on("message", (task: DrawWorkerTask) => {
    let reply: DrawWorkerReply;

    try {
      reply = { records: drawWorkerService.records(task.shape, task.masks) };
    } catch (error) {
      reply = { error: error instanceof Error ? error.message : String(error) };
    }

    port.postMessage(reply);
  });
}

await bootstrap();
