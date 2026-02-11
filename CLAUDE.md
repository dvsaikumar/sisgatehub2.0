# CLAUDE.md - Sisgate Hub 2.0

This file provides guidance for AI assistants working with this codebase.

## Project Overview

Sisgate Hub 2.0 is a full-featured React-based enterprise management SPA with 20+ integrated features including Dashboard, Chat, Email, Tasks, Invoices, File Manager, Kanban boards, and more.

## Tech Stack

- **Framework:** React 19 + React Router v7
- **Build:** Vite 7
- **Language:** JavaScript/JSX with TypeScript support
- **Styling:** Tailwind CSS 4, SCSS, Bootstrap 5, Emotion, Styled-components
- **State:** Redux (global), Zustand (UI), TanStack React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Database:** Supabase (PostgreSQL + Auth + Real-time)
- **Deployment:** Vercel

## Project Structure

```
/src
├── /components          # Reusable components (including @hk-* custom library)
├── /views               # Page-level feature components
├── /layout              # Layout components (ClassicLayout, ResponsiveLayout)
├── /redux               # Redux store, reducers, actions
├── /stores              # Zustand stores (layout-store, modal-store)
├── /hooks               # Custom React hooks
├── /services            # API/business logic services
├── /lib                 # Utilities (query-client, schemas, dayjs, utils)
├── /utils               # Helper functions (aiService, docGenerator)
├── /configs             # Configuration (supabaseClient, ThemeConfig)
├── /routes              # Routing configuration
├── /models              # TypeScript interfaces
├── /styles              # SCSS/CSS/fonts
└── /assets              # Static assets (images, icons)
```

## Key Commands

```bash
npm run dev      # Start dev server with HMR
npm start        # Start dev server (network accessible)
npm run build    # Production build
npm run lint     # ESLint check (strict mode)
npm run preview  # Preview production build
```

## Path Aliases

Configured in `tsconfig.json` and `vite.config.js`:
- `@/*` → `src/*`
- `@/components/*`, `@/lib/*`, `@/utils/*`, `@/views/*`, `@/redux/*`, `@/assets/*`, `@/stores/*`, `@/hooks/*`

## State Management Patterns

- **Redux:** Global UI state (theme, navbar, email view)
- **Zustand:** Lightweight scoped stores (layout collapse, modals)
- **React Query:** Server state with 5-min stale time, 10-min cache
- **React Hook Form + Zod:** Form state and validation

## Data Fetching

- Use React Query with query key factories from `src/lib/query-client.ts`
- Supabase client in `src/configs/supabaseClient.js`
- Query keys follow hierarchical pattern: `queryKeys.documents.all()`, `queryKeys.documents.detail(id)`

## Component Conventions

- Custom UI components prefixed with `@hk-` (e.g., `@hk-data-table`, `@hk-alert`)
- Page components live in `/views` directory
- Shared reusable components in `/components`

## Authentication

- Supabase Auth with PKCE flow
- Session persistence enabled
- Route guards in `AppRoutes.jsx` check session before rendering

## Database Tables (Supabase)

- `user_profiles` - User metadata
- `app_groups` - Group management
- `app_documents` - Document storage
- `app_reminders` - Events/reminders
- `audit_logs` - Activity tracking
- `app_ai_configs` - AI provider settings
- `app_categories` - Content categorization

## Key Libraries

- **PDF:** jsPDF, jsPDF-autotable
- **DOCX:** docxtemplater, mammoth
- **Rich Text:** TinyMCE, Tiptap
- **Charts:** ApexCharts, amcharts5
- **Animation:** Framer Motion
- **Dates:** DayJS
- **Icons:** Bootstrap Icons, Font Awesome, Remixicon, Phosphor

## Responsive Design

- Mobile-first Tailwind approach
- `ResponsiveLayout` for < 1024px
- `ClassicLayout` for desktop (sidebar)
- `useWindowWidth` hook for breakpoint detection

## AI Integration

- Configurable AI provider via `app_ai_configs` table
- Generic OpenAI-compatible API support
- Service at `src/utils/aiService.js`

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Code Style

- ESLint strict mode (max-warnings: 0)
- TypeScript interfaces in `/models`
- Async/await with proper error handling
- React Hot Toast for notifications

## Testing

No testing framework currently configured. Consider adding Vitest for future test coverage.

## Important Notes

1. Always use path aliases (`@/`) for imports
2. Use React Query for data fetching, not direct fetch calls
3. Follow the `@hk-*` pattern for new UI components
4. Audit logging via `useAuditLog` hook for trackable actions
5. Use Zod schemas from `src/lib/schemas.ts` for validation
6. Toast notifications via `src/lib/toast.ts` configuration
