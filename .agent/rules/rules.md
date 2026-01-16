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