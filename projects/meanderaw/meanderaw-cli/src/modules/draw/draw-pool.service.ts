import path from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

import { Inject, Injectable, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { TileEnumerationService } from "../enumeration/tile-enumeration.service";

import { DrawWorkerService } from "./draw-worker.service";
import { DRAW_POOL_BATCH_SIZE, DrawWorkerError } from "./draw.constants";

import type { Environment } from "../enumeration/enumeration.types";
import type { DrawWorkerReply, DrawWorkerTask } from "./draw.types";
import type { MeanderRecord, MeanderShape } from "@codebase/meanderaw-db";

/**
 * Draws a shape's meanders across worker threads, in single-thread order.
 *
 * Threads live for the whole draw run; {@link close} ends them.
 * With no workers configured, the same service runs in-process.
 */
@Injectable()
export class DrawPoolService implements OnModuleDestroy {
  // 🏗 Dependency Injection

  constructor(
    @Inject(DrawWorkerService)
    private readonly drawWorkerService: DrawWorkerService,
    @Inject(TileEnumerationService)
    private readonly tileEnumerationService: TileEnumerationService,
    @Inject(ConfigService)
    configService: ConfigService<Environment>,
  ) {
    this.workerCount = configService.get<number>("DRAW_WORKERS", 0);
  }

  // 🔐 Private Fields

  /** Threads per shape, from `DRAW_WORKERS`; zero draws in-process. */
  private readonly workerCount: number;

  /** The live threads, spawned by the first shape that needs them. */
  private workers: undefined | Worker[];

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Cuts a shape's minima into the batches a thread draws at once. */
  private batchesOf(masks: readonly number[]): number[][] {
    const batches: number[][] = [];

    for (let start = 0; start < masks.length; start += DRAW_POOL_BATCH_SIZE) {
      batches.push(masks.slice(start, start + DRAW_POOL_BATCH_SIZE));
    }

    return batches;
  }

  /** Sends one batch to one thread and resolves with the rows it posts back. */
  private async draw(
    worker: Worker,
    task: DrawWorkerTask,
  ): Promise<readonly MeanderRecord[]> {
    return new Promise((resolve, reject) => {
      const onError = (error: Error): void => {
        worker.off("message", onMessage);
        reject(error);
      };
      const onMessage = (reply: DrawWorkerReply): void => {
        worker.off("error", onError);

        if ("error" in reply) {
          reject(new DrawWorkerError(reply.error));
        } else {
          resolve(reply.records);
        }
      };

      worker.once("error", onError);
      worker.once("message", onMessage);
      worker.postMessage(task);
    });
  }

  /**
   * The pool's threads, spawned on first use. Source runs under the SWC
   * loader the `start` target uses, which a thread needs passing again.
   */
  private spawn(): Worker[] {
    if (this.workers === undefined) {
      const extension = path.extname(fileURLToPath(import.meta.url));
      const entry = new URL(`../../worker${extension}`, import.meta.url);
      const execArgv =
        extension === ".ts"
          ? ["--import", "@swc-node/register/esm-register"]
          : [];

      this.workers = Array.from(
        { length: this.workerCount },
        () => new Worker(entry, { execArgv }),
      );
    }

    return this.workers;
  }

  /**
   * Draws a wave of batches, one per thread, starting at batch `start`; a
   * shape's last wave can hold fewer batches than there are threads.
   */
  private async wave(
    shape: MeanderShape,
    batches: readonly (readonly number[])[],
    start: number,
  ): Promise<(readonly MeanderRecord[])[]> {
    return Promise.all(
      this.spawn().flatMap((worker, index) => {
        const masks = batches[start + index];

        return masks === undefined ? [] : [this.draw(worker, { masks, shape })];
      }),
    );
  }

  /**
   * Hands back batches a wave at a time. Any wave still drawing is awaited
   * before returning, so no rejection is lost.
   */
  private async *waves(
    shape: MeanderShape,
    batches: readonly (readonly number[])[],
  ): AsyncGenerator<readonly MeanderRecord[]> {
    const size = this.spawn().length;
    let pending = this.wave(shape, batches, 0);

    try {
      for (let start = 0; start < batches.length; start += size) {
        const drawn = await pending;

        pending =
          start + size < batches.length
            ? this.wave(shape, batches, start + size)
            : Promise.resolve([]);

        yield* drawn;
      }
    } finally {
      await pending.catch(() => []);
    }
  }

  // 🌎 Public Methods

  /**
   * Every meander of one shape as database rows, one per symmetry class. At
   * most two waves are held at once.
   */
  async *batches(
    shape: MeanderShape,
  ): AsyncGenerator<readonly MeanderRecord[]> {
    const batches = this.batchesOf(
      this.tileEnumerationService.orbitMinima(shape.rows, shape.columns),
    );

    if (this.workerCount === 0) {
      for (const masks of batches) {
        yield this.drawWorkerService.records(shape, masks);
      }

      return;
    }

    yield* this.waves(shape, batches);
  }

  /** Ends every thread the pool spawned; the next shape spawns fresh ones. */
  async close(): Promise<void> {
    const workers = this.workers ?? [];

    this.workers = undefined;
    await Promise.all(workers.map(async (worker) => worker.terminate()));
  }

  /** Ends the pool's threads with the application, so none outlives it. */
  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
