import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  useMediaQuery,
} from "@codebase/presentation";

import { TITLE } from "./calendar-filters.constants";

import type { ReactElement, ReactNode } from "react";

// 🔖 Type

/**
 * The builder to open, the button that opens it, and whether the screen is
 * a tablet's.
 */
export interface FilterSurfaceProperties {
  children?: ReactNode;
  className?: string;
  isTablet: boolean;
  trigger: ReactElement;
}

// 🧩 Component

/**
 * Opens the builder over the calendar from its trigger: a popover from 1024
 * pixels wide, a drawer from the side from 768, and a bottom sheet below
 * that, so it never keeps any of the calendar's space. Its root lays out as
 * its trigger alone and carries a `data-slot`, so a button group around it
 * still joins the trigger to the button after it.
 */
export function FilterSurface(
  properties: Readonly<FilterSurfaceProperties>,
): ReactNode {
  const { children, className, isTablet, trigger } = properties;

  // 🪝 Hooks
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // 🏗 Setup
  let surface: ReactNode;

  if (isDesktop) {
    surface = (
      <Popover>
        <PopoverTrigger render={trigger} />
        <PopoverContent
          align="start"
          aria-label={TITLE}
          className="max-h-[80dvh] w-[42rem] max-w-[95vw] gap-3 overflow-y-auto p-3"
          sideOffset={8}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  } else if (isTablet) {
    surface = (
      <Drawer swipeDirection="right">
        <DrawerTrigger render={trigger} />
        <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:36rem]">
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-3 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  } else {
    surface = (
      <Sheet>
        <SheetTrigger render={trigger} />
        <SheetContent
          className="max-h-[85dvh]"
          side="bottom"
        >
          <SheetHeader>
            <SheetTitle>{TITLE}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 overflow-y-auto px-3 pb-4">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-slot="filter-surface"
      data-testid="filter-surface"
      style={{ display: "contents" }}
    >
      {surface}
    </div>
  );
}
