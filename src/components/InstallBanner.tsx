import React, { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { DownloadSimple, X } from '@phosphor-icons/react';

/**
 * InstallBanner — shown on mobile when PWA install is available.
 * Dismissible with a close button; auto-hidden once installed.
 */
const InstallBanner: React.FC = () => {
    const { canInstall, promptInstall } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(false);

    if (!canInstall || dismissed) return null;

    return (
        <>
            <style>{`
                .install-banner {
                    position: fixed;
                    bottom: 72px; /* above the mobile bottom nav */
                    left: 12px;
                    right: 12px;
                    z-index: 1050;
                    background: linear-gradient(135deg, #007D88 0%, #005f66 100%);
                    color: #fff;
                    border-radius: 14px;
                    padding: 14px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 8px 32px rgba(0, 125, 136, 0.35);
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .install-banner-text {
                    flex: 1;
                }
                .install-banner-text h4 {
                    margin: 0;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                .install-banner-text p {
                    margin: 2px 0 0;
                    font-size: 0.75rem;
                    opacity: 0.85;
                }
                .install-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255,255,255,0.2);
                    color: #fff;
                    font-weight: 600;
                    font-size: 0.8rem;
                    cursor: pointer;
                    white-space: nowrap;
                    backdrop-filter: blur(4px);
                    transition: background 0.2s;
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .install-btn:hover { background: rgba(255,255,255,0.3); }
                .install-close {
                    padding: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    border-radius: 6px;
                    min-height: 44px;
                    min-width: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .install-close:hover { color: #fff; }
            `}</style>

            <div className="install-banner">
                <div className="install-banner-text">
                    <h4>Install Sisgate Hub</h4>
                    <p>Add to home screen for a faster experience</p>
                </div>
                <button className="install-btn" onClick={promptInstall}>
                    <DownloadSimple size={16} weight="bold" />
                    Install
                </button>
                <button className="install-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
                    <X size={16} />
                </button>
            </div>
        </>
    );
};

export default InstallBanner;
