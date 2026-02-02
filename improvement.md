# Application Improvement Plan

Based on the recent refactors (Dashboard, Sidebar) and deep codebase analysis, here is the updated improvement roadmap.

## 1. UI & UX Improvements

### 🎨 Visual Polish & Consistency
**Current Status**: Sidebar typography has been increased. Dashboard header is refactored.
**Recommendation**:
- **Global Search (Cmd+K)**: Implement a command palette to quickly jump between views (AI, Library, Settings) and search documents.
- **Unified Spacing System**: Enforce consistent padding/margins across all views using Tailwind's spacing scale (e.g., `p-6` or `p-8` as standard page padding).
- **Mobile optimization**: verify all the pages are mobile responsive.

### ⚡ Dashboard Evolution
**Current Status**: Header and Quick Actions are refactored. Grid layout is standard.
**Recommendation**:
- **Bento Grid**: Fully embrace the "Bento" layout for the stats and main content area to allow for variable-sized widgets that lock together.
- **Empty States**: Replace simple text "No reminders" with illustrated SVG components to improve delight.

## 2. Feature Expansion

### � Audit Logs & Security
**Current Status**: `src/views/AuditLogs` directory exists but appears minimal.
**Recommendation**:
- **Full Implementation**: Build a comprehensive Audit Log table tracking user actions (login, document creation, settings changes).
- **Filters & Export**: Add ability to filter logs by date/user and export to CSV.

### � AI Universality
**Current Status**: AI is contained in `CreateDoc`.
**Recommendation**:
- **Global AI Chat**: Convert `src/views/ChatPopup` into a global Floating Action Button (FAB) or slide-over drawer accessible from *any* page.
- **Context Awareness**: Allow the AI to read the current page content (e.g., summarize the open document).

### � Advanced Calendar
**Current Status**: Basic Calendar view exists.
**Recommendation**:
- **Two-way Sync**: Integrate with Google/Outlook Calendar APIs.
- **Dashboard Widget**: Make the "Upcoming Reminders" on dashboard interactive (quick complete, reschedule).

## 3. Technical Hygiene (High Priority)

### 🛡️ TypeScript Migration (Critical)
**Current Status**: Mixed codebase. `Dashboard` is `.tsx` but uses loose types. Many views are still `.jsx`.
**Recommendation**:
- **Aggressive Conversion**: Convert `src/views/*` to TypeScript file-by-file.
- **Strict Interfaces**: Define shared models in `src/models` (e.g., `User`, `Document`, `Reminder`) to avoid `any` types.

### ♻️ State Management Modernization
**Current Status**: Legacy Redux `connect()` HOC usage (seen in `Sidebar.jsx`, `Dashboard.tsx`).
**Recommendation**:
- **Redux Toolkit Hooks**: Refactor components to use `useSelector` and `useDispatch` hooks. This reduces boilerplate and improves readability.
- **React Query**: Consider `@tanstack/react-query` for server state (like fetching dashboard data) to handle caching/loading states better than local `useEffect`.

### 🎨 Styling Consolidation
**Current Status**: Mix of SCSS (`src/styles/scss`) and Tailwind CSS.
**Recommendation**:
- **Deprecate SCSS**: Stop adding new SCSS files. Move component-specific styles (like Sidebar overrides) into Tailwind utility classes or constrained styled-components to reduce split-brain styling.
