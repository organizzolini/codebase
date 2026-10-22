import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import { LOCAL_TIME_FUNCTIONS } from "./events-database.local-time";

import type {
  WorkerRequest,
  WorkerResponse,
} from "./events-database.browser.types";
import type { SqlRow } from "./events-database.types";
import type { Database } from "@sqlite.org/sqlite-wasm";

const FILE_NAME = "/events.sqlite";

let opening: Promise<Database> | undefined;

// 🗄 Database

/**
 * Downloads the bundled database file and opens it read-only in memory, so
 * no persistent storage and no cross-origin isolation headers are needed.
 */
async function openDatabase(url: string): Promise<Database> {
  const [sqlite3, response] = await Promise.all([
    sqlite3InitModule(),
    fetch(url),
  ]);

  if (!response.ok) {
    throw new Error(`The events database answered ${String(response.status)}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  // `capi` is sqlite-wasm's name for its C-style interface.
  // cspell:ignore capi
  sqlite3.capi.sqlite3_js_posix_create_file(FILE_NAME, bytes);

  const database = new sqlite3.oo1.DB(FILE_NAME, "r");

  // The filters read each event's local time through these.
  for (const [name, localTime] of Object.entries(LOCAL_TIME_FUNCTIONS)) {
    database.createFunction(name, {
      arity: 2,
      deterministic: true,
      xFunc: (_context, instant, timeZone) => localTime(instant, timeZone),
    });
  }

  return database;
}

/**
 * Answers the page.
 */
function respond(response: WorkerResponse): void {
  globalThis.postMessage(response);
}

/**
 * Runs one select against the opened database.
 */
async function select(request: WorkerRequest): Promise<SqlRow[]> {
  // A failed open is forgotten, so the page's Retry opens the file again.
  opening ??= openDatabase(request.databaseUrl).catch((error: unknown) => {
    opening = undefined;
    throw error;
  });

  const database = await opening;

  return database.exec({
    bind: [...request.parameters],
    returnValue: "resultRows",
    rowMode: "object",
    sql: request.sql,
  });
}

// 📨 Messages

// The project's `DOM` library types this worker's global scope as a window,
// whose `postMessage` overload without a target origin is the worker's own.
globalThis.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  select(request).then(
    (rows) => {
      respond({ id: request.id, rows });
    },
    (error: unknown) => {
      respond({ error: String(error), id: request.id });
    },
  );
});
