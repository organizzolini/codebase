import { CalendarColorMenu } from "../calendar-color-menu/calendar-color-menu";
import { CalendarViewMenu } from "../calendar-view-menu/calendar-view-menu";
import { NightSkyMenu } from "../night-sky-menu/night-sky-menu";

import type { CalendarSymbols } from "../../hooks/use-calendar-search/calendar-symbols.types";
import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { EventFacet } from "../events-calendar/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the View and Color menus show and where each sends a change; the Sky
 * menu reads and writes the link itself.
 */
export interface CalendarMenusProperties {
  className?: string;
  /**
   * Whether the views of hours merge events that run together; on when
   * absent.
   */
  clusters?: boolean;
  /**
   * What the events are colored by; the type, kind by kind, when absent.
   */
  colorBy?: EventGroupLevel | undefined;
  /**
   * Whether events are colored by type; on when absent.
   */
  colors?: boolean;
  facets?: readonly EventFacet[];
  onClustersChange?: (enabled: boolean) => void;
  onColorByChange?: (level: EventGroupLevel | undefined) => void;
  onColorsChange?: (enabled: boolean) => void;
  onSymbolsChange?: ((symbols: CalendarSymbols) => void) | undefined;
  /**
   * How symbols are drawn; icons when absent.
   */
  symbols?: CalendarSymbols | undefined;
  /**
   * What the view shown can be arranged by, which the View menu draws ahead
   * of its own sections.
   */
  viewOptions?: ReactNode;
}

// 🧩 Component

/**
 * Renders the toolbar's menus, from the left: View, Color and Sky.
 */
export function CalendarMenus(
  properties: Readonly<CalendarMenusProperties>,
): ReactNode {
  const {
    className,
    clusters = true,
    colorBy,
    colors = true,
    facets = [],
    onClustersChange = () => {},
    onColorByChange = () => {},
    onColorsChange = () => {},
    onSymbolsChange,
    symbols,
    viewOptions,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-menus"
    >
      <CalendarViewMenu
        clusters={clusters}
        onClustersChange={onClustersChange}
        onSymbolsChange={onSymbolsChange}
        symbols={symbols}
      >
        {viewOptions}
      </CalendarViewMenu>
      <CalendarColorMenu
        colorBy={colorBy}
        colors={colors}
        facets={facets}
        onColorByChange={onColorByChange}
        onColorsChange={onColorsChange}
      />
      <NightSkyMenu />
    </div>
  );
}
