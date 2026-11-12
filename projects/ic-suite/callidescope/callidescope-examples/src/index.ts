import { normalizeLabel } from "../examples/plain-call/normalize-label.js";

// 📤 Exports

/** `exported-function` entry kind; the rule keys on `src/`. */
export const normalizeExampleLabel = (label: string): string =>
  normalizeLabel(label);
