import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../../..");

/** The Environment section of `.env.default`, up to the next blank line. */
function readEnvironmentSection(): string {
  const text = readFileSync(
    path.join(import.meta.dirname, "../configuration/.env.default"),
    "utf8",
  );
  const section = /^# 🌱 Environment\n(?<lines>(?:.+\n)+)/mu.exec(text)?.groups;

  return section?.["lines"] ?? "";
}

describe("caelundas-cli workflow", () => {
  const workflow = parse(
    readFileSync(
      path.join(WORKSPACE_ROOT, ".github/workflows/caelundas-cli.yml"),
      "utf8",
    ),
  ) as {
    on: {
      workflow_dispatch: {
        inputs: Record<string, { default: string; description: string }>;
      };
    };
  };
  const { environment, ...otherInputs } = workflow.on.workflow_dispatch.inputs;

  it("takes only the environment text as input", () => {
    expect(Object.keys(otherInputs)).toStrictEqual([]);
  });

  it("defaults the environment to the Environment section of .env.default", () => {
    expect(readEnvironmentSection()).not.toBe("");
    expect(environment?.default).toBe(readEnvironmentSection());
  });

  it("shows the same lines as the example in the input description", () => {
    expect(environment?.description).toContain(readEnvironmentSection());
  });
});
