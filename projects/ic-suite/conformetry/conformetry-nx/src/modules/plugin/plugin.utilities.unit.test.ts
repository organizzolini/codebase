import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildTemplateHashCommand } from "./plugin.utilities";

describe(buildTemplateHashCommand, () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "template-hash-"));
    mkdirSync(path.join(root, "templates/widget/{{name}}"), {
      recursive: true,
    });
    writeFileSync(path.join(root, "templates/widget/{{name}}/a.ts"), "a");
    writeFileSync(path.join(root, "templates/widget/settings.json"), "{}");
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  function hash(templatePaths = ["templates/widget"]): string {
    return execSync(buildTemplateHashCommand(templatePaths), {
      cwd: root,
      encoding: "utf8",
    });
  }

  it("prints the same digest for the same contents", () => {
    expect(hash()).toMatch(/^[A-Za-z0-9+/]{43}=$/);
    expect(hash()).toBe(hash());
  });

  it("changes when a file is edited", () => {
    const before = hash();

    writeFileSync(path.join(root, "templates/widget/settings.json"), '{"a":1}');

    expect(hash()).not.toBe(before);
  });

  it("changes when a file is added or removed", () => {
    const before = hash();

    writeFileSync(path.join(root, "templates/widget/b.ts"), "b");
    const added = hash();
    rmSync(path.join(root, "templates/widget/b.ts"));

    expect(added).not.toBe(before);
    expect(hash()).toBe(before);
  });

  it("skips a template folder that does not exist", () => {
    expect(hash(["templates/widget", "templates/missing"])).toBe(hash());
  });

  it("survives a quote in a path", () => {
    expect(() => hash(["it's"])).not.toThrow();
  });
});
