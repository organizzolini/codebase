import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ScannerModule } from "../scanner/scanner.module";

import { ShellService } from "./shell.service";

describe(ShellService, () => {
  let service: ShellService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ScannerModule],
      providers: [ShellService],
    }).compile();

    service = await module.resolve(ShellService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("declares an Object dependency when the scanner is not loaded yet", async () => {
    // An import cycle can leave the scanner undefined while this class is
    // decorated, and the decorator metadata then falls back to Object.
    vi.resetModules();
    vi.doMock("../scanner/scanner.service", () => ({
      ScannerService: undefined,
    }));

    const { ShellService: Reloaded } = await import("./shell.service");

    expect(Reflect.getMetadata("design:paramtypes", Reloaded)).toStrictEqual([
      Object,
    ]);

    vi.doUnmock("../scanner/scanner.service");
    vi.resetModules();
  });

  it.each([
    ["a command", "echo done", ["echo", "done"]],
    ["a variable", "name=value", ["name", "value"]],
    ["a comment line", "# hidden words\nrun", ["run"]],
    ["a trailing comment", "run # hidden words", ["run"]],
    ["a comment after a semicolon", "run;# hidden", ["run"]],
    ["a hash inside a word", "echo a#b", ["echo", "a", "b"]],
    ["the argument count", "echo $# done", ["echo", "done"]],
    ["a length expansion", "echo ${#name}", ["echo", "name"]],
    ["a single quoted string", "echo 'hidden words'", ["echo"]],
    ["a double quoted string", 'echo "hidden words"', ["echo"]],
    [
      "an escaped quote",
      String.raw`echo "say \"hidden\" now" after`,
      ["echo", "after"],
    ],
    ["an escaped hash", String.raw`echo \# hidden`, ["echo", "hidden"]],
    [
      "an ansi-c string",
      String.raw`echo $'it\'s hidden' after`,
      ["echo", "after"],
    ],
    ["an unterminated string", 'echo "hidden', ["echo"]],
    [
      "a here-document",
      "cat <<EOF\nhidden words\nEOF\nafter",
      ["cat", "after"],
    ],
    [
      "a quoted here-document delimiter",
      "cat <<'END'\nhidden $words\nEND\nafter",
      ["cat", "after"],
    ],
    [
      "an indented here-document",
      "cat <<-EOT\n\thidden\n\tEOT\nafter",
      ["cat", "after"],
    ],
    ["an empty here-document", "cat <<EOF\nEOF\nafter", ["cat", "after"]],
    [
      "an unterminated here-document is not one",
      "cat <<EOF\nword",
      ["cat", "EOF", "word"],
    ],
    [
      "an arithmetic shift",
      "x=$((1 << shift))\necho after",
      ["x", "shift", "echo", "after"],
    ],
    ["a here-string", 'cat <<<"hidden" after', ["cat", "after"]],
    [
      "an associative array key",
      'declare -A map=(["retryCount"]=3)',
      ["declare", "A", "map", "retryCount"],
    ],
    ["a quoted array key", 'map["retryCount"]=3', ["map", "retryCount"]],
    ["a number literal", "exit 0 && sleep 10s", ["exit", "sleep"]],
    [
      "a command substitution",
      "x=$(git rev-parse HEAD)",
      ["x", "git", "rev", "parse", "HEAD"],
    ],
    ["nothing", "", []],
  ])("reads %s", (_name, source, expected) => {
    expect(service.tokenize(source)).toStrictEqual(expected);
  });
});
