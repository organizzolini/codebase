import { createEventsDatabase } from "./events-database";
import { UnsupportedBrowserError } from "./events-database.errors";

import type {
  WorkerRequest,
  WorkerResponse,
} from "./events-database.browser.types";
import type {
  EventsDatabase,
  SqlExecutor,
  SqlRow,
  SqlValue,
} from "./events-database.types";

/**
 * The callbacks of one select still waiting on the worker.
 */
interface PendingSelect {
  reject: (error: Error) => void;
  resolve: (rows: SqlRow[]) => void;
}

// The database file is a build artifact, absent until `build-database` runs,
// so it is found by a glob rather than imported: the build still emits it as
// a fingerprinted file, and nothing reads a missing file as a broken import.
const DATABASE_URLS = import.meta.glob<string>(
  "../../../output/events.sqlite",
  { eager: true, import: "default", query: "?url" },
);
const DATABASE_URL = Object.values(DATABASE_URLS).at(0) ?? "";

/**
 * The events database the browser reads, served by a sqlite-wasm worker.
 */
export function createBrowserEventsDatabase(): EventsDatabase {
  return createEventsDatabase(createWorkerSqlExecutor());
}

/**
 * Creates an executor that runs every select in a worker, starting the worker
 * on the first select so that nothing loads before the page asks for data.
 */
export function createWorkerSqlExecutor(): SqlExecutor {
  const pending = new Map<number, PendingSelect>();
  let worker: undefined | Worker;
  let nextId = 0;

  return {
    async select(sql: string, parameters: readonly SqlValue[]) {
      if (!worker) {
        worker = startWorker();
        listen(worker, pending);
        worker.addEventListener("error", () => {
          rejectAll(pending, "The events database worker failed to start");
          worker = undefined;
        });
      }

      nextId += 1;
      const request: WorkerRequest = {
        databaseUrl: DATABASE_URL,
        id: nextId,
        parameters,
        sql,
      };
      const started = worker;

      return new Promise<SqlRow[]>((resolve, reject) => {
        pending.set(request.id, { reject, resolve });
        started.postMessage(request);
      });
    },
  };
}

/**
 * Routes each worker answer to the select that asked for it.
 */
function listen(worker: Worker, pending: Map<number, PendingSelect>): void {
  worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const callbacks = pending.get(response.id);

    pending.delete(response.id);

    if ("error" in response) {
      callbacks?.reject(new Error(response.error));
    } else {
      callbacks?.resolve(response.rows);
    }
  });
}

/**
 * Fails every select still waiting, so none is left hanging when the worker
 * itself cannot run.
 */
function rejectAll(pending: Map<number, PendingSelect>, message: string): void {
  for (const callbacks of pending.values()) {
    callbacks.reject(new Error(message));
  }

  pending.clear();
}

/**
 * Starts the worker that owns the sqlite-wasm database. The address is a
 * `new URL(…, import.meta.url)` literal, which is what lets the build emit
 * the worker as a fingerprinted file of its own.
 */
function startWorker(): Worker {
  if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") {
    throw new UnsupportedBrowserError();
  }

  if (DATABASE_URL === "") {
    throw new Error(
      "The events database was not built; run caelundas-web:build-database",
    );
  }

  return new Worker(new URL("events-database.worker.ts", import.meta.url), {
    name: "events-database",
    type: "module",
  });
}
