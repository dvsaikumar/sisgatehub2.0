/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarHeader from './SidebarHeader';
import { SidebarMenu } from './SidebarMenu';
import classNames from 'classnames';
import { useWindowWidth } from '@react-hook/window-size';

// Interfaces for Menu Data
interface MenuItem {
    id?: string;
    name: string;
    path: string;
    icon?: React.ReactNode;
    childrens?: MenuItem[];
    badge?: React.ReactNode;
    badgeIndicator?: React.ReactNode;
    iconBadge?: React.ReactNode;
    grp_name?: string;
}

interface MenuSection {
    group: string;
    contents: MenuItem[];
}

const Sidebar: React.FC = () => {
    const dispatch = useDispatch();
    const navCollapsed = useSelector((state: any) => state.theme.navCollapsed);

    const [activeMenu, setActiveMenu] = useState<string>();
    const [activeSubMenu, setActiveSubMenu] = useState<string>();

    const windowWidth = useWindowWidth();
    const location = useLocation();

    const handleClick = (menuName: string) => {
        setActiveMenu(menuName);
        if (windowWidth <= 1199) {
            dispatch(toggleCollapsedNav(false));
        }
    }

    const backDropToggle = () => {
        dispatch(toggleCollapsedNav(!navCollapsed));
    }

    return (
        <>
            <div className="hk-menu">
                {/* Brand */}
                <SidebarHeader
                    navCollapsed={navCollapsed}
                    toggleCollapsedNav={() => dispatch(toggleCollapsedNav(!navCollapsed))}
                />

                {/* Custom Compact Sidebar Styles */}
                <style>
                    {`
                    .hk-menu .menu-content-wrap {
                        padding-top: 10px;
                    }
                    .hk-menu .nav-link {
                        padding: 0.5rem 1.25rem !important;
                        min-height: 45px;
                        display: flex;
                        align-items: center;
                    }
                    .hk-menu .nav-link-text {
                        font-size: 0.95rem !important;
                        font-weight: 500;
                    }
                    .hk-menu .nav-header {
                        padding: 1rem 1.25rem 0.5rem !important;
                        font-size: 1rem !important;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        opacity: 0.9;
                    }
                    .hk-menu .nav-icon-wrap {
                        margin-right: 10px !important;
                        min-width: 20px;
                    }
                    .hk-menu .svg-icon svg {
                        width: 18px !important;
                        height: 18px !important;
                    }
                    .sidebar-divider {
                        margin: 8px 10px;
                        border-top: 1px solid rgba(0,0,0,0.1);
                        opacity: 1;
                    }
                    
                    /* Hover expansion for collapsed sidebar */
                    [data-layout-style="collapsed"] .hk-menu {
                        transition: width 0.3s ease;
                    }
                    [data-layout-style="collapsed"] .hk-menu:hover {
                        width: 260px !important;
                        box-shadow: 4px 0 20px rgba(0,0,0,0.1);
                    }
                    [data-layout-style="collapsed"] .hk-menu:hover .nav-link-text {
                        opacity: 1 !important;
                        width: auto !important;
                        display: inline-block !important;
                    }
                    [data-layout-style="collapsed"] .hk-menu:hover .menu-header {
                        padding: 1rem 1.25rem;
                    }
                    [data-layout-style="collapsed"] .hk-menu:hover .navbar-brand {
                        gap: 0.625rem;
                    }
                    [data-layout-style="collapsed"] .hk-menu:hover .brand-logo-text {
                        opacity: 1 !important;
                        width: auto !important;
                        height: 1.75rem !important;
                        margin-left: 0.25rem !important;
                    }
                    `}
                </style>

                {/* Main Menu */}
                <SimpleBar className="nicescroll-bar">
                    <div className="menu-content-wrap">
                        {(SidebarMenu as MenuSection[]).map((routes, index) => (
                            <React.Fragment key={index}>
                                <div className="menu-group" >
                                    {routes.group && <div className="nav-header">{routes.group}</div>}
                                    {routes.contents.map((menus, idx) => (
                                        <Nav bsPrefix="navbar-nav" className="flex-column" key={idx}>
                                            <Nav.Item className={classNames({ "active": location.pathname.startsWith(menus.path) })}  >
                                                {
                                                    menus.childrens
                                                        ?
                                                        <>
                                                            <Nav.Link data-bs-toggle="collapse" data-bs-target={`#${menus.id}`} aria-expanded={activeMenu === menus.name ? "true" : "false"} onClick={() => setActiveMenu(menus.name)} >
                                                                <span className={classNames("nav-icon-wrap", { "position-relative": menus.iconBadge })}>
                                                                    {menus.iconBadge && menus.iconBadge}
                                                                    <span className="svg-icon">
                                                                        {menus.icon}
                                                                    </span>
                                                                </span>
                                                                <span className={classNames("nav-link-text", { "position-relative": menus.badgeIndicator })} >
                                                                    {menus.name}
                                                                    {menus.badgeIndicator && menus.badgeIndicator}
                                                                </span>
                                                                {menus.badge && menus.badge}
                                                            </Nav.Link>

                                                            <ul id={menus.id} className={classNames("nav flex-column nav-children", { "collapse": activeMenu !== menus.name })}>
                                                                <li className="nav-item">
                                                                    <ul className="nav flex-column">
                                                                        {menus.childrens.map((subMenu, indx) => (
                                                                            subMenu.childrens
                                                                                ?
                                                                                <li className="nav-item" key={indx} >
                                                                                    <Nav.Link as={NavLink} to={subMenu.path} className="nav-link" data-bs-toggle="collapse" data-bs-target={`#${subMenu.id}`} aria-expanded={activeSubMenu === subMenu.name ? "true" : "false"} onClick={() => setActiveSubMenu(subMenu.name)}>
                                                                                        <span className="nav-link-text">
                                                                                            {subMenu.name}
                                                                                        </span>
                                                                                    </Nav.Link>

                                                                                    {subMenu.childrens.map((childrenPath, i) => (
                                                                                        <ul id={subMenu.id} className={classNames("nav flex-column nav-children", { "collapse": activeSubMenu !== subMenu.name })} key={i}>
                                                                                            <li className="nav-item">
                                                                                                <ul className="nav flex-column">
                                                                                                    <li className="nav-item">
                                                                                                        <Nav.Link as={NavLink} to={childrenPath.path} onClick={() => handleClick(childrenPath.name)}>
                                                                                                            <span className="nav-link-text">
                                                                                                                {childrenPath.name}
                                                                                                            </span>
                                                                                                        </Nav.Link>
                                                                                                    </li>
                                                                                                </ul>
                                                                                            </li>
                                                                                        </ul>
                                                                                    ))}

                                                                                </li>
                                                                                :
                                                                                <li className="nav-item" key={indx}>
                                                                                    <Nav.Link as={NavLink} to={subMenu.path} onClick={() => handleClick(subMenu.name)}>
                                                                                        <span className="nav-link-text">
                                                                                            {subMenu.name}
                                                                                        </span>
                                                                                    </Nav.Link>
                                                                                </li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            </ul>

                                                        </>
                                                        :
                                                        <>
                                                            <Nav.Link as={NavLink} to={menus.path} onClick={() => handleClick(menus.name)} >
                                                                <span className="nav-icon-wrap">
                                                                    <span className="svg-icon">
                                                                        {menus.icon}
                                                                    </span>
                                                                </span>
                                                                <span className="nav-link-text">{menus.name}</span>
                                                                {menus.badge && menus.badge}
                                                            </Nav.Link>
                                                        </>
                                                }
                                            </Nav.Item>
                                        </Nav>
                                    ))}
                                </div>
                                {index < SidebarMenu.length - 1 && <hr className="sidebar-divider" />}
                            </React.Fragment>
                        ))}

                    </div>
                </SimpleBar>
                {/* /Main Menu */}
            </div >
            <div
                className={classNames("hk-menu-backdrop", { "active": !navCollapsed })}
                onClick={backDropToggle}
            />
        </>
    )
}

export default Sidebar;
