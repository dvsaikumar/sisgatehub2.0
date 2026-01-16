import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { useMatch } from 'react-router-dom';
import { toggleCollapsedNav } from '../../../redux/action/Theme';
import PageFooter from '../../Footer/PageFooter';
import TopNav from '../../Header/TopNav';
import Sidebar from '../../Sidebar/Sidebar';
import ResponsiveNavigation from '../../ResponsiveNavigation';
import { useWindowWidth } from '@react-hook/window-size';
import ChatBotInterface from '../../../views/ChatPopup/ChatBot/ChatBotInterface';

/**
 * ResponsiveLayout - A mobile-first responsive layout component
 * 
 * This layout automatically switches between:
 * - Mobile: Hamburger menu + Bottom navigation bar
 * - Tablet: Icon sidebar (collapsed)
 * - Desktop: Full horizontal header navigation
 * 
 * Set useResponsiveNav=true to use the new responsive navigation
 * Set useResponsiveNav=false (default) to use the classic sidebar layout
 */
const ResponsiveLayout = ({
    children,
    navCollapsed,
    topNavCollapsed,
    toggleCollapsedNav,
    maximize,
    useResponsiveNav = false // Toggle between classic and responsive navigation
}) => {

    const [dataHover, setDataHover] = useState(navCollapsed);
    const appRoutes = useMatch('/apps/*');
    const errro404Route = useMatch('/error-404');
    const dashboardRoute = useMatch("/dashboard");
    const windowWidth = useWindowWidth();

    // Determine if we should use responsive navigation based on screen size
    const isMobileOrTablet = windowWidth < 1024;
    const shouldUseResponsive = useResponsiveNav || isMobileOrTablet;

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

    // If using responsive navigation (mobile/tablet or forced)
    if (shouldUseResponsive) {
        return (
            <ResponsiveNavigation>
                {children}
            </ResponsiveNavigation>
        );
    }

    // Classic layout for desktop when not using responsive nav
    return (
        <div
            className={classNames("hk-wrapper", { "hk-pg-auth": errro404Route }, { "hk__email__backdrop": maximize }, "fixed-footer-active")}
            data-layout="vertical"
            data-layout-style={navCollapsed ? "collapsed" : "default"}
            data-navbar-style={topNavCollapsed ? "collapsed" : ""}
            data-menu="light"
            data-footer="none"
            data-hover={dataHover ? "active" : ""}
        >
            {/* Top Navbar */}
            <TopNav />
            {/* Vertical Nav */}
            <Sidebar />
            {/* Chat-bot */}
            {dashboardRoute && <ChatBotInterface show={false} />}
            <div className={classNames("hk-pg-wrapper", { "pb-0": appRoutes })}>
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

export default connect(mapStateToProps, { toggleCollapsedNav })(ResponsiveLayout)
