import React from 'react';
import LayoutOptions from './LayoutOptions';
import Personalization from './Personalization';
import { usePreferencesStore } from '../../../stores/preferences-store';
import { ArrowCounterClockwise } from '@phosphor-icons/react';

interface AppearanceProps {
    activeTab: string;
}

const Appearance: React.FC<AppearanceProps> = ({ activeTab }) => {
    const resetAll = usePreferencesStore((s) => s.resetAll);

    return (
        <>
            <style>{`
                .appearance-wrap {
                    padding: 0;
                    min-height: 400px;
                }
                .appearance-reset {
                    display: flex;
                    justify-content: flex-end;
                    padding: 16px 24px 0 24px;
                }
                .reset-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .reset-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                    background: #fef2f2;
                }
            `}</style>

            <div className="appearance-wrap">
                <div className="appearance-reset">
                    <button className="reset-btn" onClick={resetAll}>
                        <ArrowCounterClockwise size={16} />
                        Reset to Defaults
                    </button>
                </div>

                {activeTab === 'layout' && <LayoutOptions />}
                {activeTab === 'personalization' && <Personalization />}
            </div>
        </>
    );
};

export default Appearance;
