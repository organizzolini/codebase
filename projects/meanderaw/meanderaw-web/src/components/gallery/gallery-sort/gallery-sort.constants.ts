import { ArrowDown, ArrowUp } from "lucide-react";

// ♟️ Constants

/**
 * The arrow that shows each direction.
 */
export const DIRECTION_ARROWS = { asc: ArrowUp, desc: ArrowDown } as const;

/**
 * The shape fields a sort may name, each with what it holds.
 */
export const SHAPE_SORT_FIELDS = [
  {
    description: "How many rows the meander has",
    key: "rows",
    label: "Rows",
  },
  {
    description: "How many columns the meander has",
    key: "columns",
    label: "Columns",
  },
  {
    description: "Which lattice the meander sits on",
    key: "lattice",
    label: "Lattice",
  },
  {
    description: "How many times the meander repeats",
    key: "repeats",
    label: "Repeats",
  },
  {
    description: "Whether the meander comes from the historical corpus",
    key: "isHardcoded",
    label: "Hardcoded",
  },
  { description: "The meander's code", key: "code", label: "Code" },
] as const;
