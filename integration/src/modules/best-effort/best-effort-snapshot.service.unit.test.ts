import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Test } from "@nestjs/testing";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { BestEffortSnapshotService } from "./best-effort-snapshot.service";

describe(BestEffortSnapshotService, () => {
  let directory: string;
  let service: BestEffortSnapshotService;

  /** A path inside the scratch directory. */
  const at = (name: string): string => path.join(directory, name);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [BestEffortSnapshotService],
    }).compile();

    service = await module.resolve(BestEffortSnapshotService);
  });

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "snapshot-test-"));

    const module = await Test.createTestingModule({
      providers: [BestEffortSnapshotService],
    }).compile();

    service = await module.resolve(BestEffortSnapshotService);
  });

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("restores a file the step changed", () => {
    expect.hasAssertions();

    fs.writeFileSync(at("lock"), "before");

    const snapshot = service.take([at("lock")]);

    fs.writeFileSync(at("lock"), "after");
    service.restore(snapshot);

    expect(fs.readFileSync(at("lock"), "utf8")).toBe("before");
  });

  it("restores a file the step deleted", () => {
    expect.hasAssertions();

    fs.writeFileSync(at("lock"), "before");

    const snapshot = service.take([at("lock")]);

    fs.rmSync(at("lock"));
    service.restore(snapshot);

    expect(fs.readFileSync(at("lock"), "utf8")).toBe("before");
  });

  it("deletes a file the step created", () => {
    expect.hasAssertions();

    const snapshot = service.take([at("created")]);

    fs.writeFileSync(at("created"), "new");
    service.restore(snapshot);

    expect(fs.existsSync(at("created"))).toBe(false);
  });

  it("restores a folder, dropping what the step added and returning what it removed", () => {
    expect.hasAssertions();

    fs.mkdirSync(at("skills"));
    fs.writeFileSync(at("skills/kept.md"), "kept");
    fs.writeFileSync(at("skills/removed.md"), "removed");

    const snapshot = service.take([at("skills")]);

    fs.writeFileSync(at("skills/kept.md"), "changed");
    fs.rmSync(at("skills/removed.md"));
    fs.writeFileSync(at("skills/added.md"), "added");
    service.restore(snapshot);

    expect(fs.readdirSync(at("skills")).toSorted()).toStrictEqual([
      "kept.md",
      "removed.md",
    ]);
    expect(fs.readFileSync(at("skills/kept.md"), "utf8")).toBe("kept");
  });

  it("keeps a symbolic link as a link", () => {
    expect.hasAssertions();

    fs.mkdirSync(at("skills"));
    fs.symlinkSync("target", at("skills/link"));

    const snapshot = service.take([at("skills")]);

    fs.rmSync(at("skills"), { recursive: true });
    service.restore(snapshot);

    expect(fs.readlinkSync(at("skills/link"))).toBe("target");
  });

  it("restores back to what an earlier step left, not to the start", () => {
    expect.hasAssertions();

    fs.writeFileSync(at("package.json"), "original");
    fs.writeFileSync(at("package.json"), "after the first step");

    const snapshot = service.take([at("package.json")]);

    fs.writeFileSync(at("package.json"), "after the second step");
    service.restore(snapshot);

    expect(fs.readFileSync(at("package.json"), "utf8")).toBe(
      "after the first step",
    );
  });

  it("removes its copies when discarded", () => {
    expect.hasAssertions();

    fs.writeFileSync(at("lock"), "before");

    const snapshot = service.take([at("lock")]);

    service.discard(snapshot);

    expect(fs.existsSync(snapshot.directory)).toBe(false);
  });

  it("removes its copies once it has restored", () => {
    expect.hasAssertions();

    const snapshot = service.take([at("lock")]);

    service.restore(snapshot);

    expect(fs.existsSync(snapshot.directory)).toBe(false);
  });
});
