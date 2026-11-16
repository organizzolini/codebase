import { answerFor, lookUp } from "./fake-process-runner.utilities";

import type {
  FakeProcessResult,
  RecordedCall,
  ScriptedAnswer,
  ScriptedEffect,
} from "./fake-process-runner.types";

/**
 * Answers `capture` and `captureAsync` from a script and records calls, so
 * tests run no process. Structurally satisfies a process runner service.
 *
 * @param script - Answers each command line or `*` prefix.
 * @param streamStatus - Exit code of a streamed call the script omits.
 * @param streamScript - Exit codes for streamed calls, by command line.
 */
export class FakeProcessRunner {
  constructor(
    private readonly script: Readonly<
      Record<string, ScriptedAnswer<FakeProcessResult>>
    >,
    private readonly streamStatus = 0,
    private readonly streamScript: Readonly<
      Record<string, ScriptedAnswer<number>>
    > = {},
  ) {}

  private readonly counts = new Map<string, number>();

  public readonly captured: RecordedCall[] = [];

  /** Disk effects of each scripted command, by line or prefix. */
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
  public capture(
    executable: string,
    args: readonly string[],
  ): FakeProcessResult {
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
  ): Promise<FakeProcessResult> {
    await Promise.resolve();

    return this.capture(executable, args);
  }

  /** Answers like `capture`, minus the output; an effect writes the file. */
  public captureToFile(
    executable: string,
    args: readonly string[],
  ): FakeProcessResult {
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
