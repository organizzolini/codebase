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

import { DESKTOP_QUERY, TABLET_QUERY } from "./gallery-surface.constants";

import type { ReactElement, ReactNode } from "react";

// 🔖 Type

/**
 * The content, the title, and the trigger that opens it.
 */
export interface GallerySurfaceProperties {
  children?: ReactNode;
  className?: string;
  /** Sizes the popover, which is wide enough for a filter by default. */
  contentClassName?: string;
  /** The surface's name, which heads the drawer and the sheet. */
  title: string;
  trigger: ReactElement;
}

// 🧩 Component

/**
 * Opens its content from a trigger as a popover, drawer or bottom sheet by width.
 */
export function GallerySurface(
  properties: Readonly<GallerySurfaceProperties>,
): ReactNode {
  const { children, className, contentClassName, title, trigger } = properties;

  // 🪝 Hooks
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isTablet = useMediaQuery(TABLET_QUERY);

  // 🏗 Setup
  let surface: ReactNode;

  if (isDesktop) {
    surface = (
      <Popover>
        <PopoverTrigger render={trigger} />
        <PopoverContent
          align="start"
          aria-label={title}
          className={`max-h-[80dvh] max-w-[95vw] gap-3 overflow-y-auto p-3 ${contentClassName ?? "w-[42rem]"}`}
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
            <DrawerTitle>{title}</DrawerTitle>
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
            <SheetTitle>{title}</SheetTitle>
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
      data-slot="gallery-surface"
      data-testid="gallery-surface"
      style={{ display: "contents" }}
    >
      {surface}
    </div>
  );
}
