// 🔖 Constants

/**
 * The surfaces of the calendar that stand over the night sky, as the
 * background each paints. The number after the slash is the share of the
 * color that is opaque: the lower it is, the more stars show through, and the
 * harder the text on it is to read. They are whole class names, and not a
 * number put into one, so Tailwind finds them in the source. This is the one
 * place to tune the balance between stars and legibility.
 */
export const SURFACE_CLASS_NAMES = {
  agendaDate: "bg-muted/35",
  agendaGroup: "bg-background/35",
  emptyCard: "bg-background/75",
  navigationTitle: "bg-background/50",
  timeGutter: "bg-background/35",
} as const;
