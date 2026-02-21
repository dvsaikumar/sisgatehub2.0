/**
 * Zustand Stores Barrel File
 * 
 * Export all stores from a single entry point.
 * Import like: import { useLayoutStore, useModalStore } from '@/stores';
 */

export {
    useLayoutStore,
    selectSidebarCollapsed,
    selectSidebarHovered,
    selectTopNavCollapsed,
    selectMobileMenuOpen
} from './layout-store';

export {
    useModalStore,
    selectActiveModal,
    selectModalData
} from './modal-store';

export {
    usePreferencesStore,
    selectSidebarPosition,
    selectSidebarWidth,
    selectCardStyle,
    selectFontSize,
    selectFontFamily,
    selectDashboardWallpaper,
    selectGreetingMessage,
    selectWidgetColorTheme,
    selectIconStyle,
    WALLPAPER_MAP,
    FONT_FAMILY_MAP,
    SIDEBAR_WIDTH_MAP,
    WIDGET_THEME_MAP,
} from './preferences-store';
