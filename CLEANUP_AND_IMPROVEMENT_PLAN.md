# 🧹 GroupSpace: Repository Cleanup & Production-Ready Plan

## 📦 Part 1: Safe Repository Cleanup Plan

Based on the structure and recent development cycles, here is the safe plan to sanitize the codebase without breaking anything.

### 🗑️ 1. Unused Files & Dead Code (Safe to remove)
- **Root JS Scripts (`check_triggers.js`, `debug_thesis_id.js`)**: These were temporary Node scripts used for debugging. They can be safely deleted to keep the root clean.
- **`src/app/dashboard/`**: Appears to be the old/legacy universal dashboard route. Now that the app utilizes Role-Based paths (`/student`, `/professor`, `/admin`, `/supervisor`), this directory should be audited and safely removed if no longer in use.
- **Obsolete Components**: Depending on usage, check `src/components/ui/` for any leftover dummy UI components that were replaced by the custom Tailwind implementations.

### 📁 2. Folder Structure Improvements
- **Database Migrations (`DB_MIGRATION_*.sql`)**: Move these from the root directory into a dedicated `/supabase/migrations/` or `/docs/database/` folder. This organizes the root and is standard for Supabase projects.
- **`src/components/dashboard/` vs Role-specific components**: There's a mix of generic (`Sidebar`, `StatsCard`) components and role-specific components. Move purely student-related dashboard components (like `TeamWorkspace`, `TasksTab`) out of shared spaces and strictly into `src/components/student/...`.
- **API Routes**: Move all nested api functionality logic to unified modular controller functions inside `/lib`, leaving `src/app/api` strictly for next.js Route Handlers.

### ⚠️ 3. Risky Deletions (Needs confirmation)
- **`src/app/(auth)/` Structure Check**: Double-check if `/login` and `/signup` are currently inside `(auth)`. Ensure they don't break middleware paths if refactored.
- **Landing Page Routes**: `src/app/features`, `/about`, `/contact`, `/security`. If the marketing site will be hosted on a separate domain (e.g. framer/webflow), these Next.js routes should be wiped. If integrating marketing into the main SaaS, keep them.

---

## 🚀 Part 2: Production-Ready Improvements

To elevate GroupSpace to a polished, enterprise-grade SaaS, here are the architectural next steps.

### 🏗️ 1. Code Organization (Modular Pattern)
Instead of grouping files by type (e.g., all tabs in `/components`), adopt a **Feature-Based Architecture**:
```text
src/
 ├─ features/
 │   ├─ thesis/         (API calls, components, types, hooks for Thesis)
 │   ├─ teams/          (API calls, components, types, hooks for Teams)
 │   └─ announcements/  (AnnouncementHandler, queries, actions)
 ├─ components/         (Only strict UI elements like Button, Avatar, Input)
```

### 🔐 2. Environment Variables & Schemas
- Integrate `zod` for strictly parsing `process.env`. If `NEXT_PUBLIC_SUPABASE_URL` is missing, the app should throw a build error, not a runtime crash.
- Implement strictly validated Zod schemas for all Server Action payloads to prevent corrupted data saving structurally.

### ⚡ 3. Performance & Data Fetching
- **Migrate to React Server Components (RSC)** where possible. Currently, dashboards heavily utilize `"use client"` layouts fetching on mount (causing loading spinners). Fetch data inside `page.tsx` (Server) and pass directly via props to Client shell components.
- **Supabase Caching**: For heavy queries (e.g., fetching all students for admin), leverage Next.js unstable_cache or `revalidateTag` to memoize the fetches securely instead of directly pinging the database every single navigation.

### 🛡️ 4. Error Handling & Loading States
- Implement `error.tsx` and `loading.tsx` inside every primary route segment (`/student`, `/professor`, `/admin`). Currently, fetch failures rely on internal explicit state variables (`fetchError`). A proper React Suspense integration will make the app feel significantly smoother and more resilient.
- Add "Empty State" illustrations for zero-data views (No courses, No tasks) to make the app feel alive instead of broken.

### 🎨 5. Global Styles consistency
- Purge any stray inline styles `style={{...}}`.
- Normalize custom shades utilizing Tailwind variables deeply encoded inside `tailwind.config.js` or `globals.css` ensuring absolute fidelity for Light/Dark themes across all widgets consistently.
