import React from 'react';
import {
    usePreferencesStore,
    type SidebarPosition,
    type SidebarWidth,
    type CardStyle,
    type FontFamily,
} from '../../../stores/preferences-store';
import { ArrowLeft, ArrowRight, TextAa, TextT } from '@phosphor-icons/react';

const LayoutOptions: React.FC = () => {
    const {
        sidebarPosition, setSidebarPosition,
        sidebarWidth, setSidebarWidth,
        cardStyle, setCardStyle,
        fontSize, setFontSize,
        fontFamily, setFontFamily,
    } = usePreferencesStore();

    return (
        <>
            <style>{`
                .layout-options { padding: 24px; max-width: 720px; }
                .pref-section { margin-bottom: 32px; }
                .pref-section h3 {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    margin-bottom: 12px;
                }
                .pref-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .pref-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border-radius: 10px;
                    border: 2px solid #e2e8f0;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #475569;
                    user-select: none;
                }
                .pref-chip:hover {
                    border-color: #007D88;
                    color: #007D88;
                }
                .pref-chip.active {
                    border-color: #007D88;
                    background: rgba(0, 125, 136, 0.06);
                    color: #007D88;
                }
                .pref-card-preview {
                    width: 80px;
                    height: 56px;
                    border-radius: 8px;
                    margin-bottom: 6px;
                }
                .card-flat { background: #f1f5f9; }
                .card-elevated { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .card-bordered { background: #fff; border: 2px solid #e2e8f0; }
                .font-slider-wrap {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    max-width: 320px;
                }
                .font-slider-wrap input[type="range"] {
                    flex: 1;
                    accent-color: #007D88;
                    height: 6px;
                }
                .font-slider-wrap .size-label {
                    font-weight: 600;
                    color: #007D88;
                    min-width: 36px;
                    text-align: center;
                }
            `}</style>

            <div className="layout-options">
                {/* Sidebar Position */}
                <div className="pref-section">
                    <h3>Sidebar Position</h3>
                    <div className="pref-row">
                        {(['left', 'right'] as SidebarPosition[]).map((pos) => (
                            <button
                                key={pos}
                                className={`pref-chip ${sidebarPosition === pos ? 'active' : ''}`}
                                onClick={() => setSidebarPosition(pos)}
                            >
                                {pos === 'left' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                                {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Width */}
                <div className="pref-section">
                    <h3>Sidebar Width</h3>
                    <div className="pref-row">
                        {(['narrow', 'default', 'wide'] as SidebarWidth[]).map((w) => (
                            <button
                                key={w}
                                className={`pref-chip ${sidebarWidth === w ? 'active' : ''}`}
                                onClick={() => setSidebarWidth(w)}
                            >
                                {w.charAt(0).toUpperCase() + w.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Card Style */}
                <div className="pref-section">
                    <h3>Card Style</h3>
                    <div className="pref-row">
                        {(['flat', 'elevated', 'bordered'] as CardStyle[]).map((style) => (
                            <button
                                key={style}
                                className={`pref-chip ${cardStyle === style ? 'active' : ''}`}
                                onClick={() => setCardStyle(style)}
                                style={{ flexDirection: 'column', alignItems: 'center', padding: '12px 20px' }}
                            >
                                <div className={`pref-card-preview card-${style}`} />
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div className="pref-section">
                    <h3>Font Size</h3>
                    <div className="font-slider-wrap">
                        <TextAa size={16} weight="bold" className="text-slate-400" />
                        <input
                            type="range"
                            min={14}
                            max={20}
                            step={1}
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                        />
                        <TextAa size={24} weight="bold" className="text-slate-400" />
                        <span className="size-label">{fontSize}px</span>
                    </div>
                </div>

                {/* Font Family */}
                <div className="pref-section">
                    <h3>Font Family</h3>
                    <div className="pref-row">
                        {(['Inter', 'Outfit', 'Roboto', 'System'] as FontFamily[]).map((f) => (
                            <button
                                key={f}
                                className={`pref-chip ${fontFamily === f ? 'active' : ''}`}
                                onClick={() => setFontFamily(f)}
                            >
                                <TextT size={18} />
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LayoutOptions;
