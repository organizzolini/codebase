# 🎨 Lexico Components

**Shared React component library built on shadcn/ui and Base UI primitives.**

A collection of accessible, customizable UI components for the codebase, providing a consistent design system across applications. Built with Tailwind CSS, TypeScript, and shadcn/ui (New York style).

The interface half of the [Lexico](../lexico/lexico-web/README.md) suite:

| Project | Role |
| ------- | ---- |
| 🐺 [lexico-web](../lexico/lexico-web/README.md) | The SSR web application |
| 🎨 [components-web](README.md) | This package — shared React components |
| 📖 [lexico-entities](../lexico/lexico-entities/README.md) | TypeORM entities and migrations |
| 🚰 [lexico-cli](../lexico/lexico-cli/README.md) | Dictionary and literature ingestion |

## Features

- **50+ UI Components**: Buttons, cards, forms, dialogs, navigation, feedback, and more
- **Accessible**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support
- **Themeable**: CSS variables for light/dark mode, customizable colors
- **Type-Safe**: Full TypeScript support with strict mode
- **Tree-Shakeable**: Only bundle components you actually use
- **Base UI Primitives**: Built on high-quality, unstyled component primitives

## Quick Start

### Installation

This package is already available in the codebase via workspace protocol. Import from consuming applications:

```tsx
// In projects/lexico/lexico-web/src/routes/example.tsx
import { Button, Card, Input } from "@codebase/components-web";
import "@codebase/components-web/styles/globals.css"; // Import once in root layout

function ExamplePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Import Styles

Add global CSS import to your root layout:

```tsx
// projects/lexico/lexico-web/src/routes/__root.tsx
import "@codebase/components-web/styles/globals.css";
```

## Component Categories

### Layout & Structure

- **Card**: Content containers with header, content, footer sections
- **Separator**: Divider lines for visual separation
- **Accordion**: Collapsible content sections
- **Tabs**: Tabbed navigation and content
- **Sidebar**: Navigation sidebar with collapsible sections
- **Resizable**: Resizable panel layouts

### Form Controls

- **Input**: Text input field
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection menu
- **Checkbox**: Boolean selection control
- **Radio Group**: Single selection from multiple options
- **Switch**: Toggle control for binary states
- **Slider**: Range selection control
- **Label**: Form field labels with accessibility

### Buttons & Navigation

- **Button**: Primary action buttons with variants
- **Button Group**: Grouped button controls
- **Navigation Menu**: Multi-level navigation menus
- **Breadcrumb**: Hierarchical path display
- **Dropdown Menu**: Context menus with actions
- **Command**: Cmd+K style command palette

### Feedback & Status

- **Badge**: Status indicators and labels
- **Spinner**: Loading indicator
- **Skeleton**: Loading placeholder animation
- **Progress**: Progress bar indicator
- **Alert**: Informational messages
- **Toast (Sonner)**: Temporary notification messages

### Overlays & Dialogs

- **Dialog**: Modal dialogs
- **Sheet**: Slide-over panels
- **Drawer**: Mobile-friendly bottom sheets
- **Popover**: Floating content containers
- **Tooltip**: Hover hints and descriptions
- **Hover Card**: Rich hover previews

## Adding Components

### Add from shadcn Registry

```bash
# Navigate to package directory
cd projects/components-web

# Add component
pnpx shadcn@latest add <component-name>

# Examples
pnpx shadcn@latest add dropdown-menu
pnpx shadcn@latest add command
pnpx shadcn@latest add sonner
```

### Export in Index

After adding a component, export it in [src/index.ts](src/index.ts):

```typescript
export * from "./components/ui/dropdown-menu";
```

### Create Custom Components

For project-specific components, create in `src/components/` (not `ui/`):

```tsx
// src/components/word-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface WordCardProps {
  word: string;
  definition: string;
}

export function WordCard({ word, definition }: WordCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{word}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{definition}</p>
      </CardContent>
    </Card>
  );
}
```

**⚠️ Important**: Never modify files in `src/components/ui/` directly - they are managed by shadcn CLI and will be overwritten on updates.

## Theming

### CSS Variables

Customize colors by editing [src/styles/globals.css](src/styles/globals.css):

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... more colors */
}

[data-theme="dark"] {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode colors */
}
```

### Using Theme Colors

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Button
  </button>
</div>
```

### Dark Mode

Set `data-theme` attribute on root element:

```tsx
document.documentElement.setAttribute("data-theme", "dark");
```

Or use next-themes for automatic theme switching:

```tsx
import { ThemeProvider } from "next-themes";

<ThemeProvider
  attribute="data-theme"
  defaultTheme="system"
>
  {children}
</ThemeProvider>;
```

## Development

### Build Library

```bash
nx run components-web:build
```

### Type Checking

```bash
nx run components-web:typecheck
```

### Type Coverage

```bash
nx run components-web:type-coverage
# Target: 99.84%
```

### Bundle Size Analysis

```bash
nx run components-web:codometer
# Limit: 512 KB gzipped, warning at 384 KB
```

The 512 KB limit is a ratchet against the measured size, not a design target — the Vite library build bundles React and Base UI into the output rather than externalizing them, even though React is a `peerDependency`. See `codometer.config.ts` for the full note.

## Usage Examples

### Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Form with Validation

```tsx
import { Input, Label, Button } from "@codebase/components-web";

function LoginForm() {
  return (
    <form>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
        />
      </div>
      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from "@codebase/components-web";

function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <p>This action cannot be undone.</p>
        <Button>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
}
```

### Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from "@codebase/components-web";

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Configuration

### shadcn Config ([components.json](components.json))

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "gray",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### Tailwind Config ([tailwind.config.cjs](tailwind.config.cjs))

Extends shared Tailwind configuration with component-specific patterns:

```js
content: [
  "./src/**/*.{ts,tsx}",
  "../components-web/src/**/*.{ts,tsx}",
];
```

## Accessibility

All components follow WCAG 2.1 Level AA standards:

- ✅ Keyboard navigation (Tab, Enter, Space, Arrow keys)
- ✅ Focus management (visible focus indicators)
- ✅ ARIA attributes (screen reader announcements)
- ✅ Color contrast (4.5:1 for text, 3:1 for UI)

Built on Base UI primitives which handle complex accessibility patterns automatically:

- Focus trapping in dialogs
- Roving focus in menus
- Screen reader announcements
- Keyboard shortcuts

## Troubleshooting

### Styles Not Applied

Import global CSS in your root layout:

```tsx
import "@codebase/components-web/styles/globals.css";
```

### Import Errors

Verify TypeScript path mapping in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@codebase/components-web": [
        "../components-web/src/index.ts"
      ]
    }
  }
}
```

### Dark Mode Not Working

Set `data-theme` attribute on `<html>` or use ThemeProvider.

## Documentation

For detailed architecture, component patterns, and development workflows:

- **[AGENTS.md](AGENTS.md)**: Complete architectural documentation
- **[Main AGENTS.md](../../AGENTS.md)**: Codebase architecture and Nx workflows
- **[lexico-web](../lexico/lexico-web/README.md)**: The application these components build

External resources:

- [shadcn/ui Documentation](https://ui.shadcn.com/docs): Component reference and CLI
- [Base UI Documentation](https://base-ui.com/react/overview/quick-start): Primitive APIs
- [Tailwind CSS Documentation](https://tailwindcss.com/docs): Utility classes

## License

See [LICENSE](../../LICENSE) for licensing information.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/components-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 1 |
| Files | 6 |
| Calls traced | 0 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 3 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

None.

### Breadth

None.
<!-- callidescope:end -->

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  components_web["components-web"]
  lexico_web["lexico-web"]
  lexico_web --> components_web
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class components_web subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### File Imports

<!-- codependix:start name="codependix-file-imports" -->
```mermaid
graph LR
  file_callidescope_config_ts["callidescope.config.ts"]
  file_codependix_config_ts["codependix.config.ts"]
  file_codometer_config_ts["codometer.config.ts"]
  file_eslint_config_ts["eslint.config.ts"]
  file_src_components_examples_c_sidebar_1_tsx["src/components/examples/c-sidebar-1.tsx"]
  file_src_components_reui_alert_tsx["src/components/reui/alert.tsx"]
  file_src_components_reui_autocomplete_tsx["src/components/reui/autocomplete.tsx"]
  file_src_components_reui_badge_tsx["src/components/reui/badge.tsx"]
  file_src_components_reui_cascader_cascader_async_tsx["src/components/reui/cascader/cascader-async.tsx"]
  file_src_components_reui_cascader_cascader_columns_tsx["src/components/reui/cascader/cascader-columns.tsx"]
  file_src_components_reui_cascader_cascader_context_tsx["src/components/reui/cascader/cascader-context.tsx"]
  file_src_components_reui_cascader_cascader_footer_tsx["src/components/reui/cascader/cascader-footer.tsx"]
  file_src_components_reui_cascader_cascader_i18n_tsx["src/components/reui/cascader/cascader-i18n.tsx"]
  file_src_components_reui_cascader_cascader_item_tsx["src/components/reui/cascader/cascader-item.tsx"]
  file_src_components_reui_cascader_cascader_lib_tsx["src/components/reui/cascader/cascader-lib.tsx"]
  file_src_components_reui_cascader_cascader_nav_tsx["src/components/reui/cascader/cascader-nav.tsx"]
  file_src_components_reui_cascader_cascader_types_tsx["src/components/reui/cascader/cascader-types.tsx"]
  file_src_components_reui_cascader_cascader_virtual_tsx["src/components/reui/cascader/cascader-virtual.tsx"]
  file_src_components_reui_cascader_cascader_tsx["src/components/reui/cascader/cascader.tsx"]
  file_src_components_reui_code_block_code_block_highlight_tsx["src/components/reui/code-block/code-block-highlight.tsx"]
  file_src_components_reui_code_block_code_block_tsx["src/components/reui/code-block/code-block.tsx"]
  file_src_components_reui_color_picker_tsx["src/components/reui/color-picker.tsx"]
  file_src_components_reui_data_grid_data_grid_cell_selection_tsx["src/components/reui/data-grid/data-grid-cell-selection.tsx"]
  file_src_components_reui_data_grid_data_grid_column_filter_tsx["src/components/reui/data-grid/data-grid-column-filter.tsx"]
  file_src_components_reui_data_grid_data_grid_column_header_tsx["src/components/reui/data-grid/data-grid-column-header.tsx"]
  file_src_components_reui_data_grid_data_grid_column_visibility_tsx["src/components/reui/data-grid/data-grid-column-visibility.tsx"]
  file_src_components_reui_data_grid_data_grid_i18n_tsx["src/components/reui/data-grid/data-grid-i18n.tsx"]
  file_src_components_reui_data_grid_data_grid_pagination_tsx["src/components/reui/data-grid/data-grid-pagination.tsx"]
  file_src_components_reui_data_grid_data_grid_scroll_area_tsx["src/components/reui/data-grid/data-grid-scroll-area.tsx"]
  file_src_components_reui_data_grid_data_grid_table_dnd_rows_tsx["src/components/reui/data-grid/data-grid-table-dnd-rows.tsx"]
  file_src_components_reui_data_grid_data_grid_table_dnd_tsx["src/components/reui/data-grid/data-grid-table-dnd.tsx"]
  file_src_components_reui_data_grid_data_grid_table_virtual_tsx["src/components/reui/data-grid/data-grid-table-virtual.tsx"]
  file_src_components_reui_data_grid_data_grid_table_tsx["src/components/reui/data-grid/data-grid-table.tsx"]
  file_src_components_reui_data_grid_data_grid_tsx["src/components/reui/data-grid/data-grid.tsx"]
  file_src_components_reui_date_selector_tsx["src/components/reui/date-selector.tsx"]
  file_src_components_reui_emoji_picker_tsx["src/components/reui/emoji-picker.tsx"]
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx["src/components/reui/event-calendar/event-calendar-agenda-view.tsx"]
  file_src_components_reui_event_calendar_event_calendar_content_tsx["src/components/reui/event-calendar/event-calendar-content.tsx"]
  file_src_components_reui_event_calendar_event_calendar_dnd_tsx["src/components/reui/event-calendar/event-calendar-dnd.tsx"]
  file_src_components_reui_event_calendar_event_calendar_event_tsx["src/components/reui/event-calendar/event-calendar-event.tsx"]
  file_src_components_reui_event_calendar_event_calendar_i18n_tsx["src/components/reui/event-calendar/event-calendar-i18n.tsx"]
  file_src_components_reui_event_calendar_event_calendar_lib_tsx["src/components/reui/event-calendar/event-calendar-lib.tsx"]
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx["src/components/reui/event-calendar/event-calendar-month-view.tsx"]
  file_src_components_reui_event_calendar_event_calendar_nav_tsx["src/components/reui/event-calendar/event-calendar-nav.tsx"]
  file_src_components_reui_event_calendar_event_calendar_recurrence_tsx["src/components/reui/event-calendar/event-calendar-recurrence.tsx"]
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx["src/components/reui/event-calendar/event-calendar-resource-view.tsx"]
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx["src/components/reui/event-calendar/event-calendar-time-grid.tsx"]
  file_src_components_reui_event_calendar_event_calendar_types_tsx["src/components/reui/event-calendar/event-calendar-types.tsx"]
  file_src_components_reui_event_calendar_event_calendar_tsx["src/components/reui/event-calendar/event-calendar.tsx"]
  file_src_components_reui_file_type_tsx["src/components/reui/file-type.tsx"]
  file_src_components_reui_filters_filters_advanced_tsx["src/components/reui/filters/filters-advanced.tsx"]
  file_src_components_reui_filters_filters_builder_tsx["src/components/reui/filters/filters-builder.tsx"]
  file_src_components_reui_filters_filters_chip_tsx["src/components/reui/filters/filters-chip.tsx"]
  file_src_components_reui_filters_filters_context_tsx["src/components/reui/filters/filters-context.tsx"]
  file_src_components_reui_filters_filters_date_tsx["src/components/reui/filters/filters-date.tsx"]
  file_src_components_reui_filters_filters_dnd_tsx["src/components/reui/filters/filters-dnd.tsx"]
  file_src_components_reui_filters_filters_draft_tsx["src/components/reui/filters/filters-draft.tsx"]
  file_src_components_reui_filters_filters_editors_tsx["src/components/reui/filters/filters-editors.tsx"]
  file_src_components_reui_filters_filters_i18n_tsx["src/components/reui/filters/filters-i18n.tsx"]
  file_src_components_reui_filters_filters_lib_tsx["src/components/reui/filters/filters-lib.tsx"]
  file_src_components_reui_filters_filters_operators_tsx["src/components/reui/filters/filters-operators.tsx"]
  file_src_components_reui_filters_filters_query_tsx["src/components/reui/filters/filters-query.tsx"]
  file_src_components_reui_filters_filters_types_tsx["src/components/reui/filters/filters-types.tsx"]
  file_src_components_reui_filters_filters_tsx["src/components/reui/filters/filters.tsx"]
  file_src_components_reui_frame_tsx["src/components/reui/frame.tsx"]
  file_src_components_reui_gantt_gantt_bar_tsx["src/components/reui/gantt/gantt-bar.tsx"]
  file_src_components_reui_gantt_gantt_dnd_tsx["src/components/reui/gantt/gantt-dnd.tsx"]
  file_src_components_reui_gantt_gantt_i18n_tsx["src/components/reui/gantt/gantt-i18n.tsx"]
  file_src_components_reui_gantt_gantt_lib_tsx["src/components/reui/gantt/gantt-lib.tsx"]
  file_src_components_reui_gantt_gantt_nav_tsx["src/components/reui/gantt/gantt-nav.tsx"]
  file_src_components_reui_gantt_gantt_recurrence_tsx["src/components/reui/gantt/gantt-recurrence.tsx"]
  file_src_components_reui_gantt_gantt_types_tsx["src/components/reui/gantt/gantt-types.tsx"]
  file_src_components_reui_gantt_gantt_view_tsx["src/components/reui/gantt/gantt-view.tsx"]
  file_src_components_reui_gantt_gantt_tsx["src/components/reui/gantt/gantt.tsx"]
  file_src_components_reui_icon_stack_tsx["src/components/reui/icon-stack.tsx"]
  file_src_components_reui_icon_tile_tsx["src/components/reui/icon-tile.tsx"]
  file_src_components_reui_kanban_tsx["src/components/reui/kanban.tsx"]
  file_src_components_reui_number_field_tsx["src/components/reui/number-field.tsx"]
  file_src_components_reui_phone_input_tsx["src/components/reui/phone-input.tsx"]
  file_src_components_reui_rating_tsx["src/components/reui/rating.tsx"]
  file_src_components_reui_scrollspy_tsx["src/components/reui/scrollspy.tsx"]
  file_src_components_reui_signature_pad_tsx["src/components/reui/signature-pad.tsx"]
  file_src_components_reui_sortable_tsx["src/components/reui/sortable.tsx"]
  file_src_components_reui_stepper_tsx["src/components/reui/stepper.tsx"]
  file_src_components_reui_time_picker_tsx["src/components/reui/time-picker.tsx"]
  file_src_components_reui_timeline_tsx["src/components/reui/timeline.tsx"]
  file_src_components_reui_tree_tsx["src/components/reui/tree.tsx"]
  file_src_components_ui_accordion_tsx["src/components/ui/accordion.tsx"]
  file_src_components_ui_alert_dialog_tsx["src/components/ui/alert-dialog.tsx"]
  file_src_components_ui_alert_tsx["src/components/ui/alert.tsx"]
  file_src_components_ui_aspect_ratio_tsx["src/components/ui/aspect-ratio.tsx"]
  file_src_components_ui_avatar_tsx["src/components/ui/avatar.tsx"]
  file_src_components_ui_badge_tsx["src/components/ui/badge.tsx"]
  file_src_components_ui_breadcrumb_tsx["src/components/ui/breadcrumb.tsx"]
  file_src_components_ui_button_group_tsx["src/components/ui/button-group.tsx"]
  file_src_components_ui_button_tsx["src/components/ui/button.tsx"]
  file_src_components_ui_calendar_tsx["src/components/ui/calendar.tsx"]
  file_src_components_ui_card_tsx["src/components/ui/card.tsx"]
  file_src_components_ui_carousel_tsx["src/components/ui/carousel.tsx"]
  file_src_components_ui_chart_tsx["src/components/ui/chart.tsx"]
  file_src_components_ui_checkbox_tsx["src/components/ui/checkbox.tsx"]
  file_src_components_ui_collapsible_tsx["src/components/ui/collapsible.tsx"]
  file_src_components_ui_combobox_tsx["src/components/ui/combobox.tsx"]
  file_src_components_ui_command_tsx["src/components/ui/command.tsx"]
  file_src_components_ui_context_menu_tsx["src/components/ui/context-menu.tsx"]
  file_src_components_ui_dialog_tsx["src/components/ui/dialog.tsx"]
  file_src_components_ui_drawer_tsx["src/components/ui/drawer.tsx"]
  file_src_components_ui_dropdown_menu_tsx["src/components/ui/dropdown-menu.tsx"]
  file_src_components_ui_empty_tsx["src/components/ui/empty.tsx"]
  file_src_components_ui_field_tsx["src/components/ui/field.tsx"]
  file_src_components_ui_hover_card_tsx["src/components/ui/hover-card.tsx"]
  file_src_components_ui_input_group_tsx["src/components/ui/input-group.tsx"]
  file_src_components_ui_input_otp_tsx["src/components/ui/input-otp.tsx"]
  file_src_components_ui_input_tsx["src/components/ui/input.tsx"]
  file_src_components_ui_item_tsx["src/components/ui/item.tsx"]
  file_src_components_ui_kbd_tsx["src/components/ui/kbd.tsx"]
  file_src_components_ui_label_tsx["src/components/ui/label.tsx"]
  file_src_components_ui_menubar_tsx["src/components/ui/menubar.tsx"]
  file_src_components_ui_navigation_menu_tsx["src/components/ui/navigation-menu.tsx"]
  file_src_components_ui_pagination_tsx["src/components/ui/pagination.tsx"]
  file_src_components_ui_popover_tsx["src/components/ui/popover.tsx"]
  file_src_components_ui_progress_tsx["src/components/ui/progress.tsx"]
  file_src_components_ui_radio_group_tsx["src/components/ui/radio-group.tsx"]
  file_src_components_ui_resizable_tsx["src/components/ui/resizable.tsx"]
  file_src_components_ui_scroll_area_tsx["src/components/ui/scroll-area.tsx"]
  file_src_components_ui_select_tsx["src/components/ui/select.tsx"]
  file_src_components_ui_separator_tsx["src/components/ui/separator.tsx"]
  file_src_components_ui_sheet_tsx["src/components/ui/sheet.tsx"]
  file_src_components_ui_sidebar_tsx["src/components/ui/sidebar.tsx"]
  file_src_components_ui_skeleton_tsx["src/components/ui/skeleton.tsx"]
  file_src_components_ui_slider_tsx["src/components/ui/slider.tsx"]
  file_src_components_ui_sonner_tsx["src/components/ui/sonner.tsx"]
  file_src_components_ui_spinner_tsx["src/components/ui/spinner.tsx"]
  file_src_components_ui_switch_tsx["src/components/ui/switch.tsx"]
  file_src_components_ui_table_tsx["src/components/ui/table.tsx"]
  file_src_components_ui_tabs_tsx["src/components/ui/tabs.tsx"]
  file_src_components_ui_textarea_tsx["src/components/ui/textarea.tsx"]
  file_src_components_ui_toggle_group_tsx["src/components/ui/toggle-group.tsx"]
  file_src_components_ui_toggle_tsx["src/components/ui/toggle.tsx"]
  file_src_components_ui_tooltip_tsx["src/components/ui/tooltip.tsx"]
  file_src_hooks_use_copy_to_clipboard_ts["src/hooks/use-copy-to-clipboard.ts"]
  file_src_hooks_use_file_upload_ts["src/hooks/use-file-upload.ts"]
  file_src_hooks_use_media_query_ts["src/hooks/use-media-query.ts"]
  file_src_hooks_use_mobile_ts["src/hooks/use-mobile.ts"]
  file_src_hooks_use_scroll_position_ts["src/hooks/use-scroll-position.ts"]
  file_src_hooks_use_slider_input_ts["src/hooks/use-slider-input.ts"]
  file_src_index_ts["src/index.ts"]
  file_src_lib_utils_ts["src/lib/utils.ts"]
  file_vite_config_mts["vite.config.mts"]
  file_src_components_examples_c_sidebar_1_tsx --> file_src_components_ui_avatar_tsx
  file_src_components_examples_c_sidebar_1_tsx --> file_src_components_ui_breadcrumb_tsx
  file_src_components_examples_c_sidebar_1_tsx --> file_src_components_ui_button_tsx
  file_src_components_examples_c_sidebar_1_tsx --> file_src_components_ui_card_tsx
  file_src_components_examples_c_sidebar_1_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_examples_c_sidebar_1_tsx --> file_src_components_ui_sidebar_tsx
  file_src_components_reui_autocomplete_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_cascader_cascader_async_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_async_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_cascader_cascader_async_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_columns_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_columns_tsx --> file_src_components_reui_cascader_cascader_item_tsx
  file_src_components_reui_cascader_cascader_columns_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_cascader_cascader_columns_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_cascader_cascader_context_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_footer_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_footer_tsx --> file_src_components_reui_cascader_cascader_item_tsx
  file_src_components_reui_cascader_cascader_footer_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_cascader_cascader_footer_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_i18n_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_item_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_item_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_cascader_cascader_item_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_item_tsx --> file_src_components_ui_spinner_tsx
  file_src_components_reui_cascader_cascader_lib_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_nav_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_nav_tsx --> file_src_components_reui_cascader_cascader_i18n_tsx
  file_src_components_reui_cascader_cascader_nav_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_cascader_cascader_nav_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_virtual_tsx --> file_src_components_reui_cascader_cascader_columns_tsx
  file_src_components_reui_cascader_cascader_virtual_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_virtual_tsx --> file_src_components_reui_cascader_cascader_item_tsx
  file_src_components_reui_cascader_cascader_tsx --> file_src_components_reui_cascader_cascader_async_tsx
  file_src_components_reui_cascader_cascader_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_cascader_cascader_tsx --> file_src_components_reui_cascader_cascader_i18n_tsx
  file_src_components_reui_cascader_cascader_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_cascader_cascader_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_cascader_cascader_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_code_block_code_block_tsx --> file_src_components_reui_code_block_code_block_highlight_tsx
  file_src_components_reui_code_block_code_block_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_color_picker_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_color_picker_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_color_picker_tsx --> file_src_components_ui_input_group_tsx
  file_src_components_reui_color_picker_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_color_picker_tsx --> file_src_components_ui_separator_tsx
  file_src_components_reui_data_grid_data_grid_cell_selection_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_cell_selection_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_column_filter_tsx --> file_src_components_reui_badge_tsx
  file_src_components_reui_data_grid_data_grid_column_filter_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_column_filter_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_column_filter_tsx --> file_src_components_ui_input_tsx
  file_src_components_reui_data_grid_data_grid_column_filter_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_data_grid_data_grid_column_filter_tsx --> file_src_components_ui_separator_tsx
  file_src_components_reui_data_grid_data_grid_column_header_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_column_header_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_column_header_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_data_grid_data_grid_column_visibility_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_column_visibility_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_data_grid_data_grid_pagination_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_pagination_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_pagination_tsx --> file_src_components_ui_select_tsx
  file_src_components_reui_data_grid_data_grid_pagination_tsx --> file_src_components_ui_skeleton_tsx
  file_src_components_reui_data_grid_data_grid_scroll_area_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_table_dnd_rows_tsx --> file_src_components_reui_data_grid_data_grid_table_tsx
  file_src_components_reui_data_grid_data_grid_table_dnd_rows_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_table_dnd_rows_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_table_dnd_tsx --> file_src_components_reui_data_grid_data_grid_table_tsx
  file_src_components_reui_data_grid_data_grid_table_dnd_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_table_dnd_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_table_virtual_tsx --> file_src_components_reui_data_grid_data_grid_table_tsx
  file_src_components_reui_data_grid_data_grid_table_virtual_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_table_virtual_tsx --> file_src_components_ui_spinner_tsx
  file_src_components_reui_data_grid_data_grid_table_tsx --> file_src_components_reui_data_grid_data_grid_tsx
  file_src_components_reui_data_grid_data_grid_table_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_data_grid_data_grid_table_tsx --> file_src_components_ui_checkbox_tsx
  file_src_components_reui_data_grid_data_grid_table_tsx --> file_src_components_ui_spinner_tsx
  file_src_components_reui_data_grid_data_grid_tsx --> file_src_components_reui_data_grid_data_grid_i18n_tsx
  file_src_components_reui_date_selector_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_date_selector_tsx --> file_src_components_ui_calendar_tsx
  file_src_components_reui_date_selector_tsx --> file_src_components_ui_input_tsx
  file_src_components_reui_date_selector_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_date_selector_tsx --> file_src_components_ui_tabs_tsx
  file_src_components_reui_date_selector_tsx --> file_src_hooks_use_mobile_ts
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_empty_tsx
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_input_group_tsx
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_skeleton_tsx
  file_src_components_reui_emoji_picker_tsx --> file_src_components_ui_tabs_tsx
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx --> file_src_components_reui_event_calendar_event_calendar_event_tsx
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx --> file_src_components_reui_icon_stack_tsx
  file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_event_calendar_event_calendar_content_tsx --> file_src_components_reui_event_calendar_event_calendar_agenda_view_tsx
  file_src_components_reui_event_calendar_event_calendar_content_tsx --> file_src_components_reui_event_calendar_event_calendar_month_view_tsx
  file_src_components_reui_event_calendar_event_calendar_content_tsx --> file_src_components_reui_event_calendar_event_calendar_resource_view_tsx
  file_src_components_reui_event_calendar_event_calendar_content_tsx --> file_src_components_reui_event_calendar_event_calendar_time_grid_tsx
  file_src_components_reui_event_calendar_event_calendar_content_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_content_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_dnd_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_dnd_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_dnd_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_event_tsx --> file_src_components_reui_event_calendar_event_calendar_dnd_tsx
  file_src_components_reui_event_calendar_event_calendar_event_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_event_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_event_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_event_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_event_calendar_event_calendar_i18n_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_lib_tsx --> file_src_components_reui_event_calendar_event_calendar_recurrence_tsx
  file_src_components_reui_event_calendar_event_calendar_lib_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_reui_event_calendar_event_calendar_dnd_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_reui_event_calendar_event_calendar_event_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_event_calendar_event_calendar_month_view_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_ui_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_event_calendar_event_calendar_nav_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_event_calendar_event_calendar_recurrence_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_reui_event_calendar_event_calendar_dnd_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_reui_event_calendar_event_calendar_event_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_reui_event_calendar_event_calendar_time_grid_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_resource_view_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx --> file_src_components_reui_event_calendar_event_calendar_dnd_tsx
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx --> file_src_components_reui_event_calendar_event_calendar_event_tsx
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx --> file_src_components_reui_event_calendar_event_calendar_tsx
  file_src_components_reui_event_calendar_event_calendar_time_grid_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_event_calendar_event_calendar_tsx --> file_src_components_reui_event_calendar_event_calendar_i18n_tsx
  file_src_components_reui_event_calendar_event_calendar_tsx --> file_src_components_reui_event_calendar_event_calendar_lib_tsx
  file_src_components_reui_event_calendar_event_calendar_tsx --> file_src_components_reui_event_calendar_event_calendar_types_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_builder_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_chip_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_context_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_dnd_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_i18n_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_lib_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_operators_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_query_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_ui_input_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_filters_filters_advanced_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_cascader_cascader_footer_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_cascader_cascader_nav_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_cascader_cascader_virtual_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_cascader_cascader_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_filters_filters_context_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_filters_filters_lib_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_filters_filters_operators_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_filters_filters_builder_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_reui_filters_filters_context_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_reui_filters_filters_editors_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_reui_filters_filters_lib_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_reui_filters_filters_operators_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_reui_filters_filters_query_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_ui_button_group_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_filters_filters_chip_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_filters_filters_context_tsx --> file_src_components_reui_filters_filters_draft_tsx
  file_src_components_reui_filters_filters_context_tsx --> file_src_components_reui_filters_filters_lib_tsx
  file_src_components_reui_filters_filters_context_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_draft_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_cascader_cascader_context_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_cascader_cascader_footer_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_cascader_cascader_item_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_cascader_cascader_nav_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_cascader_cascader_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_filters_filters_context_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_filters_filters_lib_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_ui_button_group_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_filters_filters_editors_tsx --> file_src_components_ui_input_tsx
  file_src_components_reui_filters_filters_i18n_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_lib_tsx --> file_src_components_reui_cascader_cascader_lib_tsx
  file_src_components_reui_filters_filters_lib_tsx --> file_src_components_reui_cascader_cascader_types_tsx
  file_src_components_reui_filters_filters_lib_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_operators_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_query_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_advanced_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_builder_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_chip_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_context_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_draft_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_editors_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_i18n_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_lib_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_operators_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_query_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_reui_filters_filters_types_tsx
  file_src_components_reui_filters_filters_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_gantt_gantt_bar_tsx --> file_src_components_reui_gantt_gantt_dnd_tsx
  file_src_components_reui_gantt_gantt_bar_tsx --> file_src_components_reui_gantt_gantt_lib_tsx
  file_src_components_reui_gantt_gantt_bar_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_bar_tsx --> file_src_components_reui_gantt_gantt_tsx
  file_src_components_reui_gantt_gantt_bar_tsx --> file_src_components_ui_context_menu_tsx
  file_src_components_reui_gantt_gantt_bar_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_gantt_gantt_dnd_tsx --> file_src_components_reui_gantt_gantt_lib_tsx
  file_src_components_reui_gantt_gantt_dnd_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_dnd_tsx --> file_src_components_reui_gantt_gantt_tsx
  file_src_components_reui_gantt_gantt_i18n_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_lib_tsx --> file_src_components_reui_gantt_gantt_recurrence_tsx
  file_src_components_reui_gantt_gantt_lib_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_reui_gantt_gantt_lib_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_reui_gantt_gantt_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_ui_calendar_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_ui_popover_tsx
  file_src_components_reui_gantt_gantt_nav_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_gantt_gantt_recurrence_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_reui_gantt_gantt_bar_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_reui_gantt_gantt_dnd_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_reui_gantt_gantt_lib_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_reui_gantt_gantt_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_ui_checkbox_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_ui_context_menu_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_gantt_gantt_view_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_reui_gantt_gantt_tsx --> file_src_components_reui_gantt_gantt_i18n_tsx
  file_src_components_reui_gantt_gantt_tsx --> file_src_components_reui_gantt_gantt_lib_tsx
  file_src_components_reui_gantt_gantt_tsx --> file_src_components_reui_gantt_gantt_types_tsx
  file_src_components_reui_number_field_tsx --> file_src_components_ui_label_tsx
  file_src_components_reui_phone_input_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_phone_input_tsx --> file_src_components_ui_combobox_tsx
  file_src_components_reui_phone_input_tsx --> file_src_components_ui_input_tsx
  file_src_components_reui_phone_input_tsx --> file_src_components_ui_scroll_area_tsx
  file_src_components_reui_signature_pad_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_time_picker_tsx --> file_src_components_ui_button_tsx
  file_src_components_reui_time_picker_tsx --> file_src_components_ui_input_group_tsx
  file_src_components_reui_time_picker_tsx --> file_src_components_ui_popover_tsx
  file_src_components_ui_alert_dialog_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_button_group_tsx --> file_src_components_ui_separator_tsx
  file_src_components_ui_calendar_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_carousel_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_combobox_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_combobox_tsx --> file_src_components_ui_input_group_tsx
  file_src_components_ui_command_tsx --> file_src_components_ui_dialog_tsx
  file_src_components_ui_command_tsx --> file_src_components_ui_input_group_tsx
  file_src_components_ui_dialog_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_field_tsx --> file_src_components_ui_label_tsx
  file_src_components_ui_field_tsx --> file_src_components_ui_separator_tsx
  file_src_components_ui_input_group_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_input_group_tsx --> file_src_components_ui_input_tsx
  file_src_components_ui_input_group_tsx --> file_src_components_ui_textarea_tsx
  file_src_components_ui_item_tsx --> file_src_components_ui_separator_tsx
  file_src_components_ui_menubar_tsx --> file_src_components_ui_dropdown_menu_tsx
  file_src_components_ui_pagination_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_sheet_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_sidebar_tsx --> file_src_components_ui_button_tsx
  file_src_components_ui_sidebar_tsx --> file_src_components_ui_input_tsx
  file_src_components_ui_sidebar_tsx --> file_src_components_ui_separator_tsx
  file_src_components_ui_sidebar_tsx --> file_src_components_ui_sheet_tsx
  file_src_components_ui_sidebar_tsx --> file_src_components_ui_skeleton_tsx
  file_src_components_ui_sidebar_tsx --> file_src_components_ui_tooltip_tsx
  file_src_components_ui_sidebar_tsx --> file_src_hooks_use_mobile_ts
  file_src_components_ui_toggle_group_tsx --> file_src_components_ui_toggle_tsx
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-375-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-28.38_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-2-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-8-3178c6?style=flat-square)

### Measured Targets

![Library bundle Size](https://img.shields.io/badge/Library_bundle_Size-343.59_kB_gzip-6b7280?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-6-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-0-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-3-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-2-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-0-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-6-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-0-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-1-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-0-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-1-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-0-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-2-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-10-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-0-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-28-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-64-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-173-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-37-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-11-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-125-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-98-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-8-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-26-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-155-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-5-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-1-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-210-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-9-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-10-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-123-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-12-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-116-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-16-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-0-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-0-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-0-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-0-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-0-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-0-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-0-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-134-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-7-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-5-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-29-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-15-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-0-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-0-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-13-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-6-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-70-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
