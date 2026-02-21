import React, { useState, useEffect } from 'react';
import { FileText, Gear, Shield, User, Article, Sliders, FilePdf, Palette, Robot, CheckSquare, Lightbulb, GraduationCap, Warning } from '@phosphor-icons/react';
import SimpleBar from 'simplebar-react';

const SettingsSidebar = ({ activeTab, onChangeTab }) => {
    // State to manage the collapse of menu groups
    // Initialize open if the active tab belongs to the group
    const [isSystemSettingsOpen, setSystemSettingsOpen] = useState(
        ['templates', 'pdf_design', 'audit-logs'].includes(activeTab) || activeTab === 'system-settings'
    );
    const [isAppearanceOpen, setAppearanceOpen] = useState(
        ['layout', 'personalization'].includes(activeTab)
    );
    const [isLegalOpen, setLegalOpen] = useState(
        ['gdpr_policy', 'terms_of_service', 'dpa'].includes(activeTab)
    );
    const [isAIOpen, setAIOpen] = useState(
        ['ai_acceptable_use', 'ai_data_handling', 'ai_training', 'ai_vendor', 'ai_privacy', 'ai_transparency', 'eu_ai_act', 'ai_legal', 'ai_incident', 'ai_strategy'].includes(activeTab)
    );

    // Sync state with activeTab changes (e.g. if loaded via URL)
    useEffect(() => {
        if (['templates', 'pdf_design', 'audit-logs'].includes(activeTab)) {
            setSystemSettingsOpen(true);
        }
        if (['gdpr_policy', 'terms_of_service', 'dpa'].includes(activeTab)) {
            setLegalOpen(true);
        }
        if (['layout', 'personalization'].includes(activeTab)) {
            setAppearanceOpen(true);
        }
        if (['ai_acceptable_use', 'ai_data_handling', 'ai_training', 'ai_vendor', 'ai_privacy', 'ai_transparency', 'eu_ai_act', 'ai_legal', 'ai_incident', 'ai_strategy'].includes(activeTab)) {
            setAIOpen(true);
        }
    }, [activeTab]);

    return (
        <nav className="fmapp-sidebar">
            <style>
                {`
                .fmapp-sidebar .menu-content-wrap {
                    padding-top: 10px;
                }
                .fmapp-sidebar .nav-link {
                    padding: 0.35rem 1.25rem !important;
                    min-height: 38px;
                    display: flex;
                    align-items: center;
                    color: #5e7d8a !important; /* Force dark text color */
                    cursor: pointer;
                    margin-bottom: 4px;
                }
                .fmapp-sidebar .nav-link:hover {
                    color: #007D88 !important;
                }
                .fmapp-sidebar .nav-link.active {
                    color: #007D88 !important;
                    background-color: rgba(0, 125, 136, 0.08) !important;
                    border-radius: 8px;
                    font-weight: 600 !important;
                }
                .fmapp-sidebar .nav-link.active .nav-icon-wrap {
                    color: #007D88 !important;
                }
                .fmapp-sidebar .nav-link-text {
                    font-size: 0.85rem !important;
                    font-weight: 500;
                }
                .fmapp-sidebar .nav-icon-wrap {
                    margin-right: 10px !important;
                    min-width: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .fmapp-sidebar .nav-icon-wrap svg {
                    width: 18px !important;
                    height: 18px !important;
                }
                .sidebar-divider {
                    margin: 8px 10px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    opacity: 1;
                }
                /* Sub-menu styling */
                .fmapp-sidebar .sub-menu {
                    padding-left: 1rem;
                }
                .fmapp-sidebar .sub-menu .nav-link {
                    font-size: 0.8rem !important;
                }
                `}
            </style>
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    <div className="menu-group">
                        <ul className="nav nav-light navbar-nav flex-column">
                            {/* Users */}
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('users'); }}>
                                    <span className="nav-icon-wrap">
                                        <User />
                                    </span>
                                    <span className="nav-link-text">Users</span>
                                </a>
                            </li>

                            {/* Documents */}
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('documents'); }}>
                                    <span className="nav-icon-wrap">
                                        <Article />
                                    </span>
                                    <span className="nav-link-text">Documents</span>
                                </a>
                            </li>

                            {/* Configurations */}
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'configurations' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('configurations'); }}>
                                    <span className="nav-icon-wrap">
                                        <Sliders />
                                    </span>
                                    <span className="nav-link-text">Configurations</span>
                                </a>
                            </li>

                            {/* System Settings */}
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${(activeTab === 'system-settings' || activeTab === 'templates' || activeTab === 'pdf_design' || activeTab === 'audit-logs') ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSystemSettingsOpen(!isSystemSettingsOpen);
                                    }}
                                    aria-expanded={isSystemSettingsOpen}
                                >
                                    <span className="nav-icon-wrap">
                                        <Gear />
                                    </span>
                                    <span className="nav-link-text">System Settings</span>
                                </a>
                                {isSystemSettingsOpen && (
                                    <div className="sub-menu">
                                        <ul className="nav navbar-nav flex-column">
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('templates'); }}>
                                                    <span className="nav-icon-wrap">
                                                        <FileText size={16} />
                                                    </span>
                                                    <span className="nav-link-text">Templates</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'pdf_design' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('pdf_design'); }}>
                                                    <span className="nav-icon-wrap">
                                                        <FilePdf size={16} />
                                                    </span>
                                                    <span className="nav-link-text">PDF Design</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'audit-logs' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('audit-logs'); }}>
                                                    <span className="nav-icon-wrap">
                                                        <Shield size={16} />
                                                    </span>
                                                    <span className="nav-link-text">Audit Logs</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>

                            {/* Appearance */}
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${(['layout', 'personalization'].includes(activeTab)) ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAppearanceOpen(!isAppearanceOpen);
                                    }}
                                    aria-expanded={isAppearanceOpen}
                                >
                                    <span className="nav-icon-wrap">
                                        <Palette />
                                    </span>
                                    <span className="nav-link-text">Appearance</span>
                                </a>
                                {isAppearanceOpen && (
                                    <div className="sub-menu">
                                        <ul className="nav navbar-nav flex-column">
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'layout' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('layout'); }}>
                                                    <span className="nav-icon-wrap">
                                                        <Sliders size={16} />
                                                    </span>
                                                    <span className="nav-link-text">Layout Options</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'personalization' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onChangeTab('personalization'); }}>
                                                    <span className="nav-icon-wrap">
                                                        <Palette size={16} />
                                                    </span>
                                                    <span className="nav-link-text">Personalization</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>

                            <li className="nav-item">
                                <div className="sidebar-divider"></div>
                            </li>

                            {/* AI Compliance */}
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${(activeTab.startsWith('ai_') || activeTab === 'eu_ai_act') ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAIOpen(!isAIOpen);
                                    }}
                                    aria-expanded={isAIOpen}
                                >
                                    <span className="nav-icon-wrap">
                                        <Robot />
                                    </span>
                                    <span className="nav-link-text">AI Compliance</span>
                                </a>
                                {isAIOpen && (
                                    <div className="sub-menu">
                                        <ul className="nav navbar-nav flex-column">
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_acceptable_use' ? 'active' : ''}`} href="#ai_acceptable_use" onClick={(e) => { e.preventDefault(); onChangeTab('ai_acceptable_use'); }}>
                                                    <span className="nav-icon-wrap"><FileText size={16} /></span>
                                                    <span className="nav-link-text">Acceptable Use</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_data_handling' ? 'active' : ''}`} href="#ai_data_handling" onClick={(e) => { e.preventDefault(); onChangeTab('ai_data_handling'); }}>
                                                    <span className="nav-icon-wrap"><Shield size={16} /></span>
                                                    <span className="nav-link-text">Data Handling</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_training' ? 'active' : ''}`} href="#ai_training" onClick={(e) => { e.preventDefault(); onChangeTab('ai_training'); }}>
                                                    <span className="nav-icon-wrap"><GraduationCap size={16} /></span>
                                                    <span className="nav-link-text">Training Record</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_vendor' ? 'active' : ''}`} href="#ai_vendor" onClick={(e) => { e.preventDefault(); onChangeTab('ai_vendor'); }}>
                                                    <span className="nav-icon-wrap"><CheckSquare size={16} /></span>
                                                    <span className="nav-link-text">Vendor Checklist</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'eu_ai_act' ? 'active' : ''}`} href="#eu_ai_act" onClick={(e) => { e.preventDefault(); onChangeTab('eu_ai_act'); }}>
                                                    <span className="nav-icon-wrap"><CheckSquare size={16} /></span>
                                                    <span className="nav-link-text">EU AI Act</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_privacy' ? 'active' : ''}`} href="#ai_privacy" onClick={(e) => { e.preventDefault(); onChangeTab('ai_privacy'); }}>
                                                    <span className="nav-icon-wrap"><FileText size={16} /></span>
                                                    <span className="nav-link-text">Privacy Notice</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_transparency' ? 'active' : ''}`} href="#ai_transparency" onClick={(e) => { e.preventDefault(); onChangeTab('ai_transparency'); }}>
                                                    <span className="nav-icon-wrap"><FileText size={16} /></span>
                                                    <span className="nav-link-text">Transparency</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_legal' ? 'active' : ''}`} href="#ai_legal" onClick={(e) => { e.preventDefault(); onChangeTab('ai_legal'); }}>
                                                    <span className="nav-icon-wrap"><FileText size={16} /></span>
                                                    <span className="nav-link-text">Legal Clauses</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_incident' ? 'active' : ''}`} href="#ai_incident" onClick={(e) => { e.preventDefault(); onChangeTab('ai_incident'); }}>
                                                    <span className="nav-icon-wrap"><Warning size={16} /></span>
                                                    <span className="nav-link-text">Incident Response</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'ai_strategy' ? 'active' : ''}`} href="#ai_strategy" onClick={(e) => { e.preventDefault(); onChangeTab('ai_strategy'); }}>
                                                    <span className="nav-icon-wrap"><Lightbulb size={16} /></span>
                                                    <span className="nav-link-text">Strategy</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>

                            <li className="nav-item">
                                <div className="sidebar-divider"></div>
                            </li>

                            {/* Legal & Compliance */}
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${(activeTab === 'gdpr_policy') ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setLegalOpen(!isLegalOpen);
                                    }}
                                    aria-expanded={isLegalOpen}
                                >
                                    <span className="nav-icon-wrap">
                                        <Shield />
                                    </span>
                                    <span className="nav-link-text">Legal & Compliance</span>
                                </a>
                                {isLegalOpen && (
                                    <div className="sub-menu">
                                        <ul className="nav navbar-nav flex-column">
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'gdpr_policy' ? 'active' : ''}`} href="#gdpr_policy" onClick={(e) => { e.preventDefault(); onChangeTab('gdpr_policy'); window.location.hash = 'gdpr_policy'; }}>
                                                    <span className="nav-icon-wrap">
                                                        <FileText size={16} />
                                                    </span>
                                                    <span className="nav-link-text">GDPR Policy</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'terms_of_service' ? 'active' : ''}`} href="#terms_of_service" onClick={(e) => { e.preventDefault(); onChangeTab('terms_of_service'); window.location.hash = 'terms_of_service'; }}>
                                                    <span className="nav-icon-wrap">
                                                        <FileText size={16} />
                                                    </span>
                                                    <span className="nav-link-text">Terms of Service</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={`nav-link ${activeTab === 'dpa' ? 'active' : ''}`} href="#dpa" onClick={(e) => { e.preventDefault(); onChangeTab('dpa'); window.location.hash = 'dpa'; }}>
                                                    <span className="nav-icon-wrap">
                                                        <FileText size={16} />
                                                    </span>
                                                    <span className="nav-link-text">DPA</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </SimpleBar>
        </nav >
    )
}

export default SettingsSidebar;
