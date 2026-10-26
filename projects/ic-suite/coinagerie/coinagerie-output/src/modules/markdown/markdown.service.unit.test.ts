import { MalformedGlossaryError } from "@coinagerie/core";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { MarkdownService } from "./markdown.service";

import type { Glossary } from "@coinagerie/core";

const START = "<!-- coinagerie:start -->";
const END = "<!-- coinagerie:end -->";

describe(MarkdownService, () => {
  let service: MarkdownService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [MarkdownService],
    }).compile();

    service = await module.resolve(MarkdownService);
  });

  /** A file holding exactly the given lines, each ended by a newline. */
  function file(...lines: string[]): string {
    return `${lines.join("\n")}\n`;
  }

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  describe("render", () => {
    it("renders sorted bullets between the anchors under the heading", () => {
      // Listed out of order on purpose: rendering sorts.
      const unsorted: [string, string][] = [
        ["gate", ""],
        ["aspect", "An angle between two bodies."],
      ];

      expect(service.render({ glossary: new Map(unsorted) })).toBe(
        [
          START,
          "",
          "## 🪙 Coinagerie",
          "",
          "- **aspect**: An angle between two bodies.",
          "- **gate**:",
          "",
          END,
        ].join("\n"),
      );
    });

    it("renders the description under the heading", () => {
      expect(
        service.render({
          description: "Words this project uses.",
          glossary: new Map([["gate", ""]]),
        }),
      ).toBe(
        [
          START,
          "",
          "## 🪙 Coinagerie",
          "",
          "Words this project uses.",
          "",
          "- **gate**:",
          "",
          END,
        ].join("\n"),
      );
    });

    it("renders an empty glossary as a heading alone", () => {
      expect(service.render({ glossary: new Map() })).toBe(
        [START, "", "## 🪙 Coinagerie", "", END].join("\n"),
      );
    });
  });

  describe("parse", () => {
    it.each<[string, Glossary]>([
      ["an empty glossary", new Map()],
      [
        "undefined words",
        new Map([
          ["alpha", ""],
          ["beta", ""],
        ]),
      ],
      [
        "one-line definitions",
        new Map([
          ["alpha", "The first."],
          ["beta", "The second, with **bold** and `code`: colons too."],
        ]),
      ],
      [
        "a definition continued on indented lines",
        new Map([
          ["alpha", "The first line.\n  The second line.\n  - a nested item"],
        ]),
      ],
      [
        "a definition with a blank line between its paragraphs",
        new Map([["alpha", "First paragraph.\n\n  Second paragraph."]]),
      ],
      [
        "a definition that starts on the line below its word",
        new Map([["alpha", "\n  Written below the word."]]),
      ],
    ])("reads back %s exactly as rendered", (_case, glossary) => {
      const content = file("# Readme", "", service.render({ glossary }));

      expect(service.parse(content, "/repo/README.md")).toStrictEqual(glossary);
    });

    it("reads a block whose description was written by hand", () => {
      const content = file(
        START,
        "## 🪙 Coinagerie",
        "Any prose may sit above the first bullet.",
        "",
        "- **gate**: A check.",
        END,
      );

      expect(service.parse(content, "/repo/README.md")).toStrictEqual(
        new Map([["gate", "A check."]]),
      );
    });

    it("finds no glossary in a file without anchors", () => {
      expect(
        service.parse(file("# Readme", "- **gate**: x"), "/repo/README.md"),
      ).toBeUndefined();
    });

    it.each([
      [
        "a line that is neither a bullet nor a continuation",
        file(START, "- **gate**: A check.", "stray text", END),
        "/repo/README.md:3",
      ],
      [
        "a duplicated word",
        file(START, "- **gate**:", "- **gate**: again", END),
        "/repo/README.md:3",
      ],
      [
        "a bullet that is not a word bullet",
        file(START, "- gate: A check.", END),
        "/repo/README.md:2",
      ],
      [
        "a bullet whose colon runs into its definition",
        file(START, "- **gate**:A check.", END),
        "/repo/README.md:2",
      ],
      [
        "a start anchor with no end",
        file(START, "- **gate**:"),
        "/repo/README.md:1",
      ],
      [
        "an end anchor with no start",
        file("- **gate**:", END),
        "/repo/README.md:2",
      ],
      [
        "a second start anchor",
        file(START, END, START, END),
        "/repo/README.md:3",
      ],
      ["a second end anchor", file(START, END, END), "/repo/README.md:3"],
      ["an end anchor above its start", file(END, START), "/repo/README.md:1"],
    ])("refuses %s, naming the line", (_case, content, location) => {
      expect(() => service.parse(content, "/repo/README.md")).toThrow(
        MalformedGlossaryError,
      );
      expect(() => service.parse(content, "/repo/README.md")).toThrow(location);
    });
  });

  describe("splice", () => {
    const block = [START, "new", END].join("\n");

    it("replaces the block between the anchors and keeps everything around it", () => {
      expect(
        service.splice(file("# Before", START, "old", END, "After"), block),
      ).toBe(file("# Before", START, "new", END, "After"));
    });

    it("appends the block, after a blank line, to a file without anchors", () => {
      expect(service.splice(file("# Readme"), block)).toBe(
        file("# Readme", "", START, "new", END),
      );
    });

    it("appends to a file whose last line has no newline", () => {
      expect(service.splice("# Readme", block)).toBe(
        file("# Readme", "", START, "new", END),
      );
    });

    it.each([undefined, ""])("writes the block alone into %j", (content) => {
      expect(service.splice(content, block)).toBe(file(START, "new", END));
    });
  });
});
