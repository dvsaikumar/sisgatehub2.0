import React from 'react';
import { Nav } from 'react-bootstrap';
import { FileText, Gear, Shield, User, Article, Sliders, FilePdf } from '@phosphor-icons/react';
import SimpleBar from 'simplebar-react';

const SettingsSidebar = ({ activeTab, onChangeTab }) => {
    return (
        <nav className="fmapp-sidebar">
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
                                <a className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('templates'); }}>
                                    <span className="nav-icon-wrap">
                                        <FileText />
                                    </span>
                                    <span className="nav-link-text">Templates</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'pdf_design' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('pdf_design'); }}>
                                    <span className="nav-icon-wrap">
                                        <FilePdf />
                                    </span>
                                    <span className="nav-link-text">PDF Design</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'audit-logs' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('audit-logs'); }}>
                                    <span className="nav-icon-wrap">
                                        <Shield />
                                    </span>
                                    <span className="nav-link-text">Audit Logs</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${activeTab === 'system-settings' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onChangeTab('system-settings'); }}>
                                    <span className="nav-icon-wrap">
                                        <Gear />
                                    </span>
                                    <span className="nav-link-text">System Settings</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </SimpleBar>
        </nav>
    )
}

export default SettingsSidebar;
