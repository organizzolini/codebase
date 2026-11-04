import { ChevronDown, ChevronRight } from "lucide-react";
import { useId, useState } from "react";

import { Checkbox } from "@codebase/presentation";

import {
  FOLDER_CHECKBOX_CLASS_NAME,
  TREE_ROW_CLASS_NAME,
} from "./night-sky-menu.constants";
import { readFolderState } from "./night-sky-menu.utilities";

import type { ConstellationListing } from "../../hooks/use-night-sky/night-sky.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A folder's name, the constellations in it, which show, and where to send
 * the names a check toggles.
 */
export interface NightSkyConstellationFolderProperties {
  className?: string;
  constellations: readonly ConstellationListing[];
  /** Opens the folder at first. Defaults to false. */
  defaultOpen?: boolean;
  label: string;
  onToggle: (names: readonly string[]) => void;
  shown: ReadonlySet<string>;
}

// 🧩 Component

/**
 * Renders one folder of the constellation picker, the way a file tree draws
 * one: a chevron that opens it, a checkbox that is checked when all its
 * constellations show, dashed when some do, and toggles them all, and its
 * constellations indented beneath it, each with a checkbox of its own.
 */
export function NightSkyConstellationFolder(
  properties: Readonly<NightSkyConstellationFolderProperties>,
): ReactNode {
  const {
    className,
    constellations,
    defaultOpen = false,
    label,
    onToggle,
    shown,
  } = properties;

  // 🪝 Hooks
  const [open, setOpen] = useState(defaultOpen);
  const listId = useId();

  // 🏗 Setup
  const names = constellations.map((constellation) => constellation.name);
  const state = readFolderState(shown, names);
  const count = names.filter((name) => shown.has(name)).length;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-constellation-folder"
    >
      <div className="flex items-center gap-1">
        <button
          aria-controls={listId}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
          className="text-muted-foreground hover:bg-muted flex size-6 shrink-0 items-center justify-center rounded-sm"
          onClick={() => {
            setOpen(!open);
          }}
          type="button"
        >
          {open ? (
            <ChevronDown
              aria-hidden="true"
              className="size-4"
            />
          ) : (
            <ChevronRight
              aria-hidden="true"
              className="size-4"
            />
          )}
        </button>
        <label className={`${TREE_ROW_CLASS_NAME} grow font-medium`}>
          <Checkbox
            checked={state === "checked"}
            className={FOLDER_CHECKBOX_CLASS_NAME}
            indeterminate={state === "partial"}
            onCheckedChange={() => {
              onToggle(names);
            }}
          />
          {label}
          <span
            aria-hidden="true"
            className="text-muted-foreground ml-auto tabular-nums"
          >
            {count}/{names.length}
          </span>
        </label>
      </div>
      {open ? (
        <ul
          className="flex flex-col pl-7"
          id={listId}
        >
          {constellations.map((constellation) => (
            <li key={constellation.name}>
              <label className={TREE_ROW_CLASS_NAME}>
                <Checkbox
                  checked={shown.has(constellation.name)}
                  onCheckedChange={() => {
                    onToggle([constellation.name]);
                  }}
                />
                {constellation.name}
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
