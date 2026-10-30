import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { captureOutput, createTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { DocumentsService } from "./documents.service";

import type { DocumentMarkers } from "./documents.types";
import type { LoggerService } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";

const MARKERS: DocumentMarkers = {
  end: "<!-- report:end -->",
  start: "<!-- report:start -->",
};

const OTHER_MARKERS: DocumentMarkers = {
  end: "<!-- other:end -->",
  start: "<!-- other:start -->",
};

describe(DocumentsService, () => {
  let service: DocumentsService;
  let logger: DeepMocked<LoggerService>;

  beforeAll(async () => {
    const { instance, logger: loggerMock } =
      await buildTestingModule(DocumentsService);

    service = instance;
    logger = loggerMock;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(DocumentsService);

    expect(instance).toBeInstanceOf(DocumentsService);
  });

  describe("wrap", () => {
    it("puts the body between the markers", () => {
      expect(service.wrap("body", MARKERS)).toBe(
        "<!-- report:start -->\nbody\n<!-- report:end -->",
      );
    });
  });

  describe("splice", () => {
    const section = "<!-- report:start -->\nbody\n<!-- report:end -->";

    it("appends the section to a document that has none", () => {
      expect(service.splice("## Summary\n\nProse.", section, MARKERS)).toBe(
        `## Summary\n\nProse.\n\n${section}`,
      );
    });

    it("replaces an existing section in place", () => {
      const first = service.splice("## Summary", section, MARKERS);
      const replacement = section.replace("body", "fresher body");

      expect(service.splice(first, replacement, MARKERS)).toBe(
        `## Summary\n\n${replacement}`,
      );
    });

    it("is idempotent", () => {
      const once = service.splice("## Summary", section, MARKERS);

      expect(service.splice(once, section, MARKERS)).toBe(once);
    });

    it("keeps prose written after the section", () => {
      const document = `## Summary\n\n${section}\n\n## Footer`;

      expect(service.splice(document, section, MARKERS)).toContain("## Footer");
    });

    it("handles an empty document", () => {
      expect(service.splice("", section, MARKERS)).toBe(section);
    });

    it("leaves another report's section alone", () => {
      const other = service.wrap("elsewhere", OTHER_MARKERS);
      const document = service.splice(other, section, MARKERS);

      expect(document).toContain("elsewhere");
      expect(document).toContain("body");
    });
  });

  describe("emit", () => {
    it("prints the wrapped section when given no destination", async () => {
      const output = captureOutput();

      await service.emit({
        body: "## Heading\n\ncontent",
        destination: { markdown: undefined, output: undefined },
        label: "stand-in",
        markers: MARKERS,
      });
      const printed = output.stdout();

      expect(printed).toContain("<!-- report:start -->");
      expect(printed).toContain("## Heading");
      expect(logger.debug).toHaveBeenCalledWith(
        "🖨️ Printed the report to standard output",
        undefined,
        { label: "stand-in" },
      );
    });

    it("writes the section on its own to an output file", async () => {
      const output = path.join(
        createTemporaryDirectory("codometer-output-"),
        "section.md",
      );

      await service.emit({
        body: "## Heading\n\ncontent",
        destination: { markdown: undefined, output },
        label: "stand-in",
        markers: MARKERS,
      });

      expect(readFileSync(output, "utf8")).toContain("<!-- report:end -->");
      expect(logger.info).toHaveBeenCalledWith("📝 Wrote a report", undefined, {
        label: "stand-in",
        path: output,
      });
    });

    it("splices into a document, keeping the prose around it", async () => {
      const markdown = path.join(
        createTemporaryDirectory("codometer-output-"),
        "document.md",
      );
      writeFileSync(markdown, "## Summary\n\nProse.\n", "utf8");

      await service.emit({
        body: "## Heading\n\ncontent",
        destination: { markdown, output: undefined },
        label: "stand-in",
        markers: MARKERS,
      });

      const written = readFileSync(markdown, "utf8");

      expect(written).toContain("## Summary");
      expect(written.indexOf("## Summary")).toBeLessThan(
        written.indexOf("## Heading"),
      );
      expect(logger.info).toHaveBeenCalledWith(
        "📝 Spliced a report",
        undefined,
        { label: "stand-in", path: markdown },
      );
    });

    it("replaces rather than appends on a second run", async () => {
      const markdown = path.join(
        createTemporaryDirectory("codometer-output-"),
        "document.md",
      );
      writeFileSync(markdown, "## Summary\n", "utf8");

      await service.emit({
        body: "## Heading\n\ncontent",
        destination: { markdown, output: undefined },
        label: "stand-in",
        markers: MARKERS,
      });
      await service.emit({
        body: "## Heading\n\nfresher",
        destination: { markdown, output: undefined },
        label: "stand-in",
        markers: MARKERS,
      });

      const written = readFileSync(markdown, "utf8");

      expect(written.split("<!-- report:start -->")).toHaveLength(2);
      expect(written).toContain("fresher");
    });

    it("creates a document that does not exist yet", async () => {
      const markdown = path.join(
        createTemporaryDirectory("codometer-output-"),
        "document.md",
      );

      await service.emit({
        body: "## Heading\n\ncontent",
        destination: { markdown, output: undefined },
        label: "stand-in",
        markers: MARKERS,
      });

      expect(readFileSync(markdown, "utf8")).toContain("## Heading");
    });

    it("writes both destinations when both are given", async () => {
      const directory = createTemporaryDirectory("codometer-output-");
      const markdown = path.join(directory, "document.md");
      const output = path.join(directory, "section.md");

      await service.emit({
        body: "## Heading\n\ncontent",
        destination: { markdown, output },
        label: "stand-in",
        markers: MARKERS,
      });

      expect(readFileSync(markdown, "utf8")).toContain("## Heading");
      expect(readFileSync(output, "utf8")).toContain("## Heading");
    });
  });
});
