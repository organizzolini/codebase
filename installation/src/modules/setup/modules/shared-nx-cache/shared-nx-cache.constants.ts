import os from "node:os";
import path from "node:path";

import type { EvictionLimits } from "./shared-nx-cache.types";

// ♟️ Constants

/** The port the server listens on unless `--port` says otherwise. */
export const DEFAULT_PORT = 19_750;

/** The only address the server binds, so the cache stays local. */
export const BIND_ADDRESS = "127.0.0.1";

/** Where cached task outputs live, one file per task hash. */
export const DEFAULT_DIRECTORY = path.join(
  os.homedir(),
  ".cache",
  "codebase-nx-shared",
);

/** Default bearer token, not a secret since the server is local. */
export const DEFAULT_TOKEN = "codebase-local-nx-cache";

/** Task hash shape, which rules out path separators and dots. */
export const HASH_PATTERN = /^[\w-]{1,128}$/;

/** The path every cache request carries, with the hash after it. */
export const ROUTE_PATTERN = /^\/v1\/cache\/(.+)$/;

/** A `Content-Length` or `--port` value: digits only. */
export const DIGITS_PATTERN = /^\d+$/;

/** An `Authorization` header that carries a bearer token. */
export const BEARER_PATTERN = /^Bearer (.+)$/;

/** Prefix of an in-progress file, which no hash can start with. */
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

/** The environment variable naming the bucket's S3 endpoint, such as `https://us-iad-18.linodeobjects.com`. */
export const REMOTE_ENDPOINT_KEY = "NX_SHARED_CACHE_REMOTE_ENDPOINT";

/** The environment variable naming the bucket. */
export const REMOTE_BUCKET_KEY = "NX_SHARED_CACHE_REMOTE_BUCKET";

/** The environment variable naming the bucket's signing region. */
export const REMOTE_REGION_KEY = "NX_SHARED_CACHE_REMOTE_REGION";

/** Access key id variable; a read-only key keeps the bucket read-only. */
export const REMOTE_ACCESS_KEY_ID_KEY = "NX_SHARED_CACHE_REMOTE_ACCESS_KEY_ID";

/** The environment variable holding the secret access key. */
export const REMOTE_SECRET_ACCESS_KEY_KEY =
  "NX_SHARED_CACHE_REMOTE_SECRET_ACCESS_KEY";

/** Environment variable; `true` lets the server upload to the bucket. */
export const REMOTE_WRITABLE_KEY = "NX_SHARED_CACHE_REMOTE_WRITABLE";

/** Bucket prefix for entries, so other objects can share the bucket. */
export const REMOTE_PREFIX = "nx";

/** Timeout for one bucket request, after which it is a miss. */
export const REMOTE_TIMEOUT_MILLISECONDS = 30_000;
