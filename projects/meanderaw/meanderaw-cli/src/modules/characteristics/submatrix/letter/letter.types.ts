import type {
  LetterCharacteristicKey,
  SubmatrixWindow,
} from "../../characteristics.types";
import type { LETTER_SCRIPTS } from "./letter.constants";

// 🏷️ Types

/**
 * The corner a glyph's strokes run toward: the reading direction for a
 * script's base orientation, and a flip of it for each other corner.
 */
export type LetterCorner =
  | "Northeast"
  | "Northwest"
  | "Southeast"
  | "Southwest";

/**
 * What a letter service supplies to build its sixteen evaluators: its base `template`,
 * `glyph`, upright `shape`, `key`s, and `aliases`.
 */
export interface LetterDefinition {
  readonly aliases?: Readonly<Partial<Record<LetterOrientationName, string>>>;
  readonly glyph: string;
  readonly key: (name: LetterOrientationName) => LetterCharacteristicKey;
  readonly script: LetterScript;
  readonly shape: string;
  readonly template: readonly string[];
}

/**
 * A mirroring that draws a glyph at another corner than its script's base
 * corner, worded as an orientation's description says it.
 */
export type LetterFlip = "east to west" | "north to south";

/**
 * One of a letter's sixteen orientations: its corner, flips and clockwise rotation that draw it, the template drawn that way, and its window.
 */
export interface LetterOrientation {
  readonly corner: LetterCorner;
  readonly flips: readonly LetterFlip[];
  readonly name: LetterOrientationName;
  readonly rotation: LetterRotation;
  readonly template: readonly string[];
  readonly window: SubmatrixWindow;
}

/**
 * The key fragment naming an orientation: its corner, then its rotation word,
 * with no word for an unturned glyph.
 */
export type LetterOrientationName = `${LetterCorner}${"" | LetterTurn}`;

/** A clockwise rotation of a glyph, `None` leaving it unturned. */
export type LetterRotation = "None" | LetterTurn;

/** A script whose letters are drawn as glyph templates: see {@link LETTER_SCRIPTS}. */
export type LetterScript = keyof typeof LETTER_SCRIPTS;

/** A clockwise turn of a glyph by a quarter, a half, or three quarters. */
export type LetterTurn = "Half" | "Quarter" | "ThreeQuarter";
