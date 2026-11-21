// 🏷️ Types

/**
 * An event's name: its chip glyphs, English name, and details.
 */
export interface EventLabel {
  /**
   * What the database says of the event beyond its name, or nothing when it
   * says nothing or only repeats the name.
   */
  details: string | undefined;
  /**
   * The symbols and emoji of the event's name, which is all a chip shows;
   * the whole name for an event with no symbols.
   */
  glyphs: string;
  /**
   * The event's name in English, without its symbols.
   */
  name: string;
}
