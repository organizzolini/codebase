// 🏷️ Types

/**
 * What an event is called, in the two forms the calendar uses: the glyphs
 * its chip shows, and the English name and description its tooltip says.
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
