import { cloneElement, createElement, Fragment, isValidElement } from "react";
import { vi } from "vitest";

import type * as Presentation from "@codebase/presentation";
import type { ComponentProps } from "react";
import type { TooltipContentProps } from "recharts";

// jsdom lays nothing out, so recharts' responsive container measures zero and draws nothing; these give a chart a size of its own in a test.

const SIZE = { height: 300, width: 400 };

/**
 * The presentation module with its chart container giving its chart a size of 400 by 300; use it with stubChartSize.
 */
export async function mockChartContainer(
  hover?: TooltipContentProps,
): Promise<typeof Presentation> {
  const actual = await vi.importActual<typeof Presentation>(
    "@codebase/presentation",
  );

  return {
    ...actual,
    ChartContainer: (props: ComponentProps<typeof actual.ChartContainer>) =>
      createElement(
        actual.ChartContainer,
        props,
        isValidElement(props.children)
          ? cloneElement(props.children, SIZE)
          : props.children,
      ),
    // The pointer cannot hover in jsdom, so a test may hand the tooltip the props a hover would give it.
    ChartTooltip: ({ content }: ComponentProps<typeof actual.ChartTooltip>) =>
      createElement(
        Fragment,
        null,
        hover !== undefined && typeof content === "function"
          ? content(hover)
          : null,
      ),
  };
}

/**
 * Sizes every element 400 by 300 until the mocks are restored, so a chart's container draws what is inside it.
 */
export function stubChartSize(): void {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    ...SIZE,
    bottom: SIZE.height,
    left: 0,
    right: SIZE.width,
    toJSON: () => ({}),
    top: 0,
    x: 0,
    y: 0,
  });
}
