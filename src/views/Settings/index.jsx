import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import FmHeader from '../FileManager/FmHeader';
import SettingsSidebar from './SettingsSidebar';
import FileInfo from '../FileManager/FileInfo';
import User from './User/User';
import Documents from './Documents/Documents';
import Configurations from './Configurations/Configurations';
import AuditLogs from '../AuditLogs';
import DummyList from './DummyList';
import classNames from 'classnames';

import { Nav, Tab } from 'react-bootstrap';
import useHashTab from '../../hooks/useHashTab';

const Settings = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    // Sub-tab validation lists
    const userTabs = ['groups', 'users', 'access_levels'];
    const docTabs = ['category', 'document', 'generate_document'];
    const configTabs = ['mail', 'templates', 'pdf_design', 'ai'];

    // Sub-tab state
    const [subTab, handleSubTabSelect] = useHashTab('groups', userTabs);
    const [docTab, handleDocTabSelect] = useHashTab('category', docTabs);
    const [configTab, handleConfigTabSelect] = useHashTab('mail', configTabs);

    // Initial sidebar tab determination based on hash
    const getInitialSidebarTab = () => {
        const hash = window.location.hash.replace('#', '');
        if (configTabs.includes(hash)) return 'configurations';
        if (docTabs.includes(hash)) return 'documents';
        if (userTabs.includes(hash)) return 'users';
        return 'users';
    };

    const [activeSidebarTab, setActiveSidebarTab] = useState(getInitialSidebarTab());
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleCollapsedNav(true));

        // Synchronize sidebar when hash changes externally
        const syncSidebar = () => {
            const hash = window.location.hash.replace('#', '');
            if (configTabs.includes(hash)) setActiveSidebarTab('configurations');
            else if (docTabs.includes(hash)) setActiveSidebarTab('documents');
            else if (userTabs.includes(hash)) setActiveSidebarTab('users');
        };

        window.addEventListener('hashchange', syncSidebar);
        return () => {
            dispatch(toggleCollapsedNav(false));
            window.removeEventListener('hashchange', syncSidebar);
        };
    }, [dispatch]);

    const titleMap = {
        'users': 'Users',
        'documents': 'Documents',
        'configurations': 'Configurations',
        'pdf_design': 'PDF Design',
        'audit-logs': 'Audit Logs'
    };

    return (
        <div className="hk-pg-body py-0">
            <Tab.Container
                activeKey={
                    activeSidebarTab === 'documents' ? docTab :
                        activeSidebarTab === 'configurations' ? configTab :
                            subTab
                }
                onSelect={
                    activeSidebarTab === 'documents' ? handleDocTabSelect :
                        activeSidebarTab === 'configurations' ? handleConfigTabSelect :
                            handleSubTabSelect
                }
            >
                <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar }, { "fmapp-info-active": showInfo })}>
                    <SettingsSidebar activeTab={activeSidebarTab} onChangeTab={setActiveSidebarTab} />
                    <div className="fmapp-content">
                        <div className="fmapp-detail-wrap">
                            <FmHeader
                                title={titleMap[activeSidebarTab] || 'Settings'}
                                toggleSidebar={() => setShowSidebar(!showSidebar)}
                                showSidebar={showSidebar}
                                showInfo={showInfo}
                                toggleInfo={() => setShowInfo(!showInfo)}
                            >
                                {activeSidebarTab === 'users' && (
                                    <Nav variant="pills" className="nav-light ms-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="groups">Groups</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="users">Users</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="access_levels">Access Levels</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                )}
                                {activeSidebarTab === 'documents' && (
                                    <Nav variant="pills" className="nav-light ms-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="category">Category</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="document">Document</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="generate_document">Generate Document</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                )}
                                {activeSidebarTab === 'configurations' && (
                                    <Nav variant="pills" className="nav-light ms-3">
                                        <Nav.Item>
                                            <Nav.Link eventKey="mail">Mail</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="templates">Templates</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="pdf_design">PDF Design</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="ai">AI</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                )}
                            </FmHeader>
                            {activeSidebarTab === 'users' && <User activeTab={subTab} />}
                            {activeSidebarTab === 'documents' && <Documents activeTab={docTab} />}
                            {activeSidebarTab === 'configurations' && <Configurations activeTab={configTab} />}

                            {activeSidebarTab === 'pdf_design' && <Configurations activeTab="pdf_design" />}
                            {activeSidebarTab === 'audit-logs' && <AuditLogs />}
                            {activeSidebarTab !== 'users' && activeSidebarTab !== 'documents' && activeSidebarTab !== 'configurations' && activeSidebarTab !== 'pdf_design' && activeSidebarTab !== 'audit-logs' && <DummyList toggleInfo={() => setShowInfo(true)} />}

                            <FileInfo onHide={() => setShowInfo(false)} />
                        </div>
                    </div>
                </div>
            </Tab.Container>
        </div>

    )
}

export default Settings
