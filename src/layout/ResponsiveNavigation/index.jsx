import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import {
    Menu,
    X,
    Home,
    FileText,
    Bell,
    Calendar,
    Folder,
    Settings,
    Search,
    Inbox
} from 'react-feather';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { SidebarMenu } from '../Sidebar/SidebarMenu';
import { ThemeSwitcher } from '../../utils/theme-provider/theme-switcher';
import SimpleBar from 'simplebar-react';

// User avatar
import avatar12 from '../../assets/img/avatar12.jpg';

const ResponsiveNavigation = ({ navCollapsed, toggleCollapsedNav, children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const location = useLocation();

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
                setSearchOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const isDesktop = windowWidth >= 1024;

    // Quick navigation items for the header
    const quickNavItems = [
        { path: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
        { path: '/library', icon: <Folder size={18} />, label: 'Library' },
        { path: '/reminders', icon: <Bell size={18} />, label: 'Reminders' },
        { path: '/apps/calendar', icon: <Calendar size={18} />, label: 'Calendar' },
    ];

    // Mobile bottom nav items
    const mobileNavItems = [
        { path: '/dashboard', icon: <Home size={20} />, label: 'Home' },
        { path: '/library', icon: <Folder size={20} />, label: 'Library' },
        { path: '/apps/ai/create-doc', icon: <FileText size={20} />, label: 'Create', primary: true },
        { path: '/reminders', icon: <Bell size={20} />, label: 'Reminders' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    // Responsive logo sizes
    const logoSizes = {
        mobile: { container: '2rem', icon: '0.75rem', text: '1rem' },
        tablet: { container: '2.25rem', icon: '0.875rem', text: '1.125rem' },
        desktop: { container: '2.5rem', icon: '1rem', text: '1.25rem' }
    };

    // Get current logo size based on screen
    const currentLogoSize = isDesktop ? logoSizes.desktop : (windowWidth >= 768 ? logoSizes.tablet : logoSizes.mobile);

    // Brand colors - consistent across app
    const brandColors = {
        primary: '#3b82f6',
        primaryDark: '#1d4ed8',
        primaryLight: '#dbeafe',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        surface: '#ffffff',
        surfaceHover: '#f1f5f9',
        border: '#e2e8f0',
        background: '#f8fafc'
    };

    // Base styles for nav links
    const navLinkBase = "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200";
    const navLinkActive = "nav-link-active";
    const navLinkInactive = "nav-link-inactive";

    return (
        <div className="responsive-layout-wrapper">
            <style>{`
                :root {
                    --brand-primary: ${brandColors.primary};
                    --brand-primary-dark: ${brandColors.primaryDark};
                    --brand-primary-light: ${brandColors.primaryLight};
                    --brand-success: ${brandColors.success};
                    --brand-warning: ${brandColors.warning};
                    --brand-danger: ${brandColors.danger};
                }
                .responsive-layout-wrapper {
                    min-height: 100vh;
                    background-color: ${brandColors.background};
                }
                .responsive-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1030;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid ${brandColors.border};
                }
                .nav-link-active {
                    background-color: ${brandColors.primaryLight};
                    color: ${brandColors.primaryDark};
                }
                .nav-link-inactive {
                    color: ${brandColors.textSecondary};
                }
                .nav-link-inactive:hover {
                    background-color: ${brandColors.surfaceHover};
                    color: ${brandColors.textPrimary};
                }
                .mobile-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 0.5rem 0.25rem;
                    border-radius: 0.75rem;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    min-height: 48px;
                    min-width: 48px;
                }
                .mobile-nav-item.active {
                    color: ${brandColors.primary};
                }
                .mobile-nav-item:not(.active):not(.primary) {
                    color: ${brandColors.textMuted};
                }
                .mobile-nav-item.primary {
                    background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%);
                    color: white;
                    margin-top: -1.25rem;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
                    border-radius: 1rem;
                    padding: 0.875rem;
                    transform: scale(1.1);
                }
                .drawer-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    text-decoration: none;
                    min-height: 44px;
                }
                .drawer-nav-link.active {
                    background-color: ${brandColors.primaryLight};
                    color: ${brandColors.primaryDark};
                }
                .drawer-nav-link:not(.active) {
                    color: ${brandColors.textSecondary};
                }
                .drawer-nav-link:not(.active):hover {
                    background-color: ${brandColors.surfaceHover};
                    color: ${brandColors.textPrimary};
                }
            `}</style>

            {/* ===== DESKTOP HEADER ===== */}
            {isDesktop && (
                <header className="responsive-header">
                    <div className="responsive-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
                            {/* Logo - Responsive Size */}
                            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                                <div style={{
                                    width: currentLogoSize.container,
                                    height: currentLogoSize.container,
                                    borderRadius: '0.75rem',
                                    background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: currentLogoSize.icon }}>S</span>
                                </div>
                                <span style={{ fontWeight: 600, color: brandColors.textPrimary, fontSize: currentLogoSize.text }}>
                                    Sisgate Hub
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                {quickNavItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        exact={item.path === '/dashboard'}
                                        className={navLinkBase}
                                        activeClassName={navLinkActive}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Desktop Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {/* Search */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        style={{
                                            width: '16rem',
                                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid var(--color-border, #e2e8f0)',
                                            backgroundColor: 'var(--color-surface, #ffffff)',
                                            fontSize: '0.875rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #94a3b8)' }} />
                                </div>

                                {/* Theme Switcher */}
                                <ThemeSwitcher />

                                {/* Notifications */}
                                <button style={{
                                    position: 'relative',
                                    padding: '0.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                    minWidth: '44px'
                                }}>
                                    <Inbox size={20} style={{ color: 'var(--color-text-secondary, #475569)' }} />
                                    <span style={{
                                        position: 'absolute',
                                        top: '0.25rem',
                                        right: '0.25rem',
                                        width: '0.5rem',
                                        height: '0.5rem',
                                        backgroundColor: '#3b82f6',
                                        borderRadius: '50%'
                                    }} />
                                </button>

                                <button style={{
                                    position: 'relative',
                                    padding: '0.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                    minWidth: '44px'
                                }}>
                                    <Bell size={20} style={{ color: 'var(--color-text-secondary, #475569)' }} />
                                    <span style={{
                                        position: 'absolute',
                                        top: '0.25rem',
                                        right: '0.25rem',
                                        width: '0.5rem',
                                        height: '0.5rem',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%'
                                    }} />
                                </button>

                                {/* Profile */}
                                <Link to="/pages/profile" style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                                    <img
                                        src={avatar12}
                                        alt="Profile"
                                        style={{
                                            width: '2.25rem',
                                            height: '2.25rem',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid var(--color-border, #e2e8f0)'
                                        }}
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* ===== MOBILE HEADER ===== */}
            {!isDesktop && (
                <header className="responsive-header" style={{ padding: '0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.5rem' }}>
                        {/* Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            style={{
                                padding: '0.5rem',
                                marginLeft: '-0.5rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                minHeight: '44px',
                                minWidth: '44px'
                            }}
                            aria-label="Open menu"
                        >
                            <Menu size={24} style={{ color: 'var(--color-text-primary, #0f172a)' }} />
                        </button>

                        {/* Logo - Responsive Size */}
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                            <div style={{
                                width: currentLogoSize.container,
                                height: currentLogoSize.container,
                                borderRadius: '0.625rem',
                                background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                            }}>
                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: currentLogoSize.icon }}>S</span>
                            </div>
                            <span style={{ fontWeight: 600, color: brandColors.textPrimary, fontSize: currentLogoSize.text }}>
                                Sisgate
                            </span>
                        </Link>

                        {/* Mobile Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                    minWidth: '44px'
                                }}
                                aria-label="Search"
                            >
                                <Search size={20} style={{ color: 'var(--color-text-secondary, #475569)' }} />
                            </button>
                            <Link to="/pages/profile" style={{ padding: '0.25rem' }}>
                                <img
                                    src={avatar12}
                                    alt="Profile"
                                    style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search Bar (Expandable) */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ paddingBottom: '0.75rem', overflow: 'hidden' }}
                            >
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 1rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--color-border, #e2e8f0)',
                                        backgroundColor: 'var(--color-surface, #ffffff)',
                                        fontSize: '0.875rem',
                                        outline: 'none'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>
            )}

            {/* ===== MOBILE DRAWER ===== */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 1040
                            }}
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: 'min(320px, 85vw)',
                                height: '100%',
                                backgroundColor: 'var(--color-surface, #ffffff)',
                                zIndex: 1060,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            <SimpleBar style={{ maxHeight: '100vh' }}>
                                {/* Drawer Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--color-border, #e2e8f0)'
                                }}>
                                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                                        <div style={{
                                            width: '2.25rem',
                                            height: '2.25rem',
                                            borderRadius: '0.75rem',
                                            background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>S</span>
                                        </div>
                                        <span style={{ fontWeight: 600, color: brandColors.textPrimary, fontSize: '1.125rem' }}>
                                            Sisgate Hub
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '0.75rem',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            minHeight: '44px',
                                            minWidth: '44px'
                                        }}
                                        aria-label="Close menu"
                                    >
                                        <X size={20} style={{ color: 'var(--color-text-secondary, #475569)' }} />
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav style={{ padding: '1rem' }}>
                                    <div>
                                        {SidebarMenu.map((group, groupIndex) => (
                                            <div key={groupIndex} style={{ marginBottom: '1rem' }}>
                                                {group.group && (
                                                    <p style={{
                                                        padding: '0.5rem 0.75rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500,
                                                        color: 'var(--color-text-muted, #94a3b8)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {group.group}
                                                    </p>
                                                )}
                                                {group.contents.map((item, itemIndex) => (
                                                    <NavLink
                                                        key={itemIndex}
                                                        to={item.path}
                                                        className="drawer-nav-link"
                                                        activeClassName="active"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        <span style={{ flexShrink: 0 }}>
                                                            {item.icon}
                                                        </span>
                                                        <span>{item.name}</span>
                                                    </NavLink>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </nav>

                                {/* Theme Switcher in Drawer */}
                                <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border, #e2e8f0)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #475569)' }}>Theme</span>
                                        <ThemeSwitcher />
                                    </div>
                                </div>
                            </SimpleBar>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ===== MAIN CONTENT ===== */}
            <main style={{
                paddingTop: isDesktop ? '4rem' : '3.5rem',
                minHeight: '100vh',
                transition: 'all 0.3s'
            }}>
                {children}
            </main>

            {/* ===== MOBILE BOTTOM BAR ===== */}
            {!isDesktop && (
                <nav style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1030,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderTop: '1px solid var(--color-border, #e2e8f0)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '0.25rem',
                        padding: '0.5rem'
                    }}>
                        {mobileNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                exact={item.path === '/dashboard'}
                                className={classNames('mobile-nav-item', { primary: item.primary })}
                                activeClassName="active"
                            >
                                {item.icon}
                                <span style={{ fontSize: '10px', marginTop: '0.125rem', fontWeight: 500 }}>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            )}
        </div>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(ResponsiveNavigation);
