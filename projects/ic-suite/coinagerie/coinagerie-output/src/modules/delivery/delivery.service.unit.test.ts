import "reflect-metadata";

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { MalformedGlossaryError } from "@coinagerie/core";
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

import { ComparisonModule } from "../comparison/comparison.module";
import { MarkdownModule } from "../markdown/markdown.module";

import { DeliveryService } from "./delivery.service";

import type { ResolvedCoinagerieOutput } from "@coinagerie/configuration";

const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../../../tmp");
const START = "<!-- coinagerie:start -->";
const END = "<!-- coinagerie:end -->";

describe(DeliveryService, () => {
  let service: DeliveryService;
  let directory: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ComparisonModule, MarkdownModule],
      providers: [DeliveryService],
    }).compile();

    service = await module.resolve(DeliveryService);
  });

  beforeEach(() => {
    mkdirSync(TEMPORARY_ROOT, { recursive: true });
    directory = mkdtempSync(path.join(TEMPORARY_ROOT, "delivery-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  function markdown(
    relativePath: string,
    description?: string,
  ): ResolvedCoinagerieOutput {
    return {
      description,
      path: path.join(directory, relativePath),
      type: "markdown",
    };
  }

  function block(...bullets: string[]): string {
    return [START, "", "## 🪙 Coinagerie", "", ...bullets, "", END].join("\n");
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("check", () => {
    it("names every word missing from and stale in each destination", () => {
      const readme = markdown("README.md");
      writeFileSync(
        readme.path,
        `# Readme\n\n${block("- **alpha**: First.", "- **gone**:")}\n`,
      );

      expect(
        service.check({ destinations: [readme], words: ["alpha", "beta"] }),
      ).toStrictEqual([
        {
          missing: ["beta"],
          path: readme.path,
          stale: ["gone"],
          type: "markdown",
        },
      ]);
    });

    it("counts every word missing from a file that does not exist yet", () => {
      const glossary = markdown("GLOSSARY.md");

      expect(
        service.check({ destinations: [glossary], words: ["alpha"] }),
      ).toStrictEqual([
        {
          missing: ["alpha"],
          path: glossary.path,
          stale: [],
          type: "markdown",
        },
      ]);
      expect(existsSync(glossary.path)).toBe(false);
    });

    it("judges each destination on its own", () => {
      const first = markdown("first.md");
      const second = markdown("second.md");
      writeFileSync(first.path, `${block("- **alpha**: Defined here.")}\n`);
      writeFileSync(second.path, `${block()}\n`);

      expect(
        service
          .check({ destinations: [first, second], words: ["alpha"] })
          .map((difference) => difference.missing),
      ).toStrictEqual([[], ["alpha"]]);
    });
  });

  describe("write", () => {
    it("rewrites the block, keeping definitions, adding bare bullets, and deleting stale words", () => {
      const readme = markdown("README.md", "Words.");
      writeFileSync(
        readme.path,
        `# Readme\n\n${block("- **gamma**: Gone.", "- **alpha**: First.\n  Continued.")}\n\nAfter.\n`,
      );

      const results = service.write({
        destinations: [readme],
        words: ["alpha", "beta"],
      });

      expect(results).toStrictEqual([
        {
          missing: ["beta"],
          path: readme.path,
          stale: ["gamma"],
          type: "markdown",
          written: true,
        },
      ]);
      expect(readFileSync(readme.path, "utf8")).toBe(
        [
          "# Readme",
          "",
          START,
          "",
          "## 🪙 Coinagerie",
          "",
          "Words.",
          "",
          "- **alpha**: First.",
          "  Continued.",
          "- **beta**:",
          "",
          END,
          "",
          "After.",
          "",
        ].join("\n"),
      );
    });

    it("changes nothing on a second write", () => {
      const readme = markdown("README.md");
      writeFileSync(readme.path, "# Readme\n");
      service.write({ destinations: [readme], words: ["alpha"] });
      const first = readFileSync(readme.path, "utf8");

      const results = service.write({
        destinations: [readme],
        words: ["alpha"],
      });

      expect(results[0]?.written).toBe(false);
      expect(readFileSync(readme.path, "utf8")).toBe(first);
      expect(first).toBe(`# Readme\n\n${block("- **alpha**:")}\n`);
    });

    it("creates a destination, and the folders above it, when none exists", () => {
      const glossary = markdown("documentation/GLOSSARY.md");

      service.write({ destinations: [glossary], words: ["alpha"] });

      expect(readFileSync(glossary.path, "utf8")).toBe(
        `${block("- **alpha**:")}\n`,
      );
    });

    it("writes nothing anywhere when any destination cannot be parsed", () => {
      const valid = markdown("valid.md");
      const broken = markdown("broken.md");
      const brokenContent = `${START}\n- **alpha**:\nstray\n${END}\n`;
      writeFileSync(valid.path, "# Valid\n");
      writeFileSync(broken.path, brokenContent);

      expect(() =>
        service.write({ destinations: [valid, broken], words: ["alpha"] }),
      ).toThrow(MalformedGlossaryError);
      expect(readFileSync(valid.path, "utf8")).toBe("# Valid\n");
      expect(readFileSync(broken.path, "utf8")).toBe(brokenContent);
    });
  });

  describe("deliveryService when its dependencies are not yet defined", () => {
    afterEach(() => {
      vi.doUnmock("../comparison/comparison.service");
      vi.doUnmock("../markdown/markdown.service");
      vi.resetModules();
    });

    it("records Object as each injection type, as a circular import would", async () => {
      vi.resetModules();
      vi.doMock("../comparison/comparison.service", () => ({
        ComparisonService: undefined,
      }));
      vi.doMock("../markdown/markdown.service", () => ({
        MarkdownService: undefined,
      }));

      const { DeliveryService: Reloaded } = await import("./delivery.service");

      expect(Reflect.getMetadata("design:paramtypes", Reloaded)).toStrictEqual([
        Object,
        Object,
      ]);
    });
  });
});
