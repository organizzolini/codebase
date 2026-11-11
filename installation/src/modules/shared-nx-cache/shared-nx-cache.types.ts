import type { IncomingMessage, ServerResponse } from "node:http";
import type { Readable } from "node:stream";

// 🏷️ Types

/** A file in the cache directory, as eviction measures it. */
export interface Entry {
  /** Its size. */
  bytes: number;
  /** Its path. */
  file: string;
  /** When it was last used, in milliseconds since the epoch. */
  modified: number;
}

/** What eviction may keep, so a test can use small numbers. */
export interface EvictionLimits {
  /** Entries unused for longer than this are removed. */
  maximumAgeMilliseconds: number;
  /** The oldest entries are removed until the directory fits in this. */
  maximumBytes: number;
}

/** What eviction removed. */
export interface EvictionResult {
  /** How many entries were removed. */
  removed: number;
}

/** A request and its owed response, served from a directory. */
export interface Exchange {
  /** The directory entries live in. */
  directory: string;
  /** The request. */
  request: IncomingMessage;
  /** The response. */
  response: ServerResponse;
}

/** An object read from the bucket. */
export interface RemoteEntry {
  /** The bytes, as they arrive. */
  body: Readable;
  /** The object's size. */
  length: number;
}

/** A server that is listening. */
export interface RunningServer {
  /** Stops listening, ends open connections, and clears the eviction timer. */
  close: () => Promise<void>;
  /** The port actually bound, which differs from the requested one for 0. */
  port: number;
}

/** What the command asks the server to do. */
export interface ServerOptions {
  /** Where entries are stored. */
  directory: string;
  /** The port to listen on; 0 picks a free one. */
  port: number;
}

/** An upload to store. */
export interface Upload {
  /** The bytes, as they arrive. */
  body: Readable;
  /** The directory entries live in. */
  directory: string;
  /** The task hash; it must already have passed `HASH_PATTERN`. */
  hash: string;
  /** The `Content-Length` the client declared. */
  length: number;
}

/** What `write` did with an upload. */
export type WriteOutcome = "created" | "exists" | "length-mismatch";
