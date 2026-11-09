import { normalizeLabel } from "../examples/plain-call/normalize-label.js";

// 📤 Exports

/**
 * The `exported-function` entry-point kind. It lives in `src/` because the rule
 * keys on that literal path; see `examples/entry-points`.
 */
export const normalizeExampleLabel = (label: string): string =>
  normalizeLabel(label);
