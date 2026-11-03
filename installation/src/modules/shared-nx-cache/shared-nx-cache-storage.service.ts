import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import { Injectable } from "@nestjs/common";

import {
  DEFAULT_EVICTION_LIMITS,
  HASH_PATTERN,
  TEMPORARY_MAXIMUM_AGE_MILLISECONDS,
  TEMPORARY_PREFIX,
} from "./shared-nx-cache.constants";

import type {
  Entry,
  EvictionLimits,
  EvictionResult,
  Upload,
  WriteOutcome,
} from "./shared-nx-cache.types";

/**
 * Keeps one file per task hash in a directory, and trims the directory.
 *
 * - Never overwrites: a hash that exists is left as it is.
 * - Never exposes a partial file: an upload goes to a temporary file in the
 *   same directory and is hard-linked into place once it is complete.
 * - A read marks the entry as used, so eviction by age and size keeps what is
 *   still being asked for.
 */
@Injectable()
export class SharedNxCacheStorageService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists the entries and the unfinished uploads, with the age of each. */
  private async measure(directory: string): Promise<{
    entries: Entry[];
    temporary: Entry[];
  }> {
    const entries: Entry[] = [];
    const temporary: Entry[] = [];

    for (const name of await fs.promises.readdir(directory)) {
      const file = path.join(directory, name);
      const stats = await fs.promises.stat(file).catch(() => {});

      if (stats?.isFile() !== true) {
        continue;
      }

      const entry = { bytes: stats.size, file, modified: stats.mtimeMs };

      if (name.startsWith(TEMPORARY_PREFIX)) {
        temporary.push(entry);
      } else if (HASH_PATTERN.test(name)) {
        entries.push(entry);
      }
    }

    return { entries, temporary };
  }

  /** Makes sure the directory exists and names a fresh temporary file in it. */
  private async prepare(directory: string): Promise<string> {
    await fs.promises.mkdir(directory, { recursive: true });

    return path.join(directory, `${TEMPORARY_PREFIX}${crypto.randomUUID()}`);
  }

  // 🌎 Public Methods

  /** The file an entry lives in; `hash` must already have passed `HASH_PATTERN`. */
  public entryPath(directory: string, hash: string): string {
    return path.join(directory, hash);
  }

  /**
   * Removes entries unused for too long, then the least recently used entries
   * while the directory is over its size, and unfinished uploads long
   * abandoned.
   */
  public async evict(
    directory: string,
    limits: EvictionLimits = DEFAULT_EVICTION_LIMITS,
    now: number = Date.now(),
  ): Promise<EvictionResult> {
    if (!fs.existsSync(directory)) {
      return { removed: 0 };
    }

    const { entries, temporary } = await this.measure(directory);
    const doomed = new Set<string>();

    for (const entry of temporary) {
      if (now - entry.modified > TEMPORARY_MAXIMUM_AGE_MILLISECONDS) {
        doomed.add(entry.file);
      }
    }

    const survivors = entries
      .filter((entry) => {
        const stale = now - entry.modified > limits.maximumAgeMilliseconds;

        if (stale) {
          doomed.add(entry.file);
        }

        return !stale;
      })
      .toSorted((a, b) => a.modified - b.modified);
    let total = survivors.reduce((sum, entry) => sum + entry.bytes, 0);

    for (const entry of survivors) {
      if (total <= limits.maximumBytes) {
        break;
      }

      doomed.add(entry.file);
      total -= entry.bytes;
    }

    await Promise.all(
      [...doomed].map(async (file) => fs.promises.rm(file, { force: true })),
    );

    return { removed: doomed.size };
  }

  /** Whether an entry exists. */
  public async exists(directory: string, hash: string): Promise<boolean> {
    return fs.promises
      .access(this.entryPath(directory, hash))
      .then(() => true)
      .catch(() => false);
  }

  /** Opens an entry for reading; it must exist. */
  public read(directory: string, hash: string): fs.ReadStream {
    return fs.createReadStream(this.entryPath(directory, hash));
  }

  /** Marks an entry as used just now. */
  public async touch(directory: string, hash: string): Promise<void> {
    const now = new Date();

    await fs.promises
      .utimes(this.entryPath(directory, hash), now, now)
      .catch(() => {});
  }

  /**
   * Stores a body of `length` bytes under `hash`.
   *
   * A body that is shorter or longer than `length` is discarded, and so is an
   * upload that loses the race to another upload of the same hash.
   */
  public async write(upload: Upload): Promise<WriteOutcome> {
    const { body, directory, hash, length } = upload;
    const temporary = await this.prepare(directory);
    const sink = fs.createWriteStream(temporary);
    let received = 0;

    body.on("data", (chunk: Buffer) => {
      received += chunk.length;
    });

    try {
      await pipeline(body, sink);

      if (received !== length) {
        return "length-mismatch";
      }

      await fs.promises.link(temporary, this.entryPath(directory, hash));

      return "created";
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ) {
        return "exists";
      }

      if (received !== length) {
        return "length-mismatch";
      }

      throw error;
    } finally {
      // A stream destroyed before its file opened still creates the file, so
      // removing it first can leave the temporary behind.
      if (!sink.closed) {
        await new Promise<void>((resolve) => {
          sink.once("close", resolve);
        });
      }

      await fs.promises.rm(temporary, { force: true });
    }
  }
}
