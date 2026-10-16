// 🏷️ Types

/** A formula to install, and the command that shows it is there. */
export interface InfrastructureTool {
  /** The tap path or formula name, when it is not the command. */
  formula?: string;
  /** The command whose presence means the tool is installed. */
  name: string;
}
