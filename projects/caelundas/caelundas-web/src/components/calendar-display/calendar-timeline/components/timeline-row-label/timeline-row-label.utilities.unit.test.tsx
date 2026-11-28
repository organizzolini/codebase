import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createRowCaret, getRowPill } from "./timeline-row-label.utilities";

describe("timeline row label utilities", () => {
  it("draws a caret, right when closed and down when open", () => {
    const closed = render(<>{createRowCaret(true)}</>);
    const open = render(<>{createRowCaret(false)}</>);

    expect(
      closed.container.querySelector("svg")?.getAttribute("class"),
    ).toContain("chevron-right");
    expect(
      open.container.querySelector("svg")?.getAttribute("class"),
    ).toContain("chevron-down");
  });

  it("mutes a fallback and tints a colored row", () => {
    expect(getRowPill(true).className).toContain("text-muted-foreground");
    expect(getRowPill(false, "rgb(255, 0, 0)").style).toBeDefined();
  });
});
