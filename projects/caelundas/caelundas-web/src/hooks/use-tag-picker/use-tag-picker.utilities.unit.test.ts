import { describe, expect, it } from "vitest";

import { focusSibling } from "./use-tag-picker.utilities";

function createRow(list: HTMLElement, name: string): HTMLElement {
  const row = document.createElement("div");

  row.setAttribute("role", "option");
  row.tabIndex = 0;
  row.textContent = name;
  list.append(row);

  return row;
}

/**
 * A tag list of two rows, as the editor draws it.
 */
function renderRows(): {
  first: HTMLElement;
  list: HTMLElement;
  second: HTMLElement;
} {
  const list = document.createElement("div");

  list.dataset["testid"] = "filter-tag-editor";
  document.body.replaceChildren(list);

  return {
    first: createRow(list, "aspect"),
    list,
    second: createRow(list, "trine"),
  };
}

describe(focusSibling, () => {
  it("moves focus a number of rows along the list", () => {
    const { first, second } = renderRows();

    focusSibling(first, 1);

    expect(document.activeElement).toBe(second);
  });

  it("moves focus from outside the rows to the first row", () => {
    const { first, list } = renderRows();
    const search = document.createElement("input");

    list.append(search);
    focusSibling(search, 0);

    expect(document.activeElement).toBe(first);
  });
});
