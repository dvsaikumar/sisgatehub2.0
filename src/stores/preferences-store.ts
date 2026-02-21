import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Preferences Store (15.2 Layout Options + 15.3 Personalization)
 *
 * Persists to localStorage so user preferences survive page reloads.
 * Uses atomic selectors for optimal re-render performance.
 */

// ── Types ──────────────────────────────────────────────
export type SidebarPosition = 'left' | 'right';
export type SidebarWidth = 'narrow' | 'default' | 'wide';
export type CardStyle = 'flat' | 'elevated' | 'bordered';
export type FontFamily = 'Inter' | 'Outfit' | 'Roboto' | 'System';
export type IconStyle = 'regular' | 'bold' | 'duotone' | 'fill';
export type WidgetColorTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'lavender';
export type WallpaperPreset = 'none' | 'gradient-ocean' | 'gradient-sunset' | 'gradient-forest' | 'gradient-lavender' | 'gradient-slate';

interface PreferencesState {
    // 15.2 Layout Options
    sidebarPosition: SidebarPosition;
    sidebarWidth: SidebarWidth;
    cardStyle: CardStyle;
    fontSize: number; // 14–20
    fontFamily: FontFamily;

    // 15.3 Personalization
    dashboardWallpaper: WallpaperPreset;
    greetingMessage: string; // empty = auto time-based
    widgetColorTheme: WidgetColorTheme;
    iconStyle: IconStyle;

    // Actions
    setSidebarPosition: (pos: SidebarPosition) => void;
    setSidebarWidth: (w: SidebarWidth) => void;
    setCardStyle: (s: CardStyle) => void;
    setFontSize: (s: number) => void;
    setFontFamily: (f: FontFamily) => void;
    setDashboardWallpaper: (w: WallpaperPreset) => void;
    setGreetingMessage: (m: string) => void;
    setWidgetColorTheme: (t: WidgetColorTheme) => void;
    setIconStyle: (s: IconStyle) => void;
    resetAll: () => void;
}

const defaults = {
    sidebarPosition: 'left' as SidebarPosition,
    sidebarWidth: 'default' as SidebarWidth,
    cardStyle: 'elevated' as CardStyle,
    fontSize: 16,
    fontFamily: 'Inter' as FontFamily,
    dashboardWallpaper: 'none' as WallpaperPreset,
    greetingMessage: '',
    widgetColorTheme: 'default' as WidgetColorTheme,
    iconStyle: 'regular' as IconStyle,
};

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            ...defaults,

            setSidebarPosition: (sidebarPosition) => set({ sidebarPosition }),
            setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
            setCardStyle: (cardStyle) => set({ cardStyle }),
            setFontSize: (fontSize) => set({ fontSize: Math.min(20, Math.max(14, fontSize)) }),
            setFontFamily: (fontFamily) => set({ fontFamily }),
            setDashboardWallpaper: (dashboardWallpaper) => set({ dashboardWallpaper }),
            setGreetingMessage: (greetingMessage) => set({ greetingMessage }),
            setWidgetColorTheme: (widgetColorTheme) => set({ widgetColorTheme }),
            setIconStyle: (iconStyle) => set({ iconStyle }),
            resetAll: () => set(defaults),
        }),
        { name: 'sisgate-preferences' }
    )
);

// ── Selectors ──────────────────────────────────────────
export const selectSidebarPosition = (s: PreferencesState) => s.sidebarPosition;
export const selectSidebarWidth = (s: PreferencesState) => s.sidebarWidth;
export const selectCardStyle = (s: PreferencesState) => s.cardStyle;
export const selectFontSize = (s: PreferencesState) => s.fontSize;
export const selectFontFamily = (s: PreferencesState) => s.fontFamily;
export const selectDashboardWallpaper = (s: PreferencesState) => s.dashboardWallpaper;
export const selectGreetingMessage = (s: PreferencesState) => s.greetingMessage;
export const selectWidgetColorTheme = (s: PreferencesState) => s.widgetColorTheme;
export const selectIconStyle = (s: PreferencesState) => s.iconStyle;

// ── Utility maps ───────────────────────────────────────
export const WALLPAPER_MAP: Record<WallpaperPreset, string> = {
    'none': '',
    'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'gradient-forest': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'gradient-lavender': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'gradient-slate': 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
};

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
    'Inter': "'Inter', sans-serif",
    'Outfit': "'Outfit', sans-serif",
    'Roboto': "'Roboto', sans-serif",
    'System': "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const SIDEBAR_WIDTH_MAP: Record<SidebarWidth, string> = {
    'narrow': '200px',
    'default': '260px',
    'wide': '320px',
};

export const WIDGET_THEME_MAP: Record<WidgetColorTheme, { bg: string; accent: string; text: string }> = {
    'default': { bg: 'bg-white', accent: '#007D88', text: 'text-slate-800' },
    'ocean': { bg: 'bg-blue-50', accent: '#2563eb', text: 'text-blue-900' },
    'forest': { bg: 'bg-emerald-50', accent: '#059669', text: 'text-emerald-900' },
    'sunset': { bg: 'bg-orange-50', accent: '#ea580c', text: 'text-orange-900' },
    'lavender': { bg: 'bg-purple-50', accent: '#7c3aed', text: 'text-purple-900' },
};
