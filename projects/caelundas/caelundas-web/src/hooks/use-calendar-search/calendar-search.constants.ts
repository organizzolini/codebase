import { z } from "zod";

import { MAXIMUM_GROUP_DEPTH } from "../../components/calendar-group-by/event-groups.constants";
import { MAXIMUM_AGENDA_DAYS } from "../../components/events-calendar/calendar-views.constants";

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
