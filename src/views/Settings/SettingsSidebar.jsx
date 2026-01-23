import React from 'react';
import { Nav } from 'react-bootstrap';
import { FileText, Gear, Shield, User, Article, Sliders, FilePdf } from '@phosphor-icons/react';
import SimpleBar from 'simplebar-react';

const SettingsSidebar = ({ activeTab, onChangeTab }) => {
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
                `}
            </style>
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    <div className="menu-group">
                        <ul className="nav nav-light navbar-nav flex-column">
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('users'); }}>
                                    <span className="nav-icon-wrap">
                                        <User />
                                    </span>
                                    <span className="nav-link-text">Users</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('documents'); }}>
                                    <span className="nav-icon-wrap">
                                        <Article />
                                    </span>
                                    <span className="nav-link-text">Documents</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'configurations' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('configurations'); }}>
                                    <span className="nav-icon-wrap">
                                        <Sliders />
                                    </span>
                                    <span className="nav-link-text">Configurations</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${(activeTab === 'system-settings' || activeTab === 'templates' || activeTab === 'pdf_design' || activeTab === 'audit-logs') ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const collapse = document.getElementById('system-settings-collapse');
                                        if (collapse) {
                                            collapse.classList.toggle('show');
                                            e.currentTarget.setAttribute('aria-expanded', e.currentTarget.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
                                        }
                                    }}
                                    data-bs-toggle="collapse"
                                    data-bs-target="#system-settings-collapse"
                                    aria-expanded={activeTab === 'templates' || activeTab === 'pdf_design' || activeTab === 'audit-logs'}
                                >
                                    <span className="nav-icon-wrap">
                                        <Gear />
                                    </span>
                                    <span className="nav-link-text">System Settings</span>
                                </a>
                                <div className={`collapse ${(activeTab === 'templates' || activeTab === 'pdf_design' || activeTab === 'audit-logs') ? 'show' : ''}`} id="system-settings-collapse">
                                    <ul className="nav nav-light navbar-nav flex-column ms-3">
                                        <li className="nav-item">
                                            <a className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('templates'); }}>
                                                <span className="nav-icon-wrap">
                                                    <FileText size={16} />
                                                </span>
                                                <span className="nav-link-text">Templates</span>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={`nav-link ${activeTab === 'pdf_design' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('pdf_design'); }}>
                                                <span className="nav-icon-wrap">
                                                    <FilePdf size={16} />
                                                </span>
                                                <span className="nav-link-text">PDF Design</span>
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a className={`nav-link ${activeTab === 'audit-logs' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('audit-logs'); }}>
                                                <span className="nav-icon-wrap">
                                                    <Shield size={16} />
                                                </span>
                                                <span className="nav-link-text">Audit Logs</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </SimpleBar>
        </nav>
    )
}

export default SettingsSidebar;
