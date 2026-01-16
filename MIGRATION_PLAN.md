# Tech Stack Migration Plan

This document outlines the phased approach to modernizing the **Sisgate PRO / Hub 2.0** application stack. The goal is to improve performance, maintainability, and developer experience while minimizing disruption to existing features.

## 🎯 Target Architecture

| Category | Current Stack | **Target Stack** | Status |
| :--- | :--- | :--- | :--- |
| **Core** | React 19 + JS + RR v5 | **TypeScript + React Router v7** | ✅ Done |
| **Styling** | Bootstrap + Custom SCSS | **Tailwind v4 + shadcn/ui** | ✅ Done |
| **State** | Redux (Legacy) | **Zustand + TanStack Query** | ✅ Done |
| **Forms** | Controlled Inputs | **React Hook Form + Zod** | ✅ Done |
| **Data** | ApexCharts + Custom Tables | **ApexCharts + TanStack Table** | ✅ Done |
| **Calendar** | FullCalendar + frappe-gantt | **FullCalendar + frappe-gantt** | ✅ Keep |
| **Rich Text** | Quill / TinyMCE | **TipTap** | ✅ Done |
| **Notify** | Toastify / SweetAlert | **React Hot Toast** | ✅ Done |
| **Utils** | Moment.js | **Day.js + nanoid + classnames** | ✅ Done |


---

## 📅 Roadmap Phase by Phase

### Phase 1: Foundation & Typing (The "Safety Net") ✅ COMPLETE
**Goal:** Prepare the codebase for modernization without changing UI.
1.  ✅ **Initialize TypeScript:**
    *   Installed `typescript`, `@types/react`, `@types/node`.
    *   Created `tsconfig.json` with path aliases.
    *   Allow `.js` and `.jsx` to coexist for gradual migration.
2.  ✅ **Upgrade Router Infrastructure:**
    *   Installed React Router v7.
    *   Replaced `useRouteMatch` with `useMatch` across all components.
    *   Updated `App.jsx` to use the new Router provider.
3.  ✅ **Utility Modernization:**
    *   Installed `dayjs`, `nanoid`, `clsx`.
    *   Created utility helper `cn()` for Tailwind class merging.

### Phase 2: Design System & Styling (The "Facelift") ✅ COMPLETE
**Goal:** Establish the new visual language and remove heavy CSS libraries.
1.  ✅ **Install Tailwind CSS v4 & Shadcn/UI:**
    *   Configured Tailwind v4 with `@tailwindcss/vite` plugin.
    *   Initialized `shadcn/ui` pattern (`components/ui/`).
    *   Created `cn()` utility, `Button`, `Card`, `Input`, `Badge` components.
    *   Installed `class-variance-authority` for variant management.
2.  ✅ **Notification Unification:**
    *   Configured `react-hot-toast` with proper options.
    *   Created `lib/toast.ts` utility wrapper.
    *   Updated `App.jsx` Toaster with consistent styling.
3.  ⚠️ **Bootstrap Phase-Out (Start):**
    *   Tailwind grid utilities available.
    *   Bootstrap still in use for legacy components (gradual removal in Phase 5).

### Phase 3: State & Data Fetching (The "Brain Upgrade") ✅ COMPLETE
**Goal:** Reduce boilerplate and improve data consistency.
1.  ✅ **TanStack Query Implementation:**
    *   Wrapped app in `QueryClientProvider`.
    *   Created `lib/query-client.ts` with God Mode defaults (5min staleTime, 10min gcTime).
    *   Created typed query key factories for documents, reminders, users, chat.
    *   Created sample hooks: `use-documents.ts`, `use-reminders.ts`.
2.  ✅ **Zustand for UI State:**
    *   Created `stores/layout-store.ts` for sidebar/nav state.
    *   Created `stores/modal-store.ts` for centralized modal management.
    *   Added selectors for optimal re-render performance.
3.  ✅ **Forms Overhaul (Iterative):**
    *   Installed `react-hook-form`, `@hookform/resolvers`, and `zod`.
    *   Created `lib/schemas.ts` with typed Zod schemas (login, signup, document, reminder, profile).
    *   Created `lib/form.tsx` with `useTypedForm` hook, `FormField` wrapper, `FormSubmitButton`.

### Phase 4: Data Visualization & Content (The "Power Features") ✅ COMPLETE
**Goal:** Modernize heavy components.
1.  ✅ **Tables Upgrade:**
    *   Installed `@tanstack/react-table`.
    *   Created reusable `DataTable` component with pagination, sorting, filtering.
    *   Ready for integration with document/user lists.
2.  ✅ **Rich Text Editor Switch:**
    *   Installed TipTap with full extension suite (placeholder, underline, link, text-align, color, highlight).
    *   Created `RichTextEditor` component with comprehensive toolbar.
    *   Ready to replace `react-quill` in editors.
3.  ✅ **Day.js Finalization:**
    *   Created `lib/dayjs.ts` with all plugins and utility functions.
    *   ✅ Replaced all 12 moment imports with Day.js.

### Phase 5: Cleanup & Optimization ⏳ IN PROGRESS
1.  ⏳ **Remove Bootstrap Completely:** Delete `bootstrap` dependency and `bootstrap.min.css`.
2.  ⏳ **Remove Redux (If fully migrated):** Uninstall `redux`, `react-redux`.
3.  ⏳ **Strict TypeScript:** Tighten `tsconfig` rules (no implicit any) as files are converted.
4.  ✅ **Complete Moment.js Migration:** All 12 moment imports replaced with Day.js!

---

## 🛠 Next Steps
1.  ✅ **Phase 1: Foundation** - Complete
2.  ✅ **Phase 2: Design System** - Complete
3.  ✅ **Phase 3: State & Data** - Complete
4.  ✅ **Phase 4: Data Visualization** - Complete
5.  ⏳ **Phase 5: Cleanup & Optimization** - In Progress (moment.js ✅ done)
