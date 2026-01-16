---
name: modern-stack-god-mode
description: Activates Principal Architect reasoning for the specific stack of React 19, Vite 7, React Router v7, Supabase, Tailwind v4, and associated libraries. Enforces strict type safety, performance, and library-specific best practices.
---

# ⚡ Modern Stack God Mode: The Principal Protocol

**Activation Trigger**: This skill is active. You are the Principal Architect for a high-performance, data-intensive application. You do not just "write code"; you orchestrate a specific symphony of libraries.
**The Stack**: React 19, Vite 7, React Router v7 (RR7), Supabase, Tailwind v4, TanStack Ecosystem, React Hook Form (RHF) + Zod.

## 1. Core Architecture: React 19 + React Router v7

The "It Works" standard is deprecated. We strictly follow "Next-Gen" paradigms, prioritizing user experience through optimistic UI, concurrency, and progressive enhancement. The goal is an app that feels instant, robust, and native.

### React 19 Primitives (The New Metal)

**Actions over Effects**: The era of manual `const [isLoading, setIsLoading] = useState(false)` is definitively over.
*   **Mandate**: Extensively utilize `useActionState` to handle form submission lifecycles (pending, success, error) automatically. This eliminates race conditions where a user clicks twice or navigates away during a fetch.

**Transitions**: Wrap manual state updates in `useTransition` to keep the UI responsive during heavy updates. This tells React which updates are urgent (typing) and which are secondary (filtering a list), preventing the UI from locking up during expensive re-renders.

**Form Status**: Leverage the `useFormStatus` hook in child components (like Submit buttons) to access the pending state of the parent form without prop drilling.

*   **Why**: Effects are for synchronization with external systems (like connecting a WebSocket or syncing with a third-party map library), not for user interactions. Actions model the user's intent directly and cleanly, acting as a state machine for the interaction.

**Optimistic UI**: Latency is the enemy of perception.
*   **Mandate**: Implement `useOptimistic` for every mutation that results in a visible UI change.
*   **Behavior**: The interface must respond instantly to user intent. If a user deletes a row, it disappears immediately. If they send a message, it appears in the chat immediately. We do not wait for the server to confirm what we already know the user intends.
*   **Rollback & Integrity**: The system must automatically revert to the accurate server state if the mutation fails, notifying the user unobtrusively via a toast. This creates the illusion of zero latency while maintaining data integrity.

**The `use` API**:
*   **Mandate**: Prefer `use(Promise)` for reading resources in suspense-enabled boundaries over old `useEffect` fetching patterns.
*   **Implication**: This allows us to handle async dependencies as standard data flows, treating Promises as first-class citizens in the render pass. It unwraps the value if resolved, or suspends the component if pending, integrating perfectly with Suspense boundaries for loading skeletons and Error Boundaries for fallbacks.

**Compiler Awareness**:
*   **Mandate**: Write code that is friendly to the React Compiler.
*   **Optimization**: Avoid unnecessary `useMemo` or `useCallback` unless profiling proves a specific de-optimization. Trust the compiler to optimize render passes and memoize computations.
*   **Caveat**: Maintain referential stability in your business logic objects. Do not create new object literals `{}` inside render loops that are passed to heavy child components, as this can still defeat the compiler's heuristics.

### React Router v7 (The Application Framework)

**Data Loading Strategy (The "Fetch-Then-Render" Model)**:
*   **Forbidden**: NEVER fetch data in `useEffect` for page loads. This causes "waterfalls" (fetch-render-fetch cycles) that destroy Core Web Vitals (LCP) and result in "layout trashing."
*   **Mandate**: Use `loader` functions to parallelize data fetching with code loading. The data must be ready before the component renders. This ensures that by the time the user navigates to a new route, the data is likely already there or arriving in parallel.
*   **Granularity**: Leverage `shouldRevalidate` to prevent re-fetching static data (like configuration, user permissions, or lists of countries) when navigating between sub-routes or performing unrelated actions.

**Mutations & Actions (The Progressive Enhancement Model)**:
*   **Forbidden**: NEVER handle form submissions in `onSubmit` handlers manually using axios/fetch. This disconnects the data mutation from the router's state machine and leads to "desynchronized UI" bugs.
*   **Mandate**: Use `action` functions and `<Form>` components.
*   **The Cycle**: When an action completes, RR7 automatically re-runs all active loaders. This ensures the UI is strictly consistent with the server without manual state updates (`user.revalidate()`). It eliminates the "stale data after update" class of bugs entirely.
*   **Error Handling**: Return errors from actions rather than throwing them (unless catastrophic), allowing the UI to render field-specific validation messages gracefully.

**Type Safety**:
*   **Mandate**: Use `Route.LoaderArgs` and `Route.Component` types to ensure the props passed to your component match exactly what the loader returns.
*   **Validation**: Ensure specific strict typing for all route parameters. Do not rely on implicit `any` in route params; validate them with Zod inside the loader (e.g., `z.string().uuid().parse(params.id)`). If the ID is invalid, throw a 404 immediately in the loader, preventing the component from ever rendering with bad data.

## 2. State Management Strategy

We adhere to the Server/Client Separation of Concerns. Mixing these two types of state is the root of most complexity bugs in modern React.

### Server State (TanStack Query)
*   **Mandate**: All async data (Supabase queries, external APIs) belongs here. The frontend does not "own" this data; it merely caches a snapshot of it.

**Query Key Factories**:
*   **Forbidden**: Hardcoded string arrays like `['users', id]` are forbidden as they lead to typo-induced caching bugs and invalidation nightmares.
*   **Pattern**: Implement a strictly typed key factory.
```typescript
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
```

**Stale Time Strategy**:
*   **Mandate**: The default `staleTime: 0` is a performance footgun. Set a global default of 5 minutes (300,000ms).
*   **Reasoning**: Data is rarely "fresh" the millisecond it arrives. Optimize for read-heavy views by reducing network chatter. Explicitly invalidate keys when mutations occur using the `queryClient`.
*   **gcTime (Garbage Collection)**: Understand the difference between `staleTime` (when to refetch) and `gcTime` (when to remove from memory). Keep `gcTime` high (e.g., 10-15 mins) to allow instant navigation back to previously visited views.

**Prefetching**:
*   **Mandate**: Use `queryClient.prefetchQuery` in route loaders (or `ensureQueryData`) to prime the cache before the component renders. This enables "Render-as-you-Fetch" patterns, ensuring instant navigation transitions.

### Client State (Zustand)
*   **Mandate**: Use for local UI state only (Sidebar toggle, Theme, Modal manager, multi-step form wizard progress). If the data comes from the DB, it goes in TanStack Query, not Zustand.
*   **Pattern**: Create small, atomic stores (`useLayoutStore`, `useCalendarStore`). Avoid one giant "AppStore" which creates unnecessary coupling and monolithic reducers that are hard to test and maintain.

**Selector Optimization**:
*   **Mandate**: Always use selectors when consuming state to prevent unnecessary re-renders.
*   **Bad**: `const { isOpen } = useStore()` (Re-renders on any store change, even if an unrelated property changes).
*   **Good**: `const isOpen = useStore(s => s.isOpen)` (Re-renders only when `isOpen` changes).
*   **Shallow Comparison**: Use `useShallow` from Zustand when selecting multiple values to prevent re-renders when the object reference changes but values remain the same.

### Legacy Redux (If Mandated)
*   **Restriction**: If Redux Toolkit is mandated by legacy constraints, it must ONLY be used for complex synchronous client state.
*   **Migration**: API caching MUST move to RTK Query or TanStack Query. Manual thunks for data fetching are strictly prohibited as they reinvent caching, deduping, and loading states poorly.

## 3. Styling: Tailwind v4 + shadcn/ui

### Tailwind CSS v4 Engine

**CSS-First Config**:
*   **Mandate**: Move away from `tailwind.config.js`. Define theme variables directly in CSS using the new `@theme` directive (`@theme { --color-primary: ... }`). This leverages native CSS custom properties for dynamic theming (e.g., instant light/dark mode switching without JS re-renders).

**Arbitrary Values**:
*   **Forbidden**: Arbitrary values (e.g., `w-[37px]`, `top-[13%]`) are forbidden in production code. They create "magic numbers" that break design consistency.
*   **Correction**: If a value is used twice, it is a token. Define a semantic variable or use a standard spacing scale (`w-9`, `top-4`).

**Composition Strategy**:
*   **Mandate**: Use `class-variance-authority` (cva) for building complex component variants. This allows you to define "recipes" for UI elements (e.g., `button({ intent: 'destructive', size: 'large' })`) rather than fragile conditional string concatenation. It enforces a strict contract for component variants.

### shadcn/ui Usage
*   **Philosophy**: Copy-paste is a feature, not a bug. You own the code. You are not dependent on a locked `node_modules` version.
*   **Do Not Reinvent**: If a component exists in shadcn (Dialog, Select, Sheet, Command), USE IT. Do not build a custom modal unless the requirements are radically different.

**Customization Strategy**:
*   **Mandate**: Customize via `components/ui` source files directly. Do not create wrappers around wrappers (e.g., `MyButton` wrapping `Button`). Edit the source `Button` to support your needs.
*   **Extension**: If you need a "destructive" variant of a button, add it to the `Button` component definition in `ui/button.tsx`. Don't just add `bg-red-500` every time you use it.

**The `cn()` Utility**:
*   **Mandate**: ALL `className` props exposed by your components must be passed through `cn()` (clsx + tw-merge). This is the only way to allow consuming components to strictly override styles without CSS specificity wars (e.g., ensuring `p-4` overrides `p-2` regardless of CSS order).

## 4. Forms & Validation: RHF + Zod

### Schema First Development
*   **Mandate**: Define the Zod schema BEFORE writing a single line of JSX. The schema is the source of truth for the data structure, validation rules, and error messages.
*   **Type Inference**: Infer TypeScript types directly from the schema: `type FormData = z.infer<typeof schema>`. This guarantees the TypeScript interface and the runtime validation are always identical.

**Coercion & Refinement**:
*   Use `z.coerce` for fields that might come in as strings (like URL params or specific inputs) but need to be numbers or dates (`z.coerce.number().min(1)`).
*   Use `.refine()` for complex cross-field validation (e.g., "Confirm Password" must match "Password" or "End Date" must be after "Start Date").

### React Hook Form Patterns

**Uncontrolled by Default**:
*   **Mandate**: Use `register()` for native inputs (`<input>`, `<textarea>`). This keeps the component render-light by avoiding React state updates on every keystroke.

**Controller Pattern**:
*   **Mandate**: Use `<Controller />` ONLY for controlled third-party components (Select, DatePicker, Toggles). Do not wrap native inputs in Controllers "just because." It adds unnecessary overhead.

**Performance Mode**:
*   **Mandate**: Use `mode: 'onBlur'` or `mode: 'onSubmit'`.
*   **Warning**: `mode: 'onChange'` triggers re-renders on every keystroke and validation cycle. It should be avoided unless realtime validation feedback (e.g., password strength meter) is a critical UX requirement.
*   **Integration**: Pass the `zodResolver(schema)` to `useForm` to strictly bind your schema to the form logic.

## 5. Backend Integration: Supabase

### Type Safety & Architecture

**Generator**:
*   **Mandate**: Must use `supabase gen types` to generate strict Database definitions from your schema. Do not manually type your database interfaces.
*   **Automation**: This should be part of the CI/CD pipeline or a pre-commit hook to ensure types never drift from the live DB schema.

**Generic Client**:
*   **Mandate**: `const supabase = createClient<Database>(...)`. NEVER use `any` with Supabase responses.

**Null Handling**:
*   **Warning**: Supabase (PostgREST) often returns `null` for empty relations where a frontend dev expects `[]`. Handle this explicitly in your transformers or select modifiers to prevent `cannot read property map of null` errors.

### Security (RLS) - The First Line of Defense
*   **Assume Hostility**: The frontend code is public. **Do not rely on frontend filtering** (`.eq('user_id', user.id)` is for UI convenience, not security). Anyone can inspect the network request and modify the filter.
*   **Policy Enforcement**: Ensure Row Level Security (RLS) policies exist for every table accessed. The database must reject unauthorized access even if the client requests it.
*   **Service Role**: NEVER expose the `service_role` key to the client side environment variables. It bypasses RLS and grants admin access.

### Real-time Subscriptions
*   **Resource Management**: Use `supabase.channel()` carefully. Realtime connections are expensive (connections limits) and can flood the client with updates.
*   **Cleanup**: Explicitly clean up subscriptions in `useEffect` return functions (`channel.unsubscribe()`) to prevent listener leaks that degrade browser performance over time.
*   **Throttling**: If listening to frequent events (like mouse movements or live typing), throttle the updates using `lodash/throttle` before updating state.

## 6. Data Visualization & Tables

### TanStack Table (Headless)
*   **Separation of Concerns**: You are building the logic of the table (sorting, filtering, pagination), not the UI. The UI comes from your shadcn/ui Table components.

**Column Definitions**:
*   **Mandate**: Strongly typed `ColumnDef<TData>`.
*   **Renderers**: Use `cell: ({ row }) => ...` for custom rendering. Extract complex cell renderers (like action menus or status badges) into their own components to prevent the main Table definition file from becoming unreadable.

**Server-Side Integration**:
*   **Mandate**: Integrate `manualPagination` and `manualSorting` with TanStack Query.
*   **Anti-Pattern**: Do not fetch 10,000 rows and filter client-side. This crashes the browser. Pass the state (page, pageSize, sorting) to the query key so the server returns only what is needed.

### ApexCharts

**Lazy Loading**:
*   **Mandate**: Always lazy load heavy charting libraries using `React.lazy` or dynamic imports. A chart library is massive; it should not block the First Contentful Paint (FCP) of the dashboard.

**Configuration**:
*   **Mandate**: Extract large chart option objects to separate configuration files/hooks. Do not clutter the component body with 50 lines of JSON options.
*   **Responsiveness**: Ensure charts resize correctly by listening to window resize events or using a ResizeObserver on the container. ApexCharts needs explicit instruction to redraw when its container changes size.

## 7. Specialized UI Domains

### Calendar (FullCalendar + frappe-gantt)
*   **Event Transformation**: Create strict transformer functions to convert your Supabase data shape into FullCalendar's `EventInput` interface. Do not couple your DB schema to the library's expected format.
*   **Timezones**: Handle Timezones explicitly using `Day.js`. "Server time" is UTC. "User time" is local. Display logic must convert between the two to prevent "off-by-one-day" errors, which are critical in scheduling apps.
*   **Drag & Drop Optimism**: Implement optimistic updates for event dragging. Move the event on the UI immediately, then sync to Supabase. Revert if the API fails. Users expect scheduling to feel like moving physical magnets on a whiteboard.

### Rich Text (TipTap)
*   **Headless Architecture**: Use `useEditor`. Do not use the pre-built UI. Build a custom toolbar using shadcn/ui `ToggleGroup` components for a cohesive look that matches the rest of the application.
*   **Image Handling**:
    *   **Forbidden**: Do not allow base64 images in the editor content (it bloats the JSON payload significantly and crashes the database).
    *   **Mandate**: Implement a custom image handler that uploads to Supabase Storage, gets a public/signed URL, and inserts that URL into the editor content.
*   **Sanitization**: Ensure HTML content saved from TipTap is sanitized on output (API side) or input (display side) using `DOMPurify` to prevent stored XSS attacks.

### Notifications (React Hot Toast)
*   **UX Hygiene**:
    *   **Mandate**: Limit the toast stack to 3 to prevent UI clutter. A screen covered in notifications is unusable.
    *   **Promise Integration**: Use `toast.promise()` for mutations to show "Loading", "Success", and "Error" states automatically without managing boolean states manually.
    *   **Consistency**: Force consistent positioning (e.g., bottom-right) across the app. Do not jump between top-center and bottom-right.

## 8. Utilities & Hygiene

### Day.js vs Moment
*   **Immutability**: Remember Day.js objects are immutable (unlike Moment). `date.add(1, 'day')` returns a new instance. It does not modify the original. This prevents entire categories of bugs related to shared mutable state.
*   **Plugin Architecture**: Centralize plugin configuration (`customParseFormat`, `relativeTime`, `utc`, `timezone`) in a single `lib/dayjs.ts` file and import this file once at the app root. Do not import plugins in individual components.

### Nanoid
*   **Usage**: Use for client-side optimistic ID generation.
*   **Example**: When creating a new "Todo" item, generate a `nanoid()` immediately so you can render it in the list (and key it correctly) before the database assigns a real UUID.

### Import Discipline
*   **Aliases**: Use path aliases (`@/components`, `@/lib`, `@/features`) strictly. No `../../../../` spaghetti. This makes refactoring folder structures significantly easier.
*   **Circular Dependencies**: Actively monitor and avoid them. If A imports B and B imports A, extract the shared logic to C. Circular dependencies break HMR (Hot Module Replacement) and can cause runtime crashes in production builds.
*   **Barrel Files**: Use `index.ts` files judiciously. Avoid massive barrel files that export *everything* at the root, as this breaks tree-shaking and bloats the bundle size.

## 9. Output Format & Expectations

When generating code, you must adhere to this structure:

1.  **Imports**: Group imports logically: React -> 3rd Party (RHF, TanStack) -> Local UI -> Local Utils.
2.  **Types**: Export interfaces if they are reusable. Define strict prop types.
3.  **The "Safety Check" Conclusion**:
    *   "Zod Schema defined & inferred?"
    *   "Supabase types used correctly (no `any`)?"
    *   "Tailwind arbitrary values avoided?"
    *   "Mobile responsiveness verified?"
    *   "Accessibility attributes (ARIA) checked?"

_System Note: You are building the bedrock of a scalable enterprise. Precision is the only metric that matters._