import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VirtualList } from "./virtual-list";

const ROWS = Array.from(
  { length: 10_000 },
  (_, index) => `Row ${String(index)}`,
);
const ROW_HEIGHT = 40;

const getRowHeight = (): number => ROW_HEIGHT;
const getRowKey = (row: string): string => row;
const renderRow = (row: string): React.ReactNode => <p>{row}</p>;

describe(VirtualList, () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  });

  it("applies its class name", () => {
    render(
      <VirtualList
        className="virtual-list"
        getRowHeight={getRowHeight}
        getRowKey={getRowKey}
        label="Rows"
        renderRow={renderRow}
        rows={ROWS}
      />,
    );

    expect(screen.getByTestId("virtual-list").className).toBe("virtual-list");
  });

  it("draws only the top of a long list it cannot measure", () => {
    render(
      <VirtualList
        getRowHeight={getRowHeight}
        getRowKey={getRowKey}
        label="Rows"
        renderRow={renderRow}
        rows={ROWS}
      />,
    );

    const rows = screen.getAllByText(/^Row \d+$/u);

    expect(rows[0]?.textContent).toBe("Row 0");
    expect(rows.length).toBeLessThan(40);
  });

  it("draws the rows its measured height shows, plus a few", () => {
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 5 * ROW_HEIGHT,
    });

    render(
      <VirtualList
        getRowHeight={getRowHeight}
        getRowKey={getRowKey}
        label="Rows"
        renderRow={renderRow}
        rows={ROWS}
      />,
    );

    expect(screen.getAllByText(/^Row \d+$/u)).toHaveLength(11);
  });
});
