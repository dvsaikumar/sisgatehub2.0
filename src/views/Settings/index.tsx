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
import PrivacyPolicy from './GDPR/PrivacyPolicy';
import TermsOfService from './GDPR/TermsOfService';
import DataProcessingAgreement from './GDPR/DataProcessingAgreement';
import DummyList from './DummyList';
import classNames from 'classnames';

import { Nav, Tab } from 'react-bootstrap';
import useHashTab from '../../hooks/useHashTab';

type SidebarTab = 'users' | 'documents' | 'configurations' | 'pdf_design' | 'audit-logs' | 'templates' | 'gdpr_policy' | 'terms_of_service' | 'dpa';

interface TitleMap {
    [key: string]: string;
}

const Settings: React.FC = () => {
    const [showInfo, setShowInfo] = useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(true);
    // Sub-tab validation lists
    const userTabs: string[] = ['groups', 'users', 'access_levels', 'active_sessions'];
    const docTabs: string[] = ['category', 'document', 'generate_document'];
    const configTabs: string[] = ['mail', 'ai'];

    // Sub-tab state
    const [subTab, handleSubTabSelect] = useHashTab('groups', userTabs);
    const [docTab, handleDocTabSelect] = useHashTab('category', docTabs);
    const [configTab, handleConfigTabSelect] = useHashTab('mail', configTabs);

    // Initial sidebar tab determination based on hash
    const getInitialSidebarTab = (): SidebarTab => {
        const hash = window.location.hash.replace('#', '');
        if (configTabs.includes(hash)) return 'configurations';
        if (docTabs.includes(hash)) return 'documents';
        if (userTabs.includes(hash)) return 'users';
        if (hash === 'gdpr_policy') return 'gdpr_policy';
        if (hash === 'terms_of_service') return 'terms_of_service';
        if (hash === 'dpa') return 'dpa';
        if (hash === 'templates') return 'templates';
        if (hash === 'pdf_design') return 'pdf_design';
        if (hash === 'audit-logs') return 'audit-logs';
        return 'users';
    };

    const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(getInitialSidebarTab());
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleCollapsedNav(true));

        // Synchronize sidebar when hash changes externally
        const syncSidebar = () => {
            const hash = window.location.hash.replace('#', '');
            if (configTabs.includes(hash)) setActiveSidebarTab('configurations');
            else if (docTabs.includes(hash)) setActiveSidebarTab('documents');
            else if (userTabs.includes(hash)) setActiveSidebarTab('users');
            else if (hash === 'gdpr_policy') setActiveSidebarTab('gdpr_policy');
            else if (hash === 'terms_of_service') setActiveSidebarTab('terms_of_service');
            else if (hash === 'dpa') setActiveSidebarTab('dpa');
            else if (hash === 'templates') setActiveSidebarTab('templates');
            else if (hash === 'pdf_design') setActiveSidebarTab('pdf_design');
            else if (hash === 'audit-logs') setActiveSidebarTab('audit-logs');
        };

        window.addEventListener('hashchange', syncSidebar);
        return () => {
            dispatch(toggleCollapsedNav(false));
            window.removeEventListener('hashchange', syncSidebar);
        };
    }, [dispatch]);

    const titleMap: TitleMap = {
        'users': 'Users',
        'documents': 'Documents',
        'configurations': 'Configurations',
        'pdf_design': 'PDF Design',
        'audit-logs': 'Audit Logs',
        'gdpr_policy': 'GDPR Policy',
        'terms_of_service': 'Terms of Service',
        'dpa': 'Data Processing Agreement'
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
                    (activeSidebarTab === 'documents' ? handleDocTabSelect :
                        activeSidebarTab === 'configurations' ? handleConfigTabSelect :
                            handleSubTabSelect) as any
                }
            >
                <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar }, { "fmapp-info-active": showInfo })}>
                    <SettingsSidebar activeTab={activeSidebarTab} onChangeTab={setActiveSidebarTab as any} />
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
                                        <Nav.Item>
                                            <Nav.Link eventKey="active_sessions">Active Sessions</Nav.Link>
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
                                            <Nav.Link eventKey="ai">AI</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                )}
                            </FmHeader>
                            {activeSidebarTab === 'users' && <User activeTab={subTab} />}
                            {activeSidebarTab === 'documents' && <Documents activeTab={docTab} />}
                            {activeSidebarTab === 'configurations' && <Configurations activeTab={configTab} />}

                            {activeSidebarTab === 'pdf_design' && <Configurations activeTab="pdf_design" />}
                            {activeSidebarTab === 'templates' && <Configurations activeTab="templates" />}
                            {activeSidebarTab === 'audit-logs' && <AuditLogs />}
                            {activeSidebarTab === 'gdpr_policy' && <PrivacyPolicy />}
                            {activeSidebarTab === 'terms_of_service' && <TermsOfService />}
                            {activeSidebarTab === 'dpa' && <DataProcessingAgreement />}
                            {activeSidebarTab !== 'users' && activeSidebarTab !== 'documents' && activeSidebarTab !== 'configurations' && activeSidebarTab !== 'pdf_design' && activeSidebarTab !== 'audit-logs' && activeSidebarTab !== 'templates' && activeSidebarTab !== 'gdpr_policy' && activeSidebarTab !== 'terms_of_service' && activeSidebarTab !== 'dpa' && <DummyList toggleInfo={() => setShowInfo(true)} />}

                            <FileInfo onHide={() => setShowInfo(false)} />
                        </div>
                    </div>
                </div>
            </Tab.Container>
        </div>

    )
}

export default Settings
