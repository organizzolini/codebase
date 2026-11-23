// 🏷️ Types

/**
 * One characteristic a meander holds, as the paragraph shows it.
 */
export interface CharacteristicPill {
  /** What the catalog says it is, for the title. */
  description: string | undefined;
  /** Whether it shows its value, which a boolean's does not. */
  isNumeric: boolean;
  key: string;
  name: string;
  value: number;
}
