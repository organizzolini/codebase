import { z } from "zod";

import { MAXIMUM_AGENDA_DAYS } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { MAXIMUM_GROUP_DEPTH } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.constants";

export const calendarDateSchema = z.iso.date();

// The agenda lists up to a year at a time, so a link can never ask for the
// whole dataset at once.
export const agendaDaysSchema = z
  .number()
  .int()
  .min(1)
  .max(MAXIMUM_AGENDA_DAYS);

export const levelsSchema = z.array(z.unknown());

// A depth out of range is forgotten rather than the level dropped: the
// level's depth is brought within its root's tree once the tree is read.
const groupDepthSchema = z.number().int().min(1).max(MAXIMUM_GROUP_DEPTH);

export const groupLevelSchema = z.object({
  depth: z
    .unknown()
    .transform((depth) => groupDepthSchema.safeParse(depth).data)
    .optional(),
  field: z.string().min(1),
  // The tag whose children the level groups by; anything but an id is
  // forgotten, which groups by the root's own.
  parent: z
    .unknown()
    .transform((parent) => z.string().min(1).safeParse(parent).data)
    .optional(),
  // Anything but a list of ids is forgotten, like a depth out of range.
  tags: z
    .unknown()
    .transform((tags) => z.array(z.string()).safeParse(tags).data)
    .optional(),
});

const filterValueSchema = z.union([
  z.array(z.union([z.null(), z.number(), z.string()])),
  z.null(),
  z.number(),
  z.string(),
]);

const filterRuleSchema = z.object({
  id: z.string(),
  negated: z.boolean().optional(),
  operator: z.string(),
  path: z.array(z.string()),
  type: z.literal("rule"),
  value: filterValueSchema.optional(),
});

export const filterGroupSchema = z.object({
  combinator: z.enum(["and", "or"]),
  id: z.string(),
  get rules() {
    return z.array(z.union([filterRuleSchema, filterGroupSchema]));
  },
  type: z.literal("group"),
});

export const skySearchValueSchema = z.union([
  z.boolean(),
  z.number(),
  z.string(),
]);

export const groupSortSchema = z.object({
  direction: z.enum(["asc", "desc"]),
  key: z.enum(["count", "first", "name", "order", "tag"]),
  // The tag a `tag` sort ranks by; anything but an id is forgotten.
  tag: z
    .unknown()
    .transform((tag) => z.string().min(1).safeParse(tag).data)
    .optional(),
});

export const groupSortsSchema = z.array(groupSortSchema);

export const columnsSchema = z.array(z.string().min(1));
