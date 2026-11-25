// 🌎 Public Functions

/**
 * `left` over `right` times `scale`, or none when either is missing or `right` is 0.
 */
export function divide(
  left: null | number | undefined,
  right: null | number | undefined,
  scale: number,
): null | number {
  return left === undefined ||
    left === null ||
    right === undefined ||
    right === null ||
    right === 0
    ? null
    : (left / right) * scale;
}

/**
 * A measure, or none when absent.
 */
export function read(value: null | number | undefined): null | number {
  return value ?? null;
}
