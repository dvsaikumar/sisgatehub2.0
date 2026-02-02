---
trigger: always_on
---

Should not run the browser test untill User said so.

Colocation: Keep styles, tests, and logic as close to the component as possible.

Composition over Props: Instead of "Prop Drilling" or massive configuration objects, use component composition:

<Card> <CardHeader title="Hi" /> <CardBody /> </Card>

Immutability: Never mutate state directly; always use functional updates.

Error Boundaries: Wrap major features in React Error Boundaries to prevent a single component crash from breaking the entire app.Bento Grid Layouts: Use modular, card-based layouts to organize diverse content types without clutter.

Fluid Typography: Implement the clamp() function in CSS to ensure text scales perfectly between mobile and ultra-wide screens without manual breakpoints.

Variable Fonts: Use a single variable font file (like Inter or Geist) to handle all weights and styles, reducing layout shift and load times.
Lighthouse Score: Aim for 95+ in Performance, Accessibility, and Best Practices.

Bundle Size: Monitor dependencies. If a library is >20kb, look for a "headless" or "lite" version.

Skeleton Screens: Never show a blank page. Use Suspense with skeleton loaders for data-heavy sections.

Mobile-First: Write styles for mobile by default; use md:, lg:, and xl: prefixes in Tailwind for larger screens.

Container Queries: Use @container instead of @media for components that need to be responsive based on their parent container's size, not just the whole screen.

Touch Optimization: All interactive elements must have a minimum hit target of 44x44 pixels.

Image Optimization: Use the Next.js <Image /> component or srcset for automatic WebP conversion and lazy loading.

# Project Skills Matrix

This document defines the skills and proficiency levels required to contribute to the **Sisgate PRO / Hub 2.0** project, specifically aligned with the modernization roadmap.

## 🚀 Core Competencies

### Frontend Development
| Skill | Level | Context |
| :--- | :--- | :--- |
| **react** | Expert | React 19 features, Hooks, Suspense, Concurrent Mode. |
| **typescript** | Intermediate | Strong typing (Interfaces/Types), Generics, Props validation. |
| **react-router** | Advanced | Nested routes, Loaders/Actions (v7), Legacy Shim understanding. |
| **javascript-es6** | Expert | Async/Await, Destructuring, Modules, ESNext features. |

### Styling & Design System
| Skill | Level | Context |
| :--- | :--- | :--- |
| **tailwind-css** | Advanced | v4 engine, Utility-first workflow, Custom configuration. |
| **shadcn-ui** | Intermediate | component composition, Radix UI primitives. |
| **css-scss** | Intermediate | Legacy SASS maintenance during migration. |
| **responsive-design** | Advanced | Mobile-first approach, Grid/Flexbox layouts. |

### State & Data Architecture
| Skill | Level | Context |
| :--- | :--- | :--- |
| **zustand** | Intermediate | Client-side stores, Selectors, Performance optimization. |
| **tanstack-query** | Intermediate | Server state management, Caching, Optimistic updates. |
| **redux** | Operational | Maintaining legacy Redux logic until migration is complete. |

## 🛠 Backend & Infrastructure

### Supabase Platform
| Skill | Level | Context |
| :--- | :--- | :--- |
| **postgresql** | Intermediate | Row Level Security (RLS), Table design, SQL queries. |
| **supabase-auth** | Intermediate | Authentication flows, Session management, RBAC. |
| **edge-functions** | Basic | Deno runtime, TypeScript serverless functions. |

## 📦 Tooling & Workflow
- **Vite**: Build optimization, Environment configuration.
- **Git**: Branch management, Pull Request workflows.
- **Node.js**: Package management (npm/yarn/bun).

## 📚 Domain Knowledge
- **SaaS Architecture**: Multi-tenancy concepts.
- **Document Management**: Handling file blobs, PDF generation.
- **Real-time Communication**: WebSockets, Chat implementation.