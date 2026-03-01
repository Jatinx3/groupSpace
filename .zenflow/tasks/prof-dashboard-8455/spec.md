# Technical Specification: Professor Dashboard UI Redesign

## Complexity Assessment
**Medium** — Multiple files to create/modify, client/server component split, reusing existing design system components, no business logic changes.

---

## Technical Context

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react v0.575
- **Auth/Data**: Supabase (server-side in layout + page, unchanged)
- **Design System**: Existing components in `src/components/dashboard/` and `src/components/ui/`

---

## Current State

The professor dashboard (`src/app/professor/`) uses a basic server-rendered layout:
- `layout.tsx`: Static header with title + logout button + tab nav
- `page.tsx`: Two static info cards (Teaching, Thesis Collab)
- `professor-tabs.tsx`: Simple horizontal tab nav (Overview, Thesis Collab)

The student dashboard (`src/app/student/`) uses a modern interactive layout:
- Client-side layout with collapsible sidebar, notification panel, avatar dropdown
- Rich overview page: Greeting, StatsGrid, DeadlineList, ActivityFeed, CourseGrid, TeamGrid

---

## Implementation Approach

Transform the professor dashboard to match the student dashboard's interactive pattern, reusing existing UI components. Keep all Supabase data fetching and auth logic **unchanged**.

### Architecture: Server + Client split

The professor layout currently fetches auth/profile data server-side. We preserve this by:
1. Keep `layout.tsx` as a **server component** for auth guard + profile fetch
2. Extract interactive shell into `ProfessorLayoutClient.tsx` (client component) accepting `firstName` prop
3. This mirrors how the student layout works (useEffect-based) but without changing auth semantics

### Navigation

Replace horizontal tabs with a collapsible sidebar (matching student dashboard pattern):
- Create `src/components/professor/ProfessorSidebar.tsx`
- Nav items: Overview (`/professor`), Thesis Collab (`/professor/thesis`)
- Reuse exact same sidebar design patterns as `src/components/dashboard/Sidebar.tsx`
- Remove or keep `professor-tabs.tsx` (will be replaced by sidebar)

### Overview Page

Enhance `src/app/professor/page.tsx` with:
- Greeting section (reuse `Greeting` component)
- Stats row: counts for courses taught, thesis supervisees (add minimal read-only queries)
- Quick-action cards for Teaching and Thesis Collab (styled, not static text boxes)

---

## Files to Create

| File | Description |
|------|-------------|
| `src/components/professor/ProfessorSidebar.tsx` | Collapsible sidebar with professor nav items |
| `src/components/professor/ProfessorLayoutClient.tsx` | Client layout shell: sidebar + header (hamburger, notifications placeholder, avatar dropdown) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/professor/layout.tsx` | Pass `firstName` to `ProfessorLayoutClient`, remove old header/tab JSX |
| `src/app/professor/page.tsx` | Add Greeting + StatsCards + styled quick-action cards; add 2 minimal count queries |
| `src/app/professor/professor-tabs.tsx` | Remove (navigation moves to sidebar) |

---

## Design Decisions

- **Color accent**: Indigo (same as student) for consistency
- **Background**: `bg-slate-100` content area, `bg-white` sidebar
- **Minimalism**: Clean whitespace, no decorative elements, match student component styles exactly
- **Stats for professor overview**:
  - Courses taught → query `courses` table `WHERE professor_id = user.id`
  - Thesis supervisees → query `thesis_projects` table `WHERE supervisor_id = user.id`
  - These are simple count queries, pure read-only, no logic change

---

## Interface Changes

### `ProfessorLayoutClient` props
```ts
interface ProfessorLayoutClientProps {
  children: React.ReactNode;
  firstName: string;
}
```

### `ProfessorSidebar` props
```ts
interface ProfessorSidebarProps {
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
}
```

---

## Verification

1. `npm run build` — no TypeScript or build errors
2. Visual check: professor layout matches student layout structure (sidebar, header, content area)
3. Existing thesis page (`/professor/thesis`) still renders correctly inside new layout
4. Auth guard still works: non-professor users redirected correctly
