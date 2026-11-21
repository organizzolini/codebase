import type {
  FakeProcessResult,
  ScriptedAnswer,
} from "./fake-process-runner.types";

/** Picks the answer for the given call, the last one repeating. */
export function answerFor<Result>(
  answer: ScriptedAnswer<Result>,
  call: number,
): Result {
  if (!isSequence(answer)) {
    return answer;
  }

  const picked = answer[Math.min(call, answer.length - 1)];

  if (picked === undefined) {
    throw new Error("A scripted answer sequence is empty");
  }

  return picked;
}

/** A finished process that printed the given error and exited non-zero. */
export function failed(stderr = "", status = 1): FakeProcessResult {
  return { status, stderr, stdout: "" };
}

/** Tells a sequence of answers from a single one. */
export function isSequence<Result>(
  answer: ScriptedAnswer<Result>,
): answer is readonly Result[] {
  return Array.isArray(answer);
}

/** Finds the exact entry, else the longest matching `*` prefix. */
export function lookUp<Value>(
  script: Readonly<Record<string, Value>>,
  line: string,
): undefined | Value {
  if (Object.hasOwn(script, line)) {
    return script[line];
  }

  let prefix: string | undefined;

  for (const key of Object.keys(script)) {
    if (
      key.endsWith(" *") &&
      line.startsWith(key.slice(0, -1)) &&
      key.length > (prefix?.length ?? 0)
    ) {
      prefix = key;
    }
  }

  return prefix === undefined ? undefined : script[prefix];
}

/** A finished process that printed the given output and exited 0. */
export function succeeded(stdout = ""): FakeProcessResult {
  return { status: 0, stderr: "", stdout };
}
