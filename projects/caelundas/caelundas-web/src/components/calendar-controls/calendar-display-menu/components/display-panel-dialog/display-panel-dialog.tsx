import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@codebase/presentation";

import { CalendarColorMenu } from "../../../../calendar-appearance/calendar-color-menu/calendar-color-menu";
import { NightSkyMenu } from "../../../../calendar-appearance/night-sky-menu/night-sky-menu";

import type { EventFacet } from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupLevel } from "../../../../calendar-query/calendar-group-by/components/event-group-model/event-groups.types";
import type { DisplayPanel } from "../../calendar-display-menu.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The panel open, what Color needs, and the handler that closes it.
 */
export interface DisplayPanelDialogProperties {
  colorBy: EventGroupLevel | undefined;
  colors: boolean;
  facets: readonly EventFacet[];
  onClose: () => void;
  onColorByChange: (level: EventGroupLevel | undefined) => void;
  onColorsChange: (enabled: boolean) => void;
  panel: DisplayPanel | undefined;
}

// 🧩 Component

/**
 * Renders the Color or Sky settings in a dialog over the page, shut while no panel is open.
 */
export function DisplayPanelDialog(
  properties: Readonly<DisplayPanelDialogProperties>,
): ReactNode {
  const {
    colorBy,
    colors,
    facets,
    onClose,
    onColorByChange,
    onColorsChange,
    panel,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Dialog
      onOpenChange={() => {
        onClose();
      }}
      open={panel !== undefined}
    >
      <DialogContent className="max-h-[90dvh] max-w-[95vw] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {panel === "sky" ? "Sky settings" : "Color settings"}
          </DialogTitle>
        </DialogHeader>
        {panel === "sky" ? (
          <NightSkyMenu />
        ) : (
          <CalendarColorMenu
            colorBy={colorBy}
            colors={colors}
            facets={facets}
            onColorByChange={onColorByChange}
            onColorsChange={onColorsChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
