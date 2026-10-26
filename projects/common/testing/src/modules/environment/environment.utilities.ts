import { onTestFinished } from "vitest";

/**
 * Sets environment variables for the running test, removing any given as
 * `undefined`, and restores each to its value from before the first override
 * once the test finishes. Call it from a test or a `beforeEach` hook.
 */
export function overrideEnvironment(
  overrides: Readonly<Record<string, string | undefined>>,
): void {
  for (const [name, value] of Object.entries(overrides)) {
    const original = process.env[name];

    onTestFinished(() => {
      setVariable(name, original);
    });
    setVariable(name, value);
  }
}

/** Sets one environment variable, or removes it for `undefined`. */
function setVariable(name: string, value: string | undefined): void {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, name);
  } else {
    process.env[name] = value;
  }
}
