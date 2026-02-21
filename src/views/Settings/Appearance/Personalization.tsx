import React from 'react';
import {
    usePreferencesStore,
    WALLPAPER_MAP,
    type WallpaperPreset,
    type WidgetColorTheme,
    type IconStyle,
} from '../../../stores/preferences-store';
import { PaintBrush, SunHorizon, Palette, Shapes } from '@phosphor-icons/react';

const Personalization: React.FC = () => {
    const {
        dashboardWallpaper, setDashboardWallpaper,
        greetingMessage, setGreetingMessage,
        widgetColorTheme, setWidgetColorTheme,
        iconStyle, setIconStyle,
    } = usePreferencesStore();

    const wallpaperOptions: { key: WallpaperPreset; label: string }[] = [
        { key: 'none', label: 'None' },
        { key: 'gradient-ocean', label: 'Ocean' },
        { key: 'gradient-sunset', label: 'Sunset' },
        { key: 'gradient-forest', label: 'Forest' },
        { key: 'gradient-lavender', label: 'Lavender' },
        { key: 'gradient-slate', label: 'Slate' },
    ];

    const widgetThemeOptions: { key: WidgetColorTheme; label: string; color: string }[] = [
        { key: 'default', label: 'Default', color: '#007D88' },
        { key: 'ocean', label: 'Ocean', color: '#2563eb' },
        { key: 'forest', label: 'Forest', color: '#059669' },
        { key: 'sunset', label: 'Sunset', color: '#ea580c' },
        { key: 'lavender', label: 'Lavender', color: '#7c3aed' },
    ];

    const iconStyleOptions: { key: IconStyle; label: string }[] = [
        { key: 'regular', label: 'Regular' },
        { key: 'bold', label: 'Bold' },
        { key: 'duotone', label: 'Duotone' },
        { key: 'fill', label: 'Filled' },
    ];

    return (
        <>
            <style>{`
                .personalization { padding: 24px; max-width: 720px; }
                .pref-section { margin-bottom: 32px; }
                .pref-section h3 {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    margin-bottom: 12px;
                }
                .pref-row { display: flex; gap: 10px; flex-wrap: wrap; }
                .wallpaper-chip {
                    width: 80px;
                    height: 56px;
                    border-radius: 10px;
                    cursor: pointer;
                    border: 3px solid transparent;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding-bottom: 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: #fff;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                .wallpaper-chip.none-bg {
                    background: #f1f5f9;
                    color: #64748b;
                    text-shadow: none;
                }
                .wallpaper-chip:hover { transform: scale(1.05); }
                .wallpaper-chip.active { border-color: #007D88; transform: scale(1.05); }
                .theme-dot {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 3px solid transparent;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .theme-dot:hover { transform: scale(1.1); }
                .theme-dot.active { border-color: #334155; transform: scale(1.1); }
                .theme-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                }
                .theme-label span {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .greeting-input {
                    width: 100%;
                    max-width: 400px;
                    padding: 10px 14px;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .greeting-input:focus { border-color: #007D88; }
                .greeting-hint {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 6px;
                }
                .pref-chip {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 18px; border-radius: 10px;
                    border: 2px solid #e2e8f0; background: #fff;
                    cursor: pointer; transition: all 0.2s ease;
                    font-size: 0.875rem; font-weight: 500; color: #475569;
                    user-select: none;
                }
                .pref-chip:hover { border-color: #007D88; color: #007D88; }
                .pref-chip.active {
                    border-color: #007D88;
                    background: rgba(0, 125, 136, 0.06);
                    color: #007D88;
                }
            `}</style>

            <div className="personalization">
                {/* Dashboard Wallpaper */}
                <div className="pref-section">
                    <h3><PaintBrush size={14} weight="bold" style={{ display: 'inline', marginRight: 6 }} />Dashboard Wallpaper</h3>
                    <div className="pref-row">
                        {wallpaperOptions.map((w) => (
                            <div
                                key={w.key}
                                className={`wallpaper-chip ${dashboardWallpaper === w.key ? 'active' : ''} ${w.key === 'none' ? 'none-bg' : ''}`}
                                style={w.key !== 'none' ? { background: WALLPAPER_MAP[w.key] } : undefined}
                                onClick={() => setDashboardWallpaper(w.key)}
                            >
                                {w.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Greeting Message */}
                <div className="pref-section">
                    <h3><SunHorizon size={14} weight="bold" style={{ display: 'inline', marginRight: 6 }} />Greeting Message</h3>
                    <input
                        className="greeting-input"
                        type="text"
                        value={greetingMessage}
                        onChange={(e) => setGreetingMessage(e.target.value)}
                        placeholder="e.g. Welcome back, Boss!"
                    />
                    <p className="greeting-hint">Leave empty for automatic time‑based greeting (Good Morning, Good Afternoon...)</p>
                </div>

                {/* Widget Color Theme */}
                <div className="pref-section">
                    <h3><Palette size={14} weight="bold" style={{ display: 'inline', marginRight: 6 }} />Widget Color Theme</h3>
                    <div className="pref-row">
                        {widgetThemeOptions.map((t) => (
                            <div key={t.key} className="theme-label" onClick={() => setWidgetColorTheme(t.key)}>
                                <div
                                    className={`theme-dot ${widgetColorTheme === t.key ? 'active' : ''}`}
                                    style={{ backgroundColor: t.color }}
                                />
                                <span>{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Icon Style */}
                <div className="pref-section">
                    <h3><Shapes size={14} weight="bold" style={{ display: 'inline', marginRight: 6 }} />Icon Style</h3>
                    <div className="pref-row">
                        {iconStyleOptions.map((opt) => (
                            <button
                                key={opt.key}
                                className={`pref-chip ${iconStyle === opt.key ? 'active' : ''}`}
                                onClick={() => setIconStyle(opt.key)}
                            >
                                <Shapes size={18} weight={opt.key as any} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Personalization;
