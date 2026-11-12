import type {
  LetterCharacteristicKey,
  SubmatrixWindow,
} from "../../characteristics.types";
import type { LETTER_SCRIPTS } from "./letter.constants";

// 🏷️ Types

/** Corner a glyph's strokes run toward, flipped for other corners. */
export type LetterCorner =
  | "Northeast"
  | "Northwest"
  | "Southeast"
  | "Southwest";

/** Inputs a letter service supplies for its sixteen evaluators. */
export interface LetterDefinition {
  readonly aliases?: Readonly<Partial<Record<LetterOrientationName, string>>>;
  readonly glyph: string;
  readonly key: (name: LetterOrientationName) => LetterCharacteristicKey;
  readonly script: LetterScript;
  readonly shape: string;
  readonly template: readonly string[];
}

/** Flip drawing a glyph at a non-base corner. */
export type LetterFlip = "east to west" | "north to south";

/** One of sixteen orientations: corner, flips, rotation, template, window. */
export interface LetterOrientation {
  readonly corner: LetterCorner;
  readonly flips: readonly LetterFlip[];
  readonly name: LetterOrientationName;
  readonly rotation: LetterRotation;
  readonly template: readonly string[];
  readonly window: SubmatrixWindow;
}

/** Key fragment: corner, then rotation word; none if unturned. */
export type LetterOrientationName = `${LetterCorner}${"" | LetterTurn}`;

/** A clockwise rotation of a glyph, `None` leaving it unturned. */
export type LetterRotation = "None" | LetterTurn;

/** A script whose letters are drawn as glyph templates: see {@link LETTER_SCRIPTS}. */
export type LetterScript = keyof typeof LETTER_SCRIPTS;

/** Clockwise turn: a quarter, a half, or three quarters. */
export type LetterTurn = "Half" | "Quarter" | "ThreeQuarter";
