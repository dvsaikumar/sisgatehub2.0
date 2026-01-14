import React from 'react';
import { Nav } from 'react-bootstrap';
import { FileText, Settings, Shield, Users } from 'react-feather';
import SimpleBar from 'simplebar-react';

const SettingsSidebar = () => {
    return (
        <nav className="fmapp-sidebar">
            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    <div className="menu-group">
                        <ul className="nav nav-light navbar-nav flex-column">
                            <li className="nav-item">
                                <a className="nav-link" href="#users">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon">
                                            <Users />
                                        </span>
                                    </span>
                                    <span className="nav-link-text">Users</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#templates">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon">
                                            <FileText />
                                        </span>
                                    </span>
                                    <span className="nav-link-text">Templates</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#audit-logs">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon">
                                            <Shield />
                                        </span>
                                    </span>
                                    <span className="nav-link-text">Audit Logs</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#system-settings">
                                    <span className="nav-icon-wrap">
                                        <span className="feather-icon">
                                            <Settings />
                                        </span>
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
