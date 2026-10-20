import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LoggerService } from "@codebase/observability";

import { enterWorkspace } from "../../../testing/environment";
import { captureReport } from "../../../testing/report";
import { createTemporaryWorkspace } from "../../../testing/temporary-workspace";
import { ReporterService } from "../reporter/reporter.service";

import { UpdateReuiSkillCommand } from "./update-reui-skill.command";
import { RETRY_HINT } from "./update-reui-skill.constants";
import { UpdateReuiSkillService } from "./update-reui-skill.service";

import type { TemporaryWorkspace } from "../../../testing/temporary-workspace";

interface BundleFile {
  content: string;
  path: string;
}

const BUNDLE_FILES: BundleFile[] = [
  { content: "# ReUI\n", path: "SKILL.md" },
  { content: "rule one\n", path: "rules/one.md" },
];
const SKILL_FOLDER = ".agents/skills/reui";

/** `BUNDLE_FILES` hashed by an independent sha256, `rules/one.md` before `SKILL.md` (locale order). */
const BUNDLE_HASH =
  "9154322c003af0eda9074008c2e44a44b4b06be6e9c7c6c975a5dbb9baa98dbb";

/** Hashes files the way the skills CLI does: sorted paths, each with its bytes. */
function hashBundle(files: BundleFile[]): string {
  const hash = crypto.createHash("sha256");

  for (const file of files.toSorted((a, b) => a.path.localeCompare(b.path))) {
    hash.update(file.path);
    hash.update(file.content);
  }

  return Array.from(hash.digest(), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** The lockfile text, version first as the skills CLI writes it. */
function lockfileText(computedHash: string): string {
  return `${JSON.stringify(
    {
      skills: {
        alpha: { computedHash: "keep", source: "o/alpha" },
        reui: {
          computedHash,
          source: "./.agents/skills/reui",
          sourceType: "local",
        },
      },
      version: 1,
    },
    null,
    2,
  )}\n`;
}

describe(UpdateReuiSkillCommand, () => {
  let command: UpdateReuiSkillCommand;
  let workspace: TemporaryWorkspace;
  let report: string[];
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

  /** Writes `files` into the workspace's skill folder. */
  const writeSkill = (files: BundleFile[]): void => {
    for (const file of files) {
      const target = path.join(workspace.root, SKILL_FOLDER, file.path);

      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.content);
    }
  };
  const lockfile = (): string => path.join(workspace.root, "skills-lock.json");
  const readSkill = (file: string): string =>
    fs.readFileSync(path.join(workspace.root, SKILL_FOLDER, file), "utf8");

  /** Makes the faked fetch serve a bundle. */
  const serve = (files: BundleFile[], version = "1.2.3"): void => {
    fetchMock.mockResolvedValue(Response.json({ files, version }));
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateReuiSkillCommand,
        {
          provide: UpdateReuiSkillService,
          useValue: createMock<UpdateReuiSkillService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(UpdateReuiSkillCommand);
  });

  /** Builds the command over the real service. */
  const createCommand = async (): Promise<UpdateReuiSkillCommand> => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateReuiSkillCommand,
        UpdateReuiSkillService,
        ReporterService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    return module.resolve(UpdateReuiSkillCommand);
  };

  /** Runs the command over the real service. */
  const runCommand = async (): Promise<void> => {
    const subject = await createCommand();

    await subject.run();
  };

  beforeEach(() => {
    workspace = createTemporaryWorkspace();
    enterWorkspace(workspace);
    report = captureReport();
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    workspace.remove();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        UpdateReuiSkillCommand,
        {
          provide: UpdateReuiSkillService,
          useValue: createMock<UpdateReuiSkillService>(),
        },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("UpdateReuiSkillCommand");
  });

  it("writes nothing when the bundle equals the pin and the folder", async () => {
    expect.hasAssertions();

    const text = lockfileText(hashBundle(BUNDLE_FILES));

    fs.writeFileSync(lockfile(), text);
    writeSkill(BUNDLE_FILES);
    serve(BUNDLE_FILES);
    const write = vi.spyOn(fs, "writeFileSync");
    const remove = vi.spyOn(fs, "rmSync");

    await runCommand();

    expect(write).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(fs.readFileSync(lockfile(), "utf8")).toBe(text);
    expect(report).toStrictEqual([
      "🤹 The reui skill is current (version 1.2.3)",
    ]);
  });

  it("heals a skill folder edited by hand while the pin is current", async () => {
    expect.hasAssertions();

    const text = lockfileText(hashBundle(BUNDLE_FILES));

    fs.writeFileSync(lockfile(), text);
    writeSkill(BUNDLE_FILES);
    writeSkill([{ content: "edited\n", path: "SKILL.md" }]);
    writeSkill([{ content: "stray\n", path: "stray.md" }]);
    serve(BUNDLE_FILES);

    await runCommand();

    expect(readSkill("SKILL.md")).toBe("# ReUI\n");
    expect(
      fs.existsSync(path.join(workspace.root, SKILL_FOLDER, "stray.md")),
    ).toBe(false);
    expect(fs.readFileSync(lockfile(), "utf8")).toBe(text);
    expect(report).toStrictEqual([
      "🤹 Updated the reui skill to version 1.2.3 (2 files)",
    ]);
  });

  it("writes new content and updates the pin, keeping the rest of the lockfile", async () => {
    expect.hasAssertions();

    const next = [
      { content: "# ReUI 2\n", path: "SKILL.md" },
      { content: "rule two\n", path: "rules/two.md" },
      { content: "tool\n", path: "tools.md" },
    ];

    fs.writeFileSync(lockfile(), lockfileText(hashBundle(BUNDLE_FILES)));
    writeSkill(BUNDLE_FILES);
    serve(next, "2.0.0");

    await runCommand();

    expect(readSkill("SKILL.md")).toBe("# ReUI 2\n");
    expect(readSkill("rules/two.md")).toBe("rule two\n");
    expect(
      fs.existsSync(path.join(workspace.root, SKILL_FOLDER, "rules/one.md")),
    ).toBe(false);
    expect(fs.readFileSync(lockfile(), "utf8")).toBe(
      lockfileText(hashBundle(next)),
    );
    expect(report).toStrictEqual([
      "🤹 Updated the reui skill to version 2.0.0 (3 files)",
    ]);
  });

  it("pins the hash of the bundle the skills CLI would compute", async () => {
    expect.hasAssertions();

    expect(hashBundle(BUNDLE_FILES)).toBe(BUNDLE_HASH);

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    serve(BUNDLE_FILES);

    await runCommand();

    expect(fs.readFileSync(lockfile(), "utf8")).toBe(lockfileText(BUNDLE_HASH));
  });

  it("re-pins a stale lockfile when the folder already matches", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    writeSkill(BUNDLE_FILES);
    serve(BUNDLE_FILES);

    await runCommand();

    expect(fs.readFileSync(lockfile(), "utf8")).toBe(lockfileText(BUNDLE_HASH));
    expect(report).toStrictEqual([
      "🤹 Updated the reui skill to version 1.2.3 (2 files)",
    ]);
  });

  it("fetches from REUI_SKILL_URL when it is set", async () => {
    expect.hasAssertions();

    vi.stubEnv("REUI_SKILL_URL", "https://example.test/skill");
    fs.writeFileSync(lockfile(), lockfileText(BUNDLE_HASH));
    writeSkill(BUNDLE_FILES);
    serve(BUNDLE_FILES);

    await runCommand();

    expect(fetchMock).toHaveBeenCalledWith("https://example.test/skill");
  });

  it("refuses a bundle with no files", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    serve([]);

    await runCommand();

    expect(report[0]).toBe(
      "⚠️  The reui skill was not updated: the bundle holds no files",
    );
  });

  it("aborts on an absolute path outside the skill folder", async () => {
    expect.hasAssertions();

    const outside = path.join(workspace.root, "outside.md");

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    serve([...BUNDLE_FILES, { content: "evil\n", path: outside }]);

    await runCommand();

    expect(fs.existsSync(outside)).toBe(false);
    expect(report[0]).toContain("resolves outside");
  });

  it.each(["../escape.md", "../reui-sibling/escape.md"])(
    "aborts before touching anything when %s leaves the skill folder",
    async (escaping) => {
      expect.hasAssertions();

      const text = lockfileText("stale");

      fs.writeFileSync(lockfile(), text);
      writeSkill(BUNDLE_FILES);
      serve([...BUNDLE_FILES, { content: "evil\n", path: escaping }]);

      await expect(runCommand()).resolves.toBeUndefined();

      expect(readSkill("SKILL.md")).toBe("# ReUI\n");
      expect(fs.readFileSync(lockfile(), "utf8")).toBe(text);
      expect(
        fs.readdirSync(path.join(workspace.root, ".agents/skills")),
      ).toStrictEqual(["reui"]);
      expect(report[0]).toContain("resolves outside");
      expect(report.at(-1)).toBe(RETRY_HINT);
    },
  );

  it("exits cleanly with the retry hint when the server is down", async () => {
    expect.hasAssertions();

    const text = lockfileText("stale");

    fs.writeFileSync(lockfile(), text);
    writeSkill(BUNDLE_FILES);
    fetchMock.mockRejectedValue(new Error("fetch failed"));

    await expect(runCommand()).resolves.toBeUndefined();

    expect(report).toStrictEqual([
      "⚠️  The reui skill was not updated: fetch failed",
      RETRY_HINT,
    ]);
    expect(readSkill("SKILL.md")).toBe("# ReUI\n");
    expect(fs.readFileSync(lockfile(), "utf8")).toBe(text);
  });

  it("exits cleanly with the retry hint on an error status", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    fetchMock.mockResolvedValue(new Response("down", { status: 503 }));

    await expect(runCommand()).resolves.toBeUndefined();

    expect(report).toStrictEqual([
      "⚠️  The reui skill was not updated: HTTP 503",
      RETRY_HINT,
    ]);
  });

  it("refuses a bundle with no SKILL.md", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    serve([{ content: "x", path: "other.md" }]);

    await runCommand();

    expect(report[0]).toBe(
      "⚠️  The reui skill was not updated: the bundle has no SKILL.md",
    );
  });

  it("installs a missing skill folder even when the pin is current", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText(BUNDLE_HASH));
    serve(BUNDLE_FILES);

    await runCommand();

    expect(readSkill("rules/one.md")).toBe("rule one\n");
    expect(report).toStrictEqual([
      "🤹 Updated the reui skill to version 1.2.3 (2 files)",
    ]);
  });

  it("reports a lockfile with no reui entry and writes nothing", async () => {
    expect.hasAssertions();

    const text = `${JSON.stringify({ skills: {}, version: 1 }, null, 2)}\n`;

    fs.writeFileSync(lockfile(), text);
    serve(BUNDLE_FILES);

    await runCommand();

    expect(report[0]).toBe(
      "⚠️  The reui skill was not updated: skills-lock.json has no reui entry",
    );
    expect(fs.existsSync(path.join(workspace.root, SKILL_FOLDER))).toBe(false);
    expect(fs.readFileSync(lockfile(), "utf8")).toBe(text);
  });

  it("reports an unknown version when the bundle names none", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText(BUNDLE_HASH));
    writeSkill(BUNDLE_FILES);
    fetchMock.mockResolvedValue(Response.json({ files: BUNDLE_FILES }));

    await runCommand();

    expect(report).toStrictEqual([
      "🤹 The reui skill is current (version unknown)",
    ]);
  });

  it("exits cleanly when something other than an Error is thrown", async () => {
    expect.hasAssertions();

    fs.writeFileSync(lockfile(), lockfileText("stale"));
    fetchMock.mockRejectedValue("offline");

    await expect(runCommand()).resolves.toBeUndefined();

    expect(report).toStrictEqual([
      "⚠️  The reui skill was not updated: offline",
      RETRY_HINT,
    ]);
  });

  it("does nothing in a workspace with no skills-lock.json", async () => {
    expect.hasAssertions();

    await runCommand();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(report).toStrictEqual([]);
  });
});
