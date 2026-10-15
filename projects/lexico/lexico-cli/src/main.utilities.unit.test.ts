import { describe, expect, it } from "vitest";

import { MainModule } from "./lexico-cli.module";
import { rootModule } from "./main.utilities";
import { StandaloneModule } from "./standalone.module";

describe(rootModule, () => {
  it.each([
    [["export", "--table", "words"]],
    [["--no-color", "export"]],
    [["import", "--table", "words"]],
  ])("boots %o without the Lexico database", (argv) => {
    expect(rootModule(argv)).toBe(StandaloneModule);
  });

  it.each([[[]], [["--help"]], [["dictionary", "--startLemma=amo"]]])(
    "boots %o with the whole application",
    (argv) => {
      expect(rootModule(argv)).toBe(MainModule);
    },
  );
});
