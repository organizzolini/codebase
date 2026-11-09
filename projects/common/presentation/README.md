# 🎨 Components

**Shared React component library built on shadcn/ui and Base UI primitives.**

A collection of accessible, customizable UI components for the codebase, providing a consistent design system across applications. Built with Tailwind CSS, TypeScript, and shadcn/ui (New York style).

The interface half of the [Lexico](../lexico/lexico-web/README.md) suite:

| Project | Role |
| ------- | ---- |
| 🐺 [lexico-web](../lexico/lexico-web/README.md) | The SSR web application |
| 🎨 [presentation](README.md) | This package — shared React components |
| 📖 [lexico-db](../lexico/lexico-db/README.md) | TypeORM entities and migrations |
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
import { Button, Card, Input } from "@codebase/presentation";
import "@codebase/presentation/styles/globals.css"; // Import once in root layout

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
import "@codebase/presentation/styles/globals.css";
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
cd projects/common/presentation

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
nx run components:build
```

### Type Checking

```bash
nx run components:typecheck
```

### Type Coverage

```bash
nx run components:type-coverage
# Target: 99.84%
```

### Bundle Size Analysis

```bash
nx run components:codometer
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
import { Input, Label, Button } from "@codebase/presentation";

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
} from "@codebase/presentation";

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
} from "@codebase/presentation";

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
  "../components/src/**/*.{ts,tsx}",
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
import "@codebase/presentation/styles/globals.css";
```

### Import Errors

Verify TypeScript path mapping in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@codebase/presentation": [
        "../components/src/index.ts"
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

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run presentation:coinagerie-check:write`.

- **accept**: Names the cascader's predicate or option type that decides which nodes a commit may accept.
- **account**: A reui account, meaning the free plan whose daily request allowance governs fetching components through the MCP server.
- **adopt**: The autoSize.adopt call that takes over a column's measured size during preview in the data grid table.
- **alt**: The alt attribute on images, such as empty alt on decorative avatars in the example sidebar.
- **anchor**: The positioning reference element that a popup or menu attaches to, and the single point codometer measures against.
- **angle**: The hue angle in degrees that the color-picker converts between rectangular and polar colour coordinates.
- **arm**: The part of the cascader predicate that decides whether a node may be committed, one arm of its commit rule.
- **aspect**: The aspect ratio component, a ui wrapper that keeps a child at a fixed width-to-height proportion.
- **band**: A horizontal strip in the data grid, such as the footer band that holds pinned or summary cells.
- **baseline**: The text alignment reference line that code-block labels sit on, and the value used for vertical alignment.
- **border**: The border styling utility that frames cards, inputs, and cells, the most used class family in the presentation package.
- **boundary**: The edge limit that a popup or overflow respects, as the example sidebar notes the boundary holds under all eight styles.
- **br**: The HTML line-break element, used in code-block output to render an empty line with no tokens.
- **breadth**: The number of direct calls a callable makes, measured by callidescope and reported in this project's Breadth table.
- **brightness**: The colour-picker brightness channel, one of the axes the picker exposes alongside hue and saturation.
- **canonical**: The color-picker function that normalizes colour text into one canonical form before the picker compares or stores it.
- **cascade**: The stacked, multi-level selection flow of the cascader, where each choice loads and opens the next level.
- **category**: The file-type category, such as audio, video, or archive, that the reui file-type table assigns to each extension.
- **coordinate**: Pointer or screen coordinate used by drag-and-drop in data-grid, calendar, and gantt to place drop indicators.
- **counter**: CSS counter that numbers code block lines, plus a counter-driven gutter number that a row patch can replace.
- **cut**: Cell-selection action that clears the source cells after a copy, applied as a clear-or-cut batch in data-grid.
- **degree**: Angle unit in gantt arrow geometry, where a 45-degree bend shapes the pointer of a dependency bubble.
- **descendant**: CSS and React tree relation in cascader code, where a React descendant can render outside the DOM subtree it belongs to.
- **design**: Shadcn and Base UI component set this package provides, including the docs picker that marks design-system menus.
- **dimension**: Word with no occurrence in tracked source, appearing only as a glossary heading and naming no measurement in this project.
- **element**: DOM node or React element, such as the Base UI element a cascader column renders or the svg element an icon uses.
- **epoch**: Counter ref in cascader async loading that increments on each request, so stale responses can be detected and dropped.
- **estimate**: Verb or pre-measurement value in data-grid and cascader virtualization, used to size rows before real measurement.
- **family**: Pinning family in data-grid, the group of pinned columns whose ids carry a shared prefix above the leaf row.
- **fire**: Verb for triggering a request or callback, such as a paging fetch that fires once per cursor in cascader async.
- **gap**: Tailwind gap utility spacing flex and grid children, used across layout examples and component class lists.
- **grand**: Word with no occurrence in tracked source, appearing only as a glossary heading and naming no component in this project.
- **hand**: Adverb or verb for manual work, such as hand-authored components or a cursor that the user drags by hand.
- **handoff**: Filters-builder action where focus passes from one editing step to the next, such as handing focus to the value popover.
- **holder**: Object that stores timer handles in cascader async, so a pending prefetch timer can be cleared on the next call.
- **horizon**: Word with no occurrence in tracked source, appearing only as a glossary heading and naming no concept in this project.
- **horizontal**: Orientation option or layout axis, such as a horizontal Separator or a horizontal scroll area in the code block.
- **ink**: Emoji picker flag set when a glyph measures as drawn by the device font, so the picker knows the emoji is supported.
- **instant**: Scroll behavior value that jumps to the target without animation, used by data-grid when moving focus to a cell.
- **leaf**: Terminal tree node with no children, which cascader selection and data-grid leaf columns treat differently from branches.
- **letter**: Single character typed for typeahead matching in the cascader, and a letter that a file extension must contain to count.
- **literature**: Reader typography class in the global stylesheet, a text style for long-form reading that the lexico apps use.
- **live**: Aria-live regions that announce changes to assistive tech in cascader and data-grid, and live data in example content.
- **magnitude**: Size of a relative date offset in the filters date editor, parsed from counted text and signed by past or future direction.
- **observer**: Browser instance created to react when DOM children or subtrees change, used to re-measure layout after updates.
- **orientation**: Horizontal or vertical direction of a control such as a slider, separator, or list, exposed as aria-orientation.
- **place**: Position an item occupies in a layout, such as a spinner that replaces an expander in place within a tree row.
- **placement**: Where a floating element sits relative to its anchor, such as the header or floating copy button in code block.
- **presentation**: Name of this package, the shared React component library, and the presentation category used for PowerPoint file types.
- **preset**: Predefined option list, such as the preset colors a color picker offers as swatches under its default panel.
- **prop**: Input passed to a React component, such as a styling or behavior prop forwarded through a shadcn wrapper.
- **qualifier**: Adjective such as last or next in a relative date phrase, parsed from weekday text by the filters date parser.
- **quarter**: A three-month calendar period, one of the period choices for date filters and the quarter string value.
- **radius**: Corner rounding value, such as rounded-lg in the shadcn components, which the theme tokens scale per style variant.
- **restrict**: Drag modifier that clamps movement inside a table's bounds, used by the data-grid row drag-and-drop.
- **reveal**: Cascader reopen mode that navigates the open panel to the level holding the current selection.
- **rewrite**: Describes a change to row order that could only rewrite hidden order, which is why such rows get no drag grip.
- **role**: ARIA role attribute set on components such as the alert, navigation sidebar, and carousel for assistive technology.
- **selector**: CSS selector string or state-picking function, such as the projecting selector that gives each cell its own subscription.
- **self**: Refers to the component or package itself, as in the self-referential path alias in the eslint configuration.
- **sibling**: Adjacent element at the same level in the DOM, as in the sidebar count badge placed beside its button.
- **splice**: Array splice call that moves a data-grid column to a new index, reordering the column list in place.
- **square**: Shape term for equal width and height, as in the square code block copy button and square corner radius styles.
- **star**: Rating icon glyph, the StarIcon that the rating component fills for each step and leaves empty otherwise.
- **term**: Single search word that the emoji picker ranks, where an exact match beats a prefix and a prefix beats a substring.
- **tile**: Square product or workspace mark in the sidebar, sized as a 24px tile that the example scales with its frame.
- **triple**: Three-element tuple type for a color or matrix row, used in OKLab and color channel conversions.
- **unchanged**: Describes a value that stayed the same, such as a fresh object for an unchanged state that must not rebuild.
- **velocity**: Pointer speed used in signature pad smoothing and in the drag sizing mode that varies pen width.
- **visibility**: CSS visibility or content-visibility property, which the code block avoids skipping for measured layout reasons.
- **visible**: Shown on screen, such as the visible label text that an aria-label would replace in accessible names.
- **weekday**: Day-of-week value, such as the EEEE formatted weekday heading in the agenda view group header.

<!-- coinagerie:end -->
