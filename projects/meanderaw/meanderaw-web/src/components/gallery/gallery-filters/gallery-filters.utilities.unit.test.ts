import { describe, expect, it } from "vitest";

import {
  describeFiltersButton,
  listFocusable,
} from "./gallery-filters.utilities";

describe("gallery filters utilities", () => {
  it("words the Filters button with the count in force", () => {
    expect(describeFiltersButton(0)).toBe("Filter");
    expect(describeFiltersButton(3)).toBe("Filter, 3 active");
  });

  it("lists what can take focus, leaving out what is disabled or out of the tab order", () => {
    const root = globalThis.document.createElement("div");

    root.innerHTML =
      '<button>a</button><button disabled>b</button><input /><select></select><span tabindex="-1">c</span><span tabindex="0">d</span>';

    expect(listFocusable(root).map((element) => element.tagName)).toStrictEqual(
      ["BUTTON", "INPUT", "SELECT", "SPAN"],
    );
  });
});
