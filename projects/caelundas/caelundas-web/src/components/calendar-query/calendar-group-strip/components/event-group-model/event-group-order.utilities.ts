import {
  NATURAL_COLLATOR,
  PATH_SEPARATOR,
} from "./event-group-order.constants";

// 🌎 Public Functions

/**
 * Orders text alphanumerically, a name at a time along a path, so a parent comes before the names beneath it and "Harmonic 2" before "Harmonic 10".
 */
export function compareNatural(left: string, right: string): number {
  const rightNames = right.split(PATH_SEPARATOR);

  for (const [index, name] of left.split(PATH_SEPARATOR).entries()) {
    const other = rightNames[index];

    if (other === undefined) {
      return 1;
    }

    const result = NATURAL_COLLATOR.compare(name, other);

    if (result !== 0) {
      return result;
    }
  }

  return left.split(PATH_SEPARATOR).length === rightNames.length ? 0 : -1;
}
