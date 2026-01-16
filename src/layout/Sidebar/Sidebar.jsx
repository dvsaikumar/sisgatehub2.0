/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Button, Card, Nav } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarHeader from './SidebarHeader';
import { SidebarMenu } from './SidebarMenu';
import classNames from 'classnames';
import { useWindowWidth } from '@react-hook/window-size';

const Sidebar = ({ navCollapsed, toggleCollapsedNav }) => {

    const [activeMenu, setActiveMenu] = useState();
    const [activeSubMenu, setActiveSubMenu] = useState();

    const windowWidth = useWindowWidth();
    const location = useLocation();

    const handleClick = (menuName) => {
        setActiveMenu(menuName);
        if (windowWidth <= 1199) {
            toggleCollapsedNav(false);
        }
        // if (activeMenu !== 'Dashboard' && windowWidth >= 1200) {
        //     toggleCollapsedNav(true);
        // }
        // else if (windowWidth <= 1199) {
        //     toggleCollapsedNav(false);
        // }

        // if (menuName === 'Dashboard') {
        //     toggleCollapsedNav(false);
        // }
    }

    const backDropToggle = () => {
        toggleCollapsedNav(!navCollapsed);
    }

    return (
        <>
            <div className="hk-menu">
                {/* Brand */}
                <SidebarHeader />
                {/* Custom Compact Sidebar Styles */}
                <style>
                    {`
                    .hk-menu .menu-content-wrap {
                        padding-top: 10px;
                    }
                    .hk-menu .nav-link {
                        padding: 0.35rem 1.25rem !important;
                        min-height: 38px;
                        display: flex;
                        align-items: center;
                    }
                    .hk-menu .nav-link-text {
                        font-size: 0.85rem !important;
                        font-weight: 500;
                    }
                    .hk-menu .nav-header {
                        padding: 0.75rem 1.25rem 0.25rem !important;
                        font-size: 0.7rem !important;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        opacity: 0.7;
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
                        {SidebarMenu.map((routes, index) => (
                            <React.Fragment key={index}>
                                <div className="menu-group" >
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

                                                            {/* <Collapse in={open}> */}
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
                                                                                                        <Nav.Link as={NavLink} to={childrenPath.path} onClick={handleClick}>
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
                                                                                    <Nav.Link as={NavLink} to={subMenu.path} onClick={handleClick}>
                                                                                        <span className="nav-link-text">
                                                                                            {subMenu.name}
                                                                                        </span>
                                                                                    </Nav.Link>
                                                                                </li>
                                                                        ))}
                                                                    </ul>
                                                                </li>
                                                            </ul>
                                                            {/* </Collapse> */}

                                                        </>
                                                        :
                                                        <>
                                                            {
                                                                (routes.group === "Documentation")
                                                                    ?
                                                                    <a className="nav-link" href={menus.path}  >
                                                                        <span className="nav-icon-wrap">
                                                                            <span className="svg-icon">
                                                                                {menus.icon}
                                                                            </span>
                                                                        </span>
                                                                        <span className="nav-link-text">{menus.name}</span>
                                                                        {menus.badge && menus.badge}
                                                                    </a>
                                                                    :
                                                                    <Nav.Link as={NavLink} to={menus.path} onClick={() => handleClick(menus.name)} >
                                                                        <span className="nav-icon-wrap">
                                                                            <span className="svg-icon">
                                                                                {menus.icon}
                                                                            </span>
                                                                        </span>
                                                                        <span className="nav-link-text">{menus.name}</span>
                                                                        {menus.badge && menus.badge}
                                                                    </Nav.Link>
                                                            }
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
            <div onClick={backDropToggle} className="hk-menu-backdrop" />
        </>
    )
}

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed }
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Sidebar);