import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterNumberInput } from "./filter-number-input";

describe(FilterNumberInput, () => {
  it("applies its class name", () => {
    render(
      <FilterNumberInput
        className="filter-number-input"
        label="Value"
        onValueChange={vi.fn<() => void>()}
        value={1}
      />,
    );

    expect(screen.getByTestId("filter-number-input").className).toBe(
      "filter-number-input",
    );
  });

  it("hands on a number only when it is committed, and puts back one that is not a number", () => {
    const onValueChange = vi.fn<(value: number | string) => void>();

    render(
      <FilterNumberInput
        label="Value"
        onValueChange={onValueChange}
        value={1}
      />,
    );

    const box = screen.getByLabelText<HTMLInputElement>("Value");

    fireEvent.change(box, { target: { value: "7" } });

    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.blur(box);

    expect(onValueChange).toHaveBeenCalledWith(7);

    fireEvent.change(box, { target: { value: "seven" } });
    fireEvent.blur(box);

    expect(box.value).toBe("1");
  });

  it("shows the value it is given again when the value changes elsewhere", () => {
    const { rerender } = render(
      <FilterNumberInput
        label="Value"
        onValueChange={vi.fn<() => void>()}
        value={1}
      />,
    );

    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "5" },
    });
    rerender(
      <FilterNumberInput
        label="Value"
        onValueChange={vi.fn<() => void>()}
        value={9}
      />,
    );

    expect(screen.getByLabelText<HTMLInputElement>("Value").value).toBe("9");
  });

  it("keeps what is typed when the value that comes back says the same", () => {
    const { rerender } = render(
      <FilterNumberInput
        label="Value"
        onValueChange={vi.fn<() => void>()}
        value={1}
      />,
    );

    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "4.0" },
    });
    rerender(
      <FilterNumberInput
        label="Value"
        onValueChange={vi.fn<() => void>()}
        value={4}
      />,
    );

    expect(screen.getByLabelText<HTMLInputElement>("Value").value).toBe("4.0");
  });

  it("takes any text, empty included, as a lattice does, and a limited length", () => {
    const onValueChange = vi.fn<(value: number | string) => void>();

    render(
      <FilterNumberInput
        label="Value"
        onValueChange={onValueChange}
        value="square"
        isText
      />,
    );

    const box = screen.getByLabelText<HTMLInputElement>("Value");

    fireEvent.change(box, { target: { value: "" } });
    fireEvent.blur(box);

    expect(onValueChange).toHaveBeenCalledWith("");
    expect(box.maxLength).toBe(64);
  });

  it("takes whole numbers only for a whole-number field", () => {
    const onValueChange = vi.fn<(value: number | string) => void>();

    render(
      <FilterNumberInput
        label="Value"
        onValueChange={onValueChange}
        value={1}
        isInteger
      />,
    );
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "1.5" },
    });
    fireEvent.blur(screen.getByLabelText("Value"));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
