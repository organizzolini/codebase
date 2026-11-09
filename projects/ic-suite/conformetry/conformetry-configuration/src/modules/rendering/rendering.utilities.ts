// 🛠️ Utilities

import { randomUUID } from "node:crypto";

import lodash from "lodash";

import {
  PLACEHOLDER_VALUE_PATTERN,
  PLACEHOLDER_VALUE_PREFIX,
} from "./rendering.constants";

/**
 * Reads what each placeholder value in `templateText` stands for in `instanceText`.
 *
 * Returns `undefined` when the instance text does not fit the template pattern.
 */
export function capturePlaceholderValues(args: {
  instanceText: string;
  templateText: string;
}): Record<string, string> | undefined {
  const values = args.templateText.match(PLACEHOLDER_VALUE_PATTERN) ?? [];

  if (values.length === 0) {
    return undefined;
  }

  // A placeholder value is letters and digits only, so escaping the whole
  // text leaves every value intact for the replacement to find.
  const pattern = lodash
    .escapeRegExp(args.templateText)
    .replaceAll(PLACEHOLDER_VALUE_PATTERN, String.raw`([\s\S]+?)`);
  const match = new RegExp(`^${pattern}$`, "u").exec(args.instanceText);

  if (match === null) {
    return undefined;
  }

  const captures: Record<string, string> = {};

  // Earlier occurrences win, so the first text a value captured is kept.
  for (const [index, value] of values.entries()) {
    captures[value] ??= match[index + 1] ?? "";
  }

  return captures;
}

/**
 * Creates a random stand-in for a placeholder nothing supplied, so validation can find the real value.
 */
export function createPlaceholderValue(): string {
  return `${PLACEHOLDER_VALUE_PREFIX}${randomUUID().replaceAll("-", "")}`;
}
