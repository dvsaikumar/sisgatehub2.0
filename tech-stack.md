# Tech Stack Documentation

This document outlines the technologies, libraries, and tools used in the **Sisgate PRO / Hub 2.0** application.

> 🚀 **Migration Alert**: This project is currently migrating to a modernized stack. See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for the detailed roadmap.

## Core Architecture
- **Frontend Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/) (v7)
- **Language**: JavaScript (Moving to **TypeScript**)
- **Router**: `react-router-dom` (v5 -> Moving to **v7**)

## State Management
- **Global Store**: [Redux](https://redux.js.org/) (Legacy) -> Moving to **Zustand** + **TanStack Query**

## Routing
- **Library**: `react-router-dom` (v5.3.4)
  > Note: The project uses version 5 of React Router.

## Backend & Infrastructure
- **BaaS (Backend as a Service)**: [Supabase](https://supabase.com/)
- **SDK**: `@supabase/supabase-js`
- **Serverless functions**: Supabase Edge Functions (Deno runtime) (e.g., `send-reminder-email`)

## Styling & UI Design
- **Utility-First Framework**: [Tailwind CSS](https://tailwindcss.com/) (v4) + **shadcn/ui** (Planned)
- **Component Framework**: [Bootstrap](https://getbootstrap.com/) (v5) -> **To be removed**
- **CSS Preprocessor**: [SASS/SCSS](https://sass-lang.com/)
- **CSS-in-JS**: [Styled Components](https://styled-components.com/) (Legacy)
- **Animations**:
  - [Framer Motion](https://www.framer.com/motion/)
  - [Animate.css](https://animate.style/)

## Feature-Specific Libraries

### 📊 Data Visualization
- **ApexCharts**: `react-apexcharts`, `apexcharts`
- **AmCharts**: `@amcharts/amcharts5`, `@amcharts/amcharts5-geodata`

### 🗓️ Calendar & Scheduling
- **FullCalendar**: `@fullcalendar/react` (DayGrid, TimeGrid, List, Interaction)
- **Gantt Charts**: `frappe-gantt`

### 📝 Forms & Rich Text Editors
- **WYSIWYG Editors**:
  - `react-quill-new`
  - `@tinymce/tinymce-react`
- **Inputs**:
  - `react-select` (Dropdowns)
  - `react-datepicker` (Date selection)
  - `bootstrap-daterangepicker` & `react-bootstrap-daterangepicker`
- **File Upload**: `react-dropzone`, `react-dropzone-component`, `dropzone`
- **Drag & Drop**: `@hello-pangea/dnd`

### 📄 Document Handling
- **Viewing**:
  - `@cyntler/react-doc-viewer`
  - `react-doc-viewer`
  - `docx-preview`
- **Generation & Parsing**:
  - `jspdf` & `jspdf-autotable` (PDF generation)
  - `docxtemplater` & `pizzip` (Word templates)
  - `mammoth` (Docx to HTML)
  - `xlsx` (Excel sheets)

### 🔔 Notifications & Feedback
- **Modals/Alerts**: `sweetalert2`, `@sweetalert2/theme-bootstrap-4`
- **Toasts**: `react-hot-toast`, `react-toastify`

### 🖼️ Media & UI Components
- **Icons**:
  - `@fortawesome/react-fontawesome`
  - `bootstrap-icons`
  - `@phosphor-icons/react`
  - `react-feather`
  - `remixicon`
  - `tabler-icons-react`
- **Carousels/Sliders**: `swiper`, `react-responsive-carousel`
- **Scrollbars**: `react-perfect-scrollbar`, `simplebar-react`
- **Layout Utilities**: `react-split`

## Utilities
- **Date Handling**: `moment`
- **ID Generation**: `nanoid`
- **Class Management**: `classnames`
- **File Saving**: `file-saver`
- **Window Size**: `@react-hook/window-size`
