// 🏷️ Types

/** Generate options, keyed by camel-cased long flag names. */
export interface GenerateCommandOptions {
  config: string;
  directory?: string;
  /**
   * Optional in parsing, so a bare `generate` reaches the command. Still
   * required; the picker may supply it.
   */
  template?: string;
}
