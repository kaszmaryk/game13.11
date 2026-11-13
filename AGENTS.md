# Game Dashboard — Agent Development Guide

## Overview

This is a **read-only web dashboard** for a political simulation game ("Политическая симуляция Швеция 2026"). It displays real-time game state, timeline events, decision history, and AI-generated media/social media reactions. Built with React + TypeScript + **shadcn/ui (Base UI)** and deployed to GitHub Pages.

## Architecture

### Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **UI Library**: shadcn/ui — **Base UI** primitives (`base-nova` style)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React (`lucide`)
- **Charts**: Recharts (available, not yet used)
- **Deployment**: GitHub Pages via GitHub Actions
- **Data Source**: `context.json` in repository root (one level up from `dashboard/`)

### Project Configuration (from `components.json`)

| Field             | Value                  |
| ----------------- | ---------------------- |
| `style`           | `base-nova`            |
| `rsc`             | `false`                |
| `tsx`             | `true`                 |
| `tailwind.config` | `tailwind.config.js`   |
| `tailwind.css`    | `src/index.css`        |
| `baseColor`       | `neutral`              |
| `cssVariables`    | `true`                 |
| `iconLibrary`     | `lucide`               |
| UI alias          | `@/components/ui`      |
| Components alias  | `@/components`         |
| Hooks alias       | `@/hooks`              |
| Lib alias         | `@/lib`                |
| Utils alias       | `@/lib/utils`          |

> **Note:** `rsc: false` means `"use client"` directives are **not** needed. All components are client-side.

### Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (managed by CLI)
│   │   │   ├── accordion.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   └── tabs.tsx
│   │   ├── GameHeader.tsx         # Title, current turn, date range
│   │   ├── MetricsBoard.tsx       # Key metrics cards
│   │   ├── TimelineView.tsx       # Turn calendar
│   │   ├── DecisionHistory.tsx    # Chronological decisions
│   │   ├── NewspaperSection.tsx   # TODO: Articles display
│   │   └── SocialMediaFeed.tsx    # TODO: Social media posts
│   ├── hooks/
│   │   └── useGameState.ts        # Fetch and parse context.json
│   ├── lib/
│   │   └── utils.ts               # cn() utility + shadcn helpers
│   ├── types/
│   │   └── game.ts                # TypeScript interfaces
│   ├── App.tsx                    # Main layout
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind imports + CSS variables
├── public/
│   └── context.json               # Copied during build (optional)
├── components.json                # shadcn/ui configuration
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS plugins
├── tsconfig.json                  # TypeScript config
├── vite.config.ts                 # Vite config (base: "/game13.11/")
└── package.json                   # Dependencies
```

### Path Aliases

Configured in `tsconfig.app.json`:

- `@/components` → `src/components`
- `@/hooks` → `src/hooks`
- `@/lib` → `src/lib`
- `@/types` → `src/types`

---

## shadcn/ui Design Patterns (MANDATORY)

These rules are **always enforced**. They prevent common anti-patterns and ensure consistency with the shadcn/ui design system.

### 1. Styling & Tailwind

- **Use semantic colors only.** `bg-primary`, `text-muted-foreground`, `bg-card`, etc. Never raw values like `bg-blue-500` or `text-gray-700`. Party-specific colors from `context.json` are the sole exception.
- **Use `className` for layout, never for overriding component styling.** Do not override a Button's color or typography via className.
- **No `space-x-*` or `space-y-*`.** Use `flex` with `gap-*` instead.
  ```tsx
  // ✅ Correct
  <div className="flex flex-col gap-4">

  // ❌ Wrong
  <div className="space-y-4">
  ```
- **Use `size-*` when width and height are equal.** `size-10` not `w-10 h-10`.
- **Use `truncate` shorthand.** Not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **No manual `dark:` color overrides.** Use semantic tokens (`bg-background`, `text-muted-foreground`) which handle dark mode automatically.
- **Use `cn()` for conditional classes.** Import from `@/lib/utils`. Never write manual template literal ternaries for class merging.
  ```tsx
  import { cn } from '@/lib/utils';

  <div className={cn("flex items-center", isActive && "bg-accent")} />
  ```
- **No manual `z-index` on overlay components.** Dialog, Sheet, Popover handle their own stacking context.

### 2. Component Composition

- **Always check for an existing shadcn/ui component before writing custom markup.**
  ```bash
  npx shadcn@latest search <keyword>
  ```
- **Use full Card composition.** Always use `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter`. Don't dump everything into `CardContent`.
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>Заголовок</CardTitle>
      <CardDescription>Описание секции</CardDescription>
    </CardHeader>
    <CardContent>{/* content */}</CardContent>
    <CardFooter>{/* actions */}</CardFooter>
  </Card>
  ```
- **Dialog, Sheet, and Drawer always need a Title.** Use `DialogTitle`, `SheetTitle`, `DrawerTitle`. If visually hidden, add `className="sr-only"`.
- **`TabsTrigger` must be inside `TabsList`.** Never render triggers directly in `Tabs`.
- **`Avatar` always needs `AvatarFallback`.** For when images fail to load.
- **Button has no `isPending` / `isLoading` prop.** Compose loading state manually:
  ```tsx
  <Button disabled>
    <Loader2Icon data-icon="inline-start" className="animate-spin" />
    Загрузка…
  </Button>
  ```
- **Items always inside their Group.** `SelectItem` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`, `CommandItem` → `CommandGroup`.
- **Use `asChild` for custom triggers** (this project uses Base UI — check `npx shadcn@latest info` for the `base` field; some components use `render` instead).

### 3. Icons

- **Icons in Button use `data-icon`.** Set `data-icon="inline-start"` or `data-icon="inline-end"` on the icon element.
  ```tsx
  <Button>
    <SearchIcon data-icon="inline-start" />
    Поиск
  </Button>
  ```
- **No sizing classes on icons inside components.** Components handle icon sizing via CSS. No `size-4`, `w-4 h-4`, etc.
- **Pass icons as objects, not string keys.** `icon={CheckIcon}`, not a string lookup.
- **Import from `lucide-react`** (this project's `iconLibrary`).

### 4. Forms & Inputs

- **Forms use `FieldGroup` + `Field`.** Never use raw `div` with `space-y-*` or `grid gap-*` for form layout.
  ```tsx
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input id="email" />
    </Field>
  </FieldGroup>
  ```
- **Validation uses `data-invalid` on `Field` + `aria-invalid` on the control.**
  ```tsx
  <Field data-invalid>
    <FieldLabel>Email</FieldLabel>
    <Input aria-invalid />
    <FieldDescription>Некорректный email.</FieldDescription>
  </Field>
  ```
- **Option sets (2–7 choices) use `ToggleGroup`.** Don't loop `Button` with manual active state.
- **`InputGroup` uses `InputGroupInput` / `InputGroupTextarea`.** Never raw `Input` / `Textarea` inside `InputGroup`.

### 5. Feedback & Status

| Need               | Component                                      |
| ------------------ | ---------------------------------------------- |
| Alert / callout    | `Alert`                                        |
| Empty state        | `Empty`                                        |
| Loading placeholder| `Skeleton`                                     |
| Spinner            | `Spinner` (or `Loader2Icon` + `animate-spin`) |
| Status label       | `Badge` with appropriate variant               |
| Toast notification | `toast()` from `sonner` (Radix) or `toast` from `toast` component (Base UI) |
| Separator          | `Separator` (never `<hr>` or `<div className="border-t">`) |

- **Use `Badge` variants for status**, not raw colored spans:
  ```tsx
  // ✅ Correct
  <Badge variant="secondary">+20.1%</Badge>

  // ❌ Wrong
  <span className="text-emerald-600">+20.1%</span>
  ```

### 6. Component Selection Quick Reference

| Need                       | Use                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Button / action            | `Button` with appropriate variant                                                                   |
| Form inputs                | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider` |
| Toggle between 2–5 options | `ToggleGroup` + `ToggleGroupItem`                                                                   |
| Data display               | `Table`, `Card`, `Badge`, `Avatar`                                                                  |
| Navigation                 | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination`                                     |
| Overlays                   | `Dialog` (modal), `Sheet` (side panel), `Drawer` (bottom sheet), `AlertDialog` (confirmation)       |
| Feedback                   | `Alert`, `Progress`, `Skeleton`, `Spinner`, `Badge`                                                 |
| Command palette            | `Command` inside `Dialog`                                                                           |
| Charts                     | `Chart` (wraps Recharts)                                                                            |
| Layout                     | `Card`, `Separator`, `Resizable`, `ScrollArea`, `Accordion`, `Collapsible`                          |
| Empty states               | `Empty`                                                                                             |
| Menus                      | `DropdownMenu`, `ContextMenu`, `Menubar`                                                            |
| Tooltips / info            | `Tooltip`, `HoverCard`, `Popover`                                                                   |

---

## Data Structure

The dashboard reads from `/context.json` (relative to repo root). Expected structure:

```typescript
interface GameState {
  game: GameMetadata;              // Game title, turns, dates, status
  parties: Party[];                // Political parties
  metrics: Metrics;                // Current game metrics
  turnCalendar: TurnCalendar[];    // Turn timeline
  decisions: Decision[];           // Decision history
  newspapers: NewspaperArticle[];  // Generated articles
  socialMedia: SocialMediaPost[];  // Social media reactions
}
```

See `src/types/game.ts` for complete type definitions.

## Development Guidelines

### Adding shadcn/ui Components

```bash
# Search registries first
npx shadcn@latest search <keyword>

# Get docs and example URLs before using a component
npx shadcn@latest docs <component-name>

# Add a component
npx shadcn@latest add <component-name> -y

# Preview changes before updating an existing component
npx shadcn@latest add <component-name> --dry-run
npx shadcn@latest add <component-name> --diff <file>
```

Components are installed to `src/components/ui/`. **Always read added files** and verify they follow the critical rules above. Fix any issues before moving on.

### Component Authoring Pattern

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SomeType } from '@/types/game';

interface ComponentProps {
  data: SomeType;
  className?: string;
}

export function ComponentName({ data, className }: ComponentProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Заголовок секции</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Content using shadcn/ui primitives */}
      </CardContent>
    </Card>
  );
}
```

Key points:
- Accept and forward `className` for layout flexibility
- Use `cn()` for conditional class merging
- Use `flex flex-col gap-*` for vertical spacing, never `space-y-*`
- Use semantic color tokens, not raw Tailwind colors
- All UI text in Russian

### State Management

- **`useGameState` hook**: Central data fetching with auto-refresh (30s)
- **Local state**: `useState` for component-specific state
- **No global state library needed**: Data flows from top-level hook

### Error Handling

- Loading states with `Skeleton` or `Spinner`
- Error boundaries with retry buttons
- Graceful degradation for missing data
- Console logging for debugging

## Build & Deployment

### Development

```bash
cd dashboard
npm run dev          # Start dev server (http://localhost:5175/game13.11/)
npm run build        # Production build
npm run preview      # Preview production build
```

### Build Configuration

- **Base path**: `/game13.11/` (configured in `vite.config.ts`)
- **Output**: `dist/` directory
- **Assets**: Auto-hashed for cache busting

### GitHub Pages Deployment

- Triggered on push to `main` branch
- Builds from `dashboard/` directory
- Deploys to `https://kaszmaryk.github.io/game13.11/`
- Workflow: `.github/workflows/deploy.yml` (to be created)

## Current Implementation Status

### ✅ Completed (Phase 1–2)

- Project setup with Vite + TypeScript
- shadcn/ui integration (Base UI, `base-nova` style)
- Tailwind CSS configuration with CSS variables
- TypeScript types for all game data
- `useGameState` hook with auto-refresh
- GameHeader component
- MetricsBoard component (6 metrics with progress bars)
- TimelineView component (turn calendar)
- DecisionHistory component (expandable cards)
- Sample `context.json` for testing
- Responsive design basics

### 🚧 TODO (Phase 3–5)

- NewspaperSection component
- SocialMediaFeed component
- CoalitionStatus component (optional)
- Filtering and sorting capabilities
- Sentiment badges and engagement metrics
- Dark mode toggle
- GitHub Actions workflow
- Performance optimization
- Accessibility improvements

## Important Notes

### Base UI Specifics

This project uses **Base UI** (not Radix UI) for shadcn components:

- Some components use `render` prop instead of `asChild` — check `npx shadcn@latest info` output
- Accordion API differs (no `type` or `collapsible` props)
- Always run `npx shadcn@latest docs <component>` before using a component to verify the correct API
- Toast: use `toast` from the `toast` component (Base UI), not `sonner`

### Russian Language Support

- All UI text should be in Russian
- Fonts include Cyrillic glyphs (Geist Variable)
- Date formatting: `toLocaleDateString('ru-RU')`
- Number formatting: Consider Russian locale

### GitHub Pages Constraints

- Static site only (no server-side code)
- Base path must match repo name: `/game13.11/`
- `context.json` must be accessible at runtime
- No environment variables for secrets

### Performance Considerations

- Lazy load heavy components if needed
- Optimize images (use WebP/AVIF)
- Minimize bundle size (currently ~270KB JS)
- Use `React.memo` for expensive renders
- Implement virtualization for long lists

## Testing Strategy

### Manual Testing

1. Update `context.json` with new data
2. Verify dashboard reflects changes
3. Test responsive design (mobile/tablet/desktop)
4. Check Russian text rendering
5. Verify loading/error states

### Future Automation

- Unit tests with Vitest + React Testing Library
- E2E tests with Playwright
- Visual regression tests
- Accessibility audits with axe-core

## Common Tasks

### Adding a New Feature Component

1. Search for relevant shadcn/ui components: `npx shadcn@latest search <keyword>`
2. Get docs: `npx shadcn@latest docs <component>`
3. Install needed components: `npx shadcn@latest add <component> -y`
4. Read and verify added files against the critical rules above
5. Create feature component in `src/components/` following the authoring pattern
6. Add TypeScript types if needed in `src/types/game.ts`
7. Import and use in `App.tsx`
8. Test with sample data

### Updating Data Types

1. Edit `src/types/game.ts`
2. Update `context.json` structure
3. Update components using the types
4. Verify TypeScript compilation: `npm run build`

### Updating shadcn/ui Components

```bash
# Preview what would change
npx shadcn@latest add <component> --dry-run

# See diff for a specific file
npx shadcn@latest add <component> --diff <file>

# Apply update (only after reviewing diffs)
npx shadcn@latest add <component> -y
```

**Never use `--overwrite` without explicit user approval.**

### Debugging

- Check browser console for errors
- Verify `context.json` is fetchable
- Check network tab for failed requests
- Use React DevTools for component tree
- Verify Tailwind classes are applied
- Run `npx shadcn@latest info` to verify project configuration

## Troubleshooting

### Build Fails

- Check TypeScript errors: `npm run build`
- Verify all imports use correct `@/` paths
- Ensure shadcn components exist in `src/components/ui/`
- Clear `node_modules` and reinstall if needed

### Data Not Loading

- Verify `context.json` exists at repo root
- Check fetch URL in `useGameState` hook
- Verify base path configuration in `vite.config.ts`
- Check browser network tab

### Styling Issues

- Verify Tailwind classes use semantic tokens, not raw colors
- Check for conflicting CSS
- Ensure components use `cn()` utility for conditional classes
- Verify shadcn theme CSS variables are loaded in `index.css`
- No `space-y-*` / `space-x-*` — use `flex` + `gap-*`

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Base UI Documentation](https://base-ui.com/)
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
