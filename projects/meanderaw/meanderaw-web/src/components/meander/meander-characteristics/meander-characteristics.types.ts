// 🏷️ Types

/**
 * A labelled run of pills: one catalog category, or the patterns.
 */
export interface CharacteristicGroup {
  label: string;
  pills: CharacteristicPill[];
}

/**
 * One characteristic a meander holds, as a pill shows it.
 */
export interface CharacteristicPill {
  /** What the catalog says it is, for the pill's title. */
  description: string | undefined;
  /** Whether the pill shows its value, which a boolean's does not. */
  isNumeric: boolean;
  key: string;
  name: string;
  value: number;
}
