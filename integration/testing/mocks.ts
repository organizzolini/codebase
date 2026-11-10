import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { onTestFinished } from "vitest";

import type { ProcessRunnerService } from "../src/modules/process-runner/process-runner.service";
import type { CapturedProcess } from "../src/modules/process-runner/process-runner.types";

/**
 * Where temporary workspaces are made: inside this project, never the
 * operating system's temporary directory, and ignored by git.
 */
const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../tmp");

/** One call a command made to the process runner. */
export interface RecordedCall {
  args: readonly string[];
  executable: string;
  input?: string;
}

/**
 * How a scripted command line answers: one result every time, or one result
 * per call in turn, the last repeating.
 */
export type ScriptedAnswer<Result> = readonly Result[] | Result;

/** Something a scripted command line does to the disk when it is called. */
export type ScriptedEffect = (args: readonly string[]) => void;

/**
 * A task-database directory inside the workspace, for a test to fill. Under
 * `.nx`, never the OS temp directory.
 */
export interface TaskDatabaseWorkspace {
  /** Writes one file that is not a database, and the companions named by suffix. */
  add: (name: string, ageSeconds: number, companions?: string[]) => void;
  /** Writes a real SQLite database holding this many cached task results. */
  addDatabase: (name: string, ageSeconds: number, rows: number) => void;
  /** Removes the whole workspace. */
  cleanup: () => void;
  /** Overwrites the middle of a real database, so its header still reads fine. */
  damage: (name: string) => void;
  /** The absolute directory of databases the commands are pointed at. */
  directory: string;
  /** Every file in the directory, by name. */
  names: () => string[];
  /** The text of one file in the directory. */
  read: (name: string) => string;
  /** Writes a file beside the database directory, and returns its path. */
  writeBeside: (name: string, text: string) => string;
}

/** Tells a sequence of answers from a single one. */
const isSequence = <Result>(
  answer: ScriptedAnswer<Result>,
): answer is readonly Result[] => Array.isArray(answer);

/** Picks the answer for the given call, the last one repeating. */
const answerFor = <Result>(
  answer: ScriptedAnswer<Result>,
  call: number,
): Result => {
  if (!isSequence(answer)) {
    return answer;
  }

  const picked = answer[Math.min(call, answer.length - 1)];

  if (picked === undefined) {
    throw new Error("A scripted answer sequence is empty");
  }

  return picked;
};

/**
 * Finds a command line's entry: exact, else the longest ` *` entry whose
 * prefix starts the line.
 */
const lookUp = <Value>(
  script: Readonly<Record<string, Value>>,
  line: string,
): undefined | Value => {
  if (Object.hasOwn(script, line)) {
    return script[line];
  }

  const prefix = Object.keys(script)
    .filter((key) => key.endsWith(" *") && line.startsWith(key.slice(0, -1)))
    .toSorted((left, right) => right.length - left.length)[0];

  return prefix === undefined ? undefined : script[prefix];
};

/**
 * Answers `capture` and `captureAsync` from a script and records every call,
 * so a command test runs the real service with no process.
 *
 * @param script - Answers by full command line, or a prefix ending in ` *`.
 * @param streamStatus - Exit code of an unnamed streamed call.
 * @param streamScript - Exit codes for streamed calls, by command line.
 */
export class FakeProcessRunner implements Pick<
  ProcessRunnerService,
  "capture" | "captureAsync" | "captureToFile" | "stream"
> {
  constructor(
    private readonly script: Readonly<
      Record<string, ScriptedAnswer<CapturedProcess>>
    >,
    private readonly streamStatus = 0,
    private readonly streamScript: Readonly<
      Record<string, ScriptedAnswer<number>>
    > = {},
  ) {}

  private readonly counts = new Map<string, number>();

  public readonly captured: RecordedCall[] = [];

  /** What each scripted command line does to the disk, by line or prefix. */
  public readonly effects: Record<string, ScriptedEffect> = {};

  /** Every command line called, captured or streamed, in order. */
  public readonly lines: string[] = [];

  public readonly streamed: RecordedCall[] = [];

  /** Records a call, runs its effect, and counts how often its line ran. */
  private record(executable: string, args: readonly string[]): string {
    const line = [executable, ...args].join(" ");
    this.lines.push(line);
    lookUp(this.effects, line)?.(args);

    return line;
  }

  /** Counts a call of the given line, returning how many came before. */
  private take(line: string): number {
    const count = this.counts.get(line) ?? 0;
    this.counts.set(line, count + 1);

    return count;
  }

  /** Answers a captured call from the script, and records it. */
  public capture(executable: string, args: readonly string[]): CapturedProcess {
    this.captured.push({ args, executable });
    const line = this.record(executable, args);
    const answer = lookUp(this.script, line);

    if (answer === undefined) {
      throw new Error(`Unscripted command line: ${line}`);
    }

    return answerFor(answer, this.take(line));
  }

  /** Answers a call made without blocking exactly as `capture` would. */
  public async captureAsync(
    executable: string,
    args: readonly string[],
  ): Promise<CapturedProcess> {
    await Promise.resolve();

    return this.capture(executable, args);
  }

  /**
   * Answers a call whose output goes to a file, as `capture` would, minus the
   * output. A scripted effect writes the file when needed.
   */
  public captureToFile(
    executable: string,
    args: readonly string[],
  ): CapturedProcess {
    return { ...this.capture(executable, args), stdout: "" };
  }

  /** Records a streamed call, and ends it with its scripted exit code. */
  public stream(
    executable: string,
    args: readonly string[],
    input?: string,
  ): number {
    this.streamed.push({
      args,
      executable,
      ...(input === undefined ? {} : { input }),
    });
    const line = this.record(executable, args);
    const answer = lookUp(this.streamScript, line);

    return answer === undefined
      ? this.streamStatus
      : answerFor(answer, this.take(line));
  }
}

/** Makes an empty task-database directory in the workspace. */
export function createTaskDatabaseWorkspace(): TaskDatabaseWorkspace {
  const parent = path.resolve(import.meta.dirname, "../../../.nx");

  fs.mkdirSync(parent, { recursive: true });

  const root = fs.mkdtempSync(path.join(parent, "integration-test-"));
  const directory = path.join(root, "workspace-data");

  fs.mkdirSync(directory);

  return {
    add: (name, ageSeconds, companions = []) => {
      const when = new Date(Date.now() - ageSeconds * 1000);

      for (const suffix of ["", ...companions]) {
        const file = path.join(directory, `${name}${suffix}`);

        fs.writeFileSync(file, `${name}${suffix}`);
        fs.utimesSync(file, when, when);
      }
    },
    addDatabase: (name, ageSeconds, rows) => {
      const file = path.join(directory, name);
      const connection = new DatabaseSync(file);

      connection.exec("CREATE TABLE cache_outputs (hash TEXT, payload TEXT)");
      for (let row = 0; row < rows; row += 1) {
        connection
          .prepare("INSERT INTO cache_outputs VALUES (?, ?)")
          .run(`hash-${row}`, "x".repeat(200));
      }
      connection.close();

      const when = new Date(Date.now() - ageSeconds * 1000);

      fs.utimesSync(file, when, when);
    },
    cleanup: () => {
      fs.rmSync(root, { force: true, recursive: true });
    },
    damage: (name) => {
      const file = path.join(directory, name);
      const bytes = fs.readFileSync(file);

      bytes.fill(0xff, 4096, bytes.length);
      fs.writeFileSync(file, bytes);
    },
    directory,
    names: () => fs.readdirSync(directory).toSorted(),
    read: (name) => fs.readFileSync(path.join(directory, name), "utf8"),
    writeBeside: (name, text) => {
      const file = path.join(root, name);

      fs.writeFileSync(file, text);

      return file;
    },
  };
}

/** The hashes of every cached result a task database holds, sorted. */
export function readCachedHashes(file: string): string[] {
  const connection = new DatabaseSync(file);

  try {
    return connection
      .prepare("SELECT hash FROM cache_outputs ORDER BY hash")
      .all()
      .map((row) => String(row["hash"]));
  } finally {
    connection.close();
  }
}

/**
 * Writes a real Nx task database at `file`, holding one task and one cached
 * result per hash, with the foreign key Nx uses.
 */
export function writeTaskDatabase(
  file: string,
  hashes: readonly string[],
): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const connection = new DatabaseSync(file);

  connection.exec(`
    CREATE TABLE task_details (hash TEXT PRIMARY KEY NOT NULL, project TEXT NOT NULL, target TEXT NOT NULL, configuration TEXT);
    CREATE TABLE cache_outputs (hash TEXT PRIMARY KEY NOT NULL, code INTEGER NOT NULL, size INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (hash) REFERENCES task_details (hash));
  `);
  for (const hash of hashes) {
    connection
      .prepare("INSERT INTO task_details VALUES (?, 'project', 'target', NULL)")
      .run(hash);
    connection
      .prepare("INSERT INTO cache_outputs (hash, code, size) VALUES (?, 0, 1)")
      .run(hash);
  }
  connection.close();
}

/** A finished process that printed the given output and exited 0. */
export const succeeded = (stdout = ""): CapturedProcess => ({
  status: 0,
  stderr: "",
  stdout,
});

/** A finished process that printed the given error and exited non-zero. */
export const failed = (stderr = "", status = 1): CapturedProcess => ({
  status,
  stderr,
  stdout: "",
});

/**
 * Returns a maker of empty directories inside this project, each removed once
 * the current test finishes. Call it from a test or `beforeEach`.
 */
export function useTemporaryDirectories(): () => string {
  return () => {
    fs.mkdirSync(TEMPORARY_ROOT, { recursive: true });
    const directory = fs.mkdtempSync(path.join(TEMPORARY_ROOT, "workspace-"));
    onTestFinished(() => {
      fs.rmSync(directory, { force: true, recursive: true });
    });

    return directory;
  };
}

/** Writes `content` to `relative` beneath `root`, making parent directories. */
export function writeFile(
  root: string,
  relative: string,
  content: string,
): void {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
