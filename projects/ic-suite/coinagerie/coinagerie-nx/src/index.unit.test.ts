import { describe, expect, it } from "vitest";

import * as plugin from "./index";

describe("coinagerie-nx index", () => {
  it("exports the root module", () => {
    expect(Object.keys(plugin).toSorted()).toStrictEqual(["MainModule"]);
  });
});
