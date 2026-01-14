# Settings Page Design Document

## 1. Overview
The **Settings Page** is a core administrative interface in Sisgate Hub 2.0. It allows users to manage Users, Groups, Access Levels, and System Settings.
The page has been redesigned to feature a **Fixed Layout** architecture, ensuring the sidebar and header remain pinned while the content scrolls independently. This delivers a modern, app-like user experience.

## 2. Layout Architecture
 The layout is built using a "File Manager App" style (`.fmapp-wrap`) structure, adapted for fixed positioning.

### 2.1. Structural Hierarchy
```jsx
<div className="hk-wrapper">
  {/* Main Navigation (Left) - Fixed */}
  <nav className="hk-menu">...</nav>

  <div className="hk-pg-wrapper">
    {/* Settings Container */}
    <div className="fmapp-wrap">
      
      {/* 1. Secondary Sidebar (Fixed) */}
      <SettingsSidebar className="fmapp-sidebar" />

      {/* Content Area */}
      <div className="fmapp-content">
        <div className="fmapp-detail-wrap">
          
          {/* 2. Header (Fixed) */}
          <FmHeader className="fm-header" />

          {/* 3. Scrollable Content Body */}
          <div className="fm-body">
             {/* Tab Content (Users, Groups, etc.) */}
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
```

### 2.2. Key SCSS Classes & Positioning
defined in `src/styles/scss/apps.scss`:

| Component | Class | Position | Z-Index | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Secondary Sidebar** | `.fmapp-sidebar` | `fixed` | `1030` | Pinned to left (`72px` collapsed / `270px` expanded). Height: `100vh - 65px`. |
| **Header** | `.fm-header` | `fixed` | `1029` | Pinned to top (`65px`). Width adapts to sidebar state. |
| **Content Wrapper** | `.fmapp-content` | `relative` | `1` | `overflow-y: auto`, `overflow-x: hidden`. Handles vertical scrolling. |
| **Content Body** | `.fmapp-detail-wrap` | `relative` | `10` | `padding-top: 65px` (offset for header). `min-height: 100%`. |
| **Dropdowns** | `.dropdown-menu` | `absolute` | `1020` | Lowered z-index to slide *under* fixed header on scroll. |

## 3. Component Design

### 3.1. Users List (`UsersList.jsx`)
Redesigned with a cleaner "Card" aesthetic:
*   **Container**: Wrapped in a white card with `shadow-sm` and `rounded-3`.
*   **Header**:
    *   **"Add User" Button**: Integrated into the table header (`thead`) for a compact toolbar effect.
    *   **Tabs**: Managed via `Settings/index.jsx` (lifted state) for consistent routing (`#groups`, `#users`, etc.).
*   **Table styling**:
    *   `.thead-light` for headers.
    *   Decreased vertical padding for compact info density.
    *   Media object for User Name/Avatar.
    *   Status indicators (badges).
*   **Actions**: 
    *   Simplified row actions (Edit/Delete) moved to a kebab menu (dropdown).

### 3.2. Settings Sidebar (`SettingsSidebar.jsx`)
*   Contains secondary navigation links:
    *   Users (Active)
    *   Templates
    *   Audit Logs
    *   System Settings

## 4. Responsive Behavior
The layout is fully responsive to the Main Sidebar's state:
*   **Expanded Main Sidebar**:
    *   Secondary Sidebar `left`: `270px`
    *   Header/Content `padding-left`: `270px`
*   **Collapsed Main Sidebar**:
    *   Secondary Sidebar `left`: `72px`
    *   Header/Content `padding-left`: `72px`

## 5. Future Improvements
*   [ ] **Apply Card Design to "Groups" Tab**: Replicate the `UsersList.jsx` card layout for the Groups table.
*   [ ] **Apply Card Design to "Access Levels" Tab**.
*   [ ] **Consolidate Navigation**: Investigate merging the top tabs ("Groups", "Users") into the Secondary Sidebar to save vertical space.
