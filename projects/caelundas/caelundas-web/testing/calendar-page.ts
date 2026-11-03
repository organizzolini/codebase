import { fireEvent, screen, within } from "@testing-library/react";

// Building a rule takes a dozen renders of the vendored builder and a reload
// of the calendar, which a slow continuous integration runner needs time for.

/**
 * The time a test that drives the filter builder may take.
 */
export const BUILDER_TEST = { timeout: 30_000 };

/**
 * The time each step of such a test may wait for the builder.
 */
export const BUILDER_WAIT = { timeout: 10_000 };

/**
 * Finds the calendar's one toolbar row.
 */
export async function findToolbar(): Promise<HTMLElement> {
  return screen.findByTestId("calendar-toolbar", {}, BUILDER_WAIT);
}

/**
 * Picks an option from whichever list the builder has open.
 */
export async function pickOption(name: RegExp | string): Promise<void> {
  fireEvent.click(await screen.findByRole("option", { name }, BUILDER_WAIT));
}

/**
 * Opens the filter builder from the toolbar and starts a new rule on the
 * field and operator named, leaving its value to the test.
 */
export async function startFilterRule(
  field: RegExp,
  operator: string,
): Promise<HTMLElement> {
  const toolbar = await findToolbar();

  fireEvent.click(
    within(toolbar).getByRole("button", { name: /^Filter(,|$)/u }),
  );

  const builder = await screen.findByRole(
    "dialog",
    { name: "Filter" },
    BUILDER_WAIT,
  );

  fireEvent.click(within(builder).getByRole("button", { name: "Add filter" }));
  await pickOption(field);
  await pickOption(operator);

  return builder;
}
