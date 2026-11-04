import os from "node:os";
import path from "node:path";

import type { EvictionLimits } from "./shared-nx-cache.types";

// ♟️ Constants

/** The port the server listens on unless `--port` says otherwise. */
export const DEFAULT_PORT = 19_750;

/** The only address the server binds: the cache is never reachable off this machine. */
export const BIND_ADDRESS = "127.0.0.1";

/** Where cached task outputs live, one file per task hash. */
export const DEFAULT_DIRECTORY = path.join(
  os.homedir(),
  ".cache",
  "codebase-nx-shared",
);

/** The bearer token Nx sends unless `NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN` overrides it; no secret, as the server is local. */
export const DEFAULT_TOKEN = "codebase-local-nx-cache";

/** What a task hash may look like, which also rules out every path separator and dot. */
export const HASH_PATTERN = /^[\w-]{1,128}$/;

/** The path every cache request carries, with the hash after it. */
export const ROUTE_PATTERN = /^\/v1\/cache\/(.+)$/;

/** A `Content-Length` or `--port` value: digits only. */
export const DIGITS_PATTERN = /^\d+$/;

/** An `Authorization` header that carries a bearer token. */
export const BEARER_PATTERN = /^Bearer (.+)$/;

/** The prefix of a file still being written, which no hash can start with. */
export const TEMPORARY_PREFIX = ".incoming-";

/** How long an unfinished upload may sit before eviction removes it. */
export const TEMPORARY_MAXIMUM_AGE_MILLISECONDS = 60 * 60 * 1000;

/** How long an entry may go unused before eviction removes it. */
export const MAXIMUM_AGE_MILLISECONDS = 14 * 24 * 60 * 60 * 1000;

/** How large the directory may grow before the oldest entries go. */
export const MAXIMUM_BYTES = 5 * 1024 ** 3;

/** What eviction keeps: 14 days of unused entries, 5 GiB of them. */
export const DEFAULT_EVICTION_LIMITS: EvictionLimits = {
  maximumAgeMilliseconds: MAXIMUM_AGE_MILLISECONDS,
  maximumBytes: MAXIMUM_BYTES,
};

/** How often eviction runs after the run on startup. */
export const EVICTION_INTERVAL_MILLISECONDS = 60 * 60 * 1000;

/** The highest port number there is. */
export const MAXIMUM_PORT = 65_535;
