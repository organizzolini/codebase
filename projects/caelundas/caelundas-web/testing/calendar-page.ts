import { fireEvent, screen, waitFor, within } from "@testing-library/react";

// Building a rule takes a dozen renders of the vendored builder and a reload
// of the calendar, which a slow continuous integration runner needs time for.

/**
 * The time a test that drives the filter builder may take.
 */
export const BUILDER_TEST = { timeout: 30_000 };

/**
 * Time each step of a builder test may wait.
 */
export const BUILDER_WAIT = { timeout: 10_000 };

/**
 * Finds a leaf of the Display menu under a branch, opening the menu and expanding the branch as needed.
 */
export async function findDisplayOption(
  branch: string,
  leaf: string,
): Promise<HTMLElement> {
  await openDisplayMenu();

  const opened = await waitFor(() => {
    const row = screen
      .getAllByRole("treeitem")
      .find(
        (item) =>
          item.getAttribute("aria-level") === "1" &&
          getRowName(item) === branch,
      );

    if (row === undefined) {
      throw new Error(`No branch named ${branch}`);
    }

    return row;
  }, BUILDER_WAIT);

  if (opened.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(opened);
  }

  return waitFor(() => {
    const items = screen.getAllByRole("treeitem");
    const found = items
      .slice(items.indexOf(opened) + 1)
      .find((item) => item.getAttribute("aria-level") === "2");
    const match = items
      .slice(items.indexOf(opened) + 1)
      .filter((item) => item.getAttribute("aria-level") !== "1")
      .find((item) => getRowName(item) === leaf);

    if (found === undefined || match === undefined) {
      throw new Error(`No option named ${leaf} under ${branch}`);
    }

    return match;
  }, BUILDER_WAIT);
}

/**
 * Finds a top-level row of the Display menu, such as a switch, opening the menu as needed.
 */
export async function findDisplayRow(label: string): Promise<HTMLElement> {
  await openDisplayMenu();

  return waitFor(() => {
    const row = screen
      .getAllByRole("treeitem")
      .find(
        (item) =>
          item.getAttribute("aria-level") === "1" && getRowName(item) === label,
      );

    if (row === undefined) {
      throw new Error(`No row named ${label}`);
    }

    return row;
  }, BUILDER_WAIT);
}

/**
 * Finds a Layout menu row, a layout or a shown timeline's scale, by its label, opening the menu as needed.
 */
export async function findLayoutOption(label: string): Promise<HTMLElement> {
  if (screen.queryByLabelText("Layout options") === null) {
    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: "Layout" }),
    );
  }

  return waitFor(() => {
    const row = screen
      .getAllByRole("treeitem")
      .find((item) => getRowName(item) === label);

    if (row === undefined) {
      throw new Error(`No layout option named ${label}`);
    }

    return row;
  }, BUILDER_WAIT);
}

/**
 * Finds the calendar's one toolbar row.
 */
export async function findToolbar(): Promise<HTMLElement> {
  return screen.findByTestId("calendar-toolbar", {}, BUILDER_WAIT);
}

/**
 * Picks a calendar view by its label from the Layout menu.
 */
export async function pickCalendarView(label: string): Promise<void> {
  fireEvent.click(await findLayoutOption(label));
}

/**
 * Picks a timeline scale by its label from beneath the Timeline layout in the Layout menu, expanding that layout as needed.
 */
export async function pickTimelineScale(label: string): Promise<void> {
  const timeline = await findLayoutOption("Timeline");

  if (timeline.getAttribute("aria-expanded") !== "true") {
    const expander = timeline.querySelector(
      '[data-slot="cascader-item-expander"]',
    );

    if (expander !== null) {
      fireEvent.click(expander);
    }
  }

  const scale = await waitFor(() => {
    const items = screen.getAllByRole("treeitem");
    const match = items
      .slice(items.indexOf(timeline) + 1)
      .find(
        (item) =>
          item.getAttribute("aria-level") === "2" && getRowName(item) === label,
      );

    if (match === undefined) {
      throw new Error(`No timeline scale named ${label}`);
    }

    return match;
  }, BUILDER_WAIT);

  fireEvent.click(scale);
}

/**
 * What the toolbar's Layout chip says is shown, such as "Week".
 */
export async function readCalendarView(): Promise<string> {
  const group = await within(await findToolbar()).findByRole("group", {
    name: "Layout",
  });

  return group.textContent.replace(/^Layout/u, "");
}

/**
 * A menu row's own name: its text without the description, details and count beside it.
 */
function getRowName(row: Element): string {
  const clone = row.cloneNode(true);

  if (!(clone instanceof Element)) {
    return row.textContent.trim();
  }

  for (const extra of clone.querySelectorAll(
    '[data-slot="cascader-item-description"], [data-slot="cascader-item-details"], [data-slot="cascader-item-count"]',
  )) {
    extra.remove();
  }

  return clone.textContent.trim();
}

/**
 * Opens the toolbar's Display menu unless it is open already.
 */
async function openDisplayMenu(): Promise<void> {
  if (screen.queryByTestId("query-cascader") === null) {
    fireEvent.click(
      within(await findToolbar()).getByRole("button", { name: "Display" }),
    );
  }

  await screen.findByTestId("query-cascader", {}, BUILDER_WAIT);
}
