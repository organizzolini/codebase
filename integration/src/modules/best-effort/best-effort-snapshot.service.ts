import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { SNAPSHOT_PREFIX } from "./best-effort.constants";

import type {
  BestEffortSnapshot,
  BestEffortSnapshotEntry,
} from "./best-effort.types";

/**
 * Copies the files a step may change before it runs, and puts them back when it
 * fails.
 *
 * It copies rather than asking git to check the files out, because two steps
 * can change the same file: a later step failing must restore what an earlier
 * one left, never the committed version that would undo it. A step that
 * created a file leaves nothing to copy, so restoring deletes it.
 */
@Injectable()
export class BestEffortSnapshotService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Where a path's copy sits inside the snapshot directory. */
  private copyOf(directory: string, file: string): string {
    return path.join(directory, encodeURIComponent(file));
  }

  // 🌎 Public Methods

  /** Deletes a snapshot once it is no longer needed. */
  public discard(snapshot: BestEffortSnapshot): void {
    fs.rmSync(snapshot.directory, { force: true, recursive: true });
  }

  /** Puts every path back as the snapshot found it, then deletes the snapshot. */
  public restore(snapshot: BestEffortSnapshot): void {
    for (const { existed, path: file } of snapshot.entries) {
      fs.rmSync(file, { force: true, recursive: true });

      if (existed) {
        fs.cpSync(this.copyOf(snapshot.directory, file), file, {
          recursive: true,
          verbatimSymlinks: true,
        });
      }
    }

    this.discard(snapshot);
  }

  /** Copies each path, noting which of them do not exist yet. */
  public take(paths: readonly string[]): BestEffortSnapshot {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), SNAPSHOT_PREFIX));
    const entries: BestEffortSnapshotEntry[] = paths.map((file) => {
      const existed = fs.existsSync(file);

      if (existed) {
        fs.cpSync(file, this.copyOf(directory, file), {
          recursive: true,
          verbatimSymlinks: true,
        });
      }

      return { existed, path: file };
    });

    return { directory, entries };
  }
}
