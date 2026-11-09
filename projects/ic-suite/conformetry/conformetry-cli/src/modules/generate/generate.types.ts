// 🏷️ Types

/**
 * Options for the generate command. Keys are camel-cased long flag names, as commander reports them.
 */
export interface GenerateCommandOptions {
  config: string;
  directory?: string;
  /**
   * Optional in parsing, so a bare `generate` reaches the command. Still
   * required; the picker may supply it.
   */
  template?: string;
}
