/** A finished process, shaped like the runners' own result. */
export interface FakeProcessResult {
  status: number;
  stderr: string;
  stdout: string;
}

/** One call a command made to the process runner. */
export interface RecordedCall {
  args: readonly string[];
  executable: string;
  input?: string;
}

/** Fixed, or one result per call with the last repeating. */
export type ScriptedAnswer<Result> = readonly Result[] | Result;

/** What a scripted command does to the disk when called. */
export type ScriptedEffect = (args: readonly string[]) => void;
