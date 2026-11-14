import { describe, expect, it } from "vitest";

import {
  describeFiltersButton,
  pickFilterSurface,
} from "./gallery-filters.utilities";

describe("gallery filters utilities", () => {
  it("opens the builder as a popover, a drawer or a sheet by width", () => {
    expect(pickFilterSurface(1280)).toBe("popover");
    expect(pickFilterSurface(1024)).toBe("popover");
    expect(pickFilterSurface(1023)).toBe("drawer");
    expect(pickFilterSurface(768)).toBe("drawer");
    expect(pickFilterSurface(767)).toBe("sheet");
    expect(pickFilterSurface(375)).toBe("sheet");
  });

  it("words the Filters button with the count in force", () => {
    expect(describeFiltersButton(0)).toBe("Filter");
    expect(describeFiltersButton(3)).toBe("Filter, 3 active");
  });
});
