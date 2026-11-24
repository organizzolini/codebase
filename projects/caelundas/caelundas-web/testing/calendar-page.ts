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

  const branchName = new RegExp(`^${branch}(,|$)`, "u");
  const leafName = new RegExp(`^${leaf}(,|$)`, "u");
  const opened = await waitFor(() => {
    const row = screen
      .getAllByRole("treeitem")
      .find(
        (item) =>
          item.getAttribute("aria-level") === "1" &&
          branchName.test(item.getAttribute("aria-label") ?? item.textContent),
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
      .find((item) =>
        leafName.test(item.getAttribute("aria-label") ?? item.textContent),
      );

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

  const name = new RegExp(`^${label}`, "u");

  return waitFor(() => {
    const row = screen
      .getAllByRole("treeitem")
      .find(
        (item) =>
          item.getAttribute("aria-level") === "1" &&
          name.test(item.getAttribute("aria-label") ?? item.textContent),
      );

    if (row === undefined) {
      throw new Error(`No row named ${label}`);
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
 * Picks a calendar view by its label from the Display menu's Layout branch.
 */
export async function pickCalendarView(label: string): Promise<void> {
  await pickDisplayRadio("Layout", label);
}

/**
 * Ticks a choice by its label under a Display branch that offers one of several.
 */
export async function pickDisplayRadio(
  branch: string,
  label: string,
): Promise<void> {
  fireEvent.click(await findDisplayOption(branch, label));
}

/**
 * Picks a timeline scale by its label from the Display menu's Scale branch.
 */
export async function pickTimelineScale(label: string): Promise<void> {
  await pickDisplayRadio("Scale", label);
}

/**
 * What the toolbar's Display chip says is shown, such as "Week".
 */
export async function readCalendarView(): Promise<string> {
  const group = await within(await findToolbar()).findByRole("group", {
    name: "Display",
  });

  return group.textContent.replace(/^Display/u, "");
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
