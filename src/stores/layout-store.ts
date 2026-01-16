import { create } from 'zustand';

/**
 * Layout Store
 * 
 * Per God Mode Protocol:
 * - Small, atomic stores (not one giant "AppStore")
 * - Client UI state only (sidebar toggle, theme, modals)
 * - Always use selectors when consuming state
 */

interface LayoutState {
    // Sidebar
    sidebarCollapsed: boolean;
    sidebarHovered: boolean;

    // Top navigation
    topNavCollapsed: boolean;

    // Mobile menu
    mobileMenuOpen: boolean;

    // Actions
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSidebarHovered: (hovered: boolean) => void;
    toggleTopNav: () => void;
    setTopNavCollapsed: (collapsed: boolean) => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    // Initial state
    sidebarCollapsed: false,
    sidebarHovered: false,
    topNavCollapsed: false,
    mobileMenuOpen: false,

    // Actions
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),
    toggleTopNav: () => set((state) => ({ topNavCollapsed: !state.topNavCollapsed })),
    setTopNavCollapsed: (collapsed) => set({ topNavCollapsed: collapsed }),
    toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
    closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));

/**
 * Selectors for optimal re-render performance
 * 
 * Usage:
 * const sidebarCollapsed = useLayoutStore(selectSidebarCollapsed);
 */
export const selectSidebarCollapsed = (state: LayoutState) => state.sidebarCollapsed;
export const selectSidebarHovered = (state: LayoutState) => state.sidebarHovered;
export const selectTopNavCollapsed = (state: LayoutState) => state.topNavCollapsed;
export const selectMobileMenuOpen = (state: LayoutState) => state.mobileMenuOpen;
