import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { useMatch } from 'react-router-dom';
import { toggleCollapsedNav } from '../../../redux/action/Theme';
import PageFooter from '../../Footer/PageFooter';
import TopNav from '../../Header/TopNav';
import Sidebar from '../../Sidebar/Sidebar.tsx';
import { useWindowWidth } from '@react-hook/window-size';
import ChatBotInterface from '../../../views/ChatPopup/ChatBot/ChatBotInterface';
import ResponsiveNavigation from '../../ResponsiveNavigation';
import { usePreferencesStore, FONT_FAMILY_MAP, SIDEBAR_WIDTH_MAP } from '../../../stores/preferences-store';

const LayoutClassic = ({ children, navCollapsed, topNavCollapsed, toggleCollapsedNav, maximize }) => {

    const [dataHover, setDataHover] = useState(navCollapsed);
    const appRoutes = useMatch('/apps/*');
    const errro404Route = useMatch('/error-404');
    const dashboardRoute = useMatch("/dashboard");
    const windowWidth = useWindowWidth();

    // Preferences
    const sidebarPosition = usePreferencesStore((s) => s.sidebarPosition);
    const fontSize = usePreferencesStore((s) => s.fontSize);
    const fontFamily = usePreferencesStore((s) => s.fontFamily);
    const sidebarWidth = usePreferencesStore((s) => s.sidebarWidth);
    const cardStyle = usePreferencesStore((s) => s.cardStyle);

    // Use responsive navigation for mobile/tablet (< 1024px)
    const useResponsiveNav = windowWidth < 1024;

    useEffect(() => {
        if (appRoutes && windowWidth >= 1200) {
            toggleCollapsedNav(true);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth, appRoutes])

    useEffect(() => {
        setTimeout(() => {
            setDataHover(navCollapsed);
        }, 250);
    }, [navCollapsed]);

    // Mobile/Tablet: Use new responsive navigation with hamburger + bottom bar
    if (useResponsiveNav) {
        return (
            <ResponsiveNavigation>
                {children}
            </ResponsiveNavigation>
        );
    }

    // Desktop: Use classic sidebar layout
    return (
        <div
            className={classNames("hk-wrapper", { "hk-pg-auth": errro404Route }, { "hk__email__backdrop": maximize }, "fixed-footer-active")}
            data-layout="vertical"
            data-layout-style={navCollapsed ? "collapsed" : "default"}
            data-navbar-style={topNavCollapsed ? "collapsed" : ""}
            data-menu="light"
            data-footer="none"
            data-hover={dataHover ? "active" : ""}
            data-sidebar-position={sidebarPosition}
            data-card-style={cardStyle}
            style={{
                fontSize: `${fontSize}px`,
                fontFamily: FONT_FAMILY_MAP[fontFamily],
                '--sidebar-width': SIDEBAR_WIDTH_MAP[sidebarWidth],
                direction: sidebarPosition === 'right' ? 'rtl' : 'ltr',
            }}
        >
            {/* Top Navbar */}
            <TopNav />
            {/* Vertical Nav */}
            <Sidebar />
            {/* Chat-bot */}
            {dashboardRoute && <ChatBotInterface show={false} />}
            <div className={classNames("hk-pg-wrapper", { "pb-0": appRoutes })} style={{ direction: 'ltr' }}>
                {children}
                {!appRoutes && <PageFooter />}
            </div>
        </div>
    )
}

const mapStateToProps = ({ theme, emailReducer }) => {
    const { navCollapsed, topNavCollapsed } = theme;
    const { maximize } = emailReducer
    return { navCollapsed, topNavCollapsed, maximize }
};

export default connect(mapStateToProps, { toggleCollapsedNav })(LayoutClassic)
