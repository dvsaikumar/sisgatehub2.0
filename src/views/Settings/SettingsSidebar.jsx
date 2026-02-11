import React, { useState, useEffect } from 'react';
import { FileText, Gear, Shield, User, Article, Sliders, FilePdf } from '@phosphor-icons/react';
import SimpleBar from 'simplebar-react';

const SettingsSidebar = ({ activeTab, onChangeTab }) => {
    // State to manage the collapse of menu groups
    // Initialize open if the active tab belongs to the group
    const [isSystemSettingsOpen, setSystemSettingsOpen] = useState(
        ['templates', 'pdf_design', 'audit-logs'].includes(activeTab) || activeTab === 'system-settings'
    );
    const [isLegalOpen, setLegalOpen] = useState(
        ['gdpr_policy', 'terms_of_service', 'dpa'].includes(activeTab)
    );

    // Sync state with activeTab changes (e.g. if loaded via URL)
    useEffect(() => {
        if (['templates', 'pdf_design', 'audit-logs'].includes(activeTab)) {
            setSystemSettingsOpen(true);
        }
        if (['gdpr_policy', 'terms_of_service', 'dpa'].includes(activeTab)) {
            setLegalOpen(true);
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
                }
                .fmapp-sidebar .nav-link:hover {
                    color: #007D88 !important;
                }
                .fmapp-sidebar .nav-link.active {
                    color: #007D88 !important;
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
