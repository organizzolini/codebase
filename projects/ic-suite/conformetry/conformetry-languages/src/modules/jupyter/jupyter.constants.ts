// ♟️ Constants

import type { LanguageValidatorDescriptor } from "@conformetry/core";

/** Extensions the Jupyter validator claims. */
export const JUPYTER_VALIDATOR_FILE_EXTENSIONS = [".ipynb"];

/** Identifies the Jupyter language to the orchestrator and the `--languages` filter. */
export const JUPYTER_VALIDATOR_DESCRIPTOR: LanguageValidatorDescriptor = {
  description:
    "Checks Jupyter notebook structure, markdown cells, and code cells",
  fileExtensions: JUPYTER_VALIDATOR_FILE_EXTENSIONS,
  name: "jupyter",
};

/** Envelope keys compared: kernel, language, format version. */
export const NOTEBOOK_ENVELOPE_KEYS = [
  "metadata",
  "nbformat",
  "nbformat_minor",
];
