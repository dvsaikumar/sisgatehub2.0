import React, { useState, useEffect } from 'react';
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { connect } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';

// Images
import avatar12 from '../../assets/img/avatar12.jpg';
import { ThemeSwitcher } from '../../utils/theme-provider/theme-switcher';
import AIDrawer from './AIDrawer';

// Get page label from path
const getPageLabel = (pathname) => {
    const pathMap = {
        '/': 'Dashboard',
        '/dashboard': 'Dashboard',
        '/reminders': 'Calendar',
        '/library': 'Library',
        '/ai-create-doc': 'AI Create Doc',
        '/email': 'Email',
        '/settings': 'Settings',
    };

    // Check for exact match or partial match
    for (const [path, label] of Object.entries(pathMap)) {
        if (pathname === path || pathname.startsWith(path + '/')) {
            return label;
        }
    }

    // Fallback: capitalize the first part of the path
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).replace(/-/g, ' ');
    }

    return 'Dashboard';
};

const TopNav = ({ navCollapsed, toggleCollapsedNav }) => {
    const [showAIDrawer, setShowAIDrawer] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const searchInputRef = React.useRef(null);

    const currentPage = getPageLabel(location.pathname);

    // Keyboard shortcuts: "/" for search, Cmd/Ctrl+K for AI drawer
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if user is typing in an input, textarea, or contenteditable
            const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) ||
                e.target.isContentEditable;

            // "/" for search (only when not typing)
            if (e.key === '/' && !isTyping) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }

            // Cmd+K (Mac) or Ctrl+K (Windows) for AI drawer
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowAIDrawer(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch user data on mount
    useEffect(() => {
        let isMounted = true;

        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!isMounted) return;
                setUser(user);

                // Also fetch from user_profiles table for full_name
                if (user?.id) {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('full_name, email, avatar_url, role')
                        .eq('id', user.id)
                        .single();
                    if (isMounted && profile) {
                        setUser(prev => ({ ...prev, profile }));
                    }
                }
            } catch (error) {
                // Ignore AbortError (happens on unmount)
                if (error?.name !== 'AbortError') {
                    console.error('Error fetching user:', error);
                }
            }
        };
        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            const authUser = session?.user ?? null;
            setUser(authUser);

            // Fetch profile on auth change too
            if (authUser?.id) {
                try {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('full_name, email, avatar_url, role')
                        .eq('id', authUser.id)
                        .single();
                    if (isMounted && profile) {
                        setUser(prev => ({ ...prev, profile }));
                    }
                } catch (error) {
                    if (error?.name !== 'AbortError') {
                        console.error('Error fetching profile:', error);
                    }
                }
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Handle sign out
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth/login');
    };

    // Get user display name and email
    const getFullName = () => {
        // First priority: full_name from user_profiles table
        if (user?.profile?.full_name) {
            return user.profile.full_name;
        }
        // Fallback to auth metadata
        const meta = user?.user_metadata;
        if (meta?.first_name && meta?.last_name) {
            return `${meta.first_name} ${meta.last_name}`;
        }
        if (meta?.first_name) return meta.first_name;
        if (meta?.full_name) return meta.full_name;
        if (meta?.name) return meta.name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };
    const userName = getFullName();
    const userEmail = user?.email || 'No email';

    return (
        <Navbar expand="xl" className="hk-navbar navbar-light fixed-top">
            <Container fluid className="px-3">
                {/* Left Section: Search Bar */}
                <div className="nav-start-wrap d-flex align-items-center flex-grow-1">
                    <div className="header-search-wrapper">
                        <style>
                            {`
                            .header-search-wrapper {
                                position: relative;
                                width: 100%;
                                max-width: 400px;
                            }
                            .header-search-input {
                                width: 100%;
                                padding: 10px 16px 10px 42px;
                                border: 1px solid var(--bs-border-color);
                                border-radius: 10px;
                                background: var(--bs-body-bg);
                                font-size: 14px;
                                color: var(--bs-body-color);
                                transition: all 0.2s ease;
                                outline: none;
                            }
                            .header-search-input::placeholder {
                                color: var(--bs-secondary-color);
                            }
                            .header-search-input:focus {
                                border-color: var(--bs-primary);
                                box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.1);
                            }
                            .header-search-icon {
                                position: absolute;
                                left: 14px;
                                top: 50%;
                                transform: translateY(-50%);
                                color: var(--bs-secondary-color);
                                pointer-events: none;
                            }
                            `}
                        </style>
                        <MagnifyingGlass size={18} className="header-search-icon" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="header-search-input"
                            placeholder="Search... (press /)"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Section: AI Search + Theme Switch + Avatar */}
                <div className="nav-end-wrap">
                    <Nav className="navbar-nav flex-row align-items-center">
                        {/* AI Search Assistant Button */}
                        <Nav.Item className="me-2">
                            <style>
                                {`
                                .ai-search-btn {
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                    padding: 8px 16px;
                                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
                                    border-radius: 24px;
                                    border: 1px solid rgba(139, 92, 246, 0.15);
                                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                    cursor: pointer;
                                }
                                .ai-search-btn:hover {
                                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
                                    border-color: rgba(139, 92, 246, 0.3);
                                    transform: translateY(-1px);
                                    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
                                }
                                .ai-search-btn:hover .ai-search-icon {
                                    animation: pulse-glow 1.5s ease-in-out infinite;
                                }
                                @keyframes pulse-glow {
                                    0%, 100% { opacity: 1; transform: scale(1); }
                                    50% { opacity: 0.8; transform: scale(1.1); }
                                }
                                .ai-search-text {
                                    font-size: 13px;
                                    font-weight: 500;
                                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                }
                                .ai-search-icon {
                                    color: #8b5cf6;
                                }
                                .ai-search-shortcut {
                                    display: flex;
                                    align-items: center;
                                    gap: 2px;
                                    margin-left: 8px;
                                    padding: 2px 6px;
                                    background: rgba(0, 0, 0, 0.06);
                                    border-radius: 4px;
                                    font-size: 11px;
                                    color: var(--bs-secondary-color);
                                    font-weight: 500;
                                }
                                [data-bs-theme="dark"] .ai-search-shortcut {
                                    background: rgba(255, 255, 255, 0.1);
                                }
                                `}
                            </style>
                            <div
                                className="ai-search-btn"
                                onClick={() => setShowAIDrawer(true)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setShowAIDrawer(true)}
                            >
                                <Sparkle size={16} weight="fill" className="ai-search-icon" />
                                <span className="ai-search-text d-none d-lg-inline">Ask AI</span>
                                <MagnifyingGlass size={14} className="ai-search-icon d-none d-sm-inline" />
                                <div className="ai-search-shortcut d-none d-xl-flex">
                                    <span>⌘</span>
                                    <span>K</span>
                                </div>
                            </div>
                        </Nav.Item>

                        {/* Theme Switcher */}
                        <Nav.Item className="ms-1">
                            <ThemeSwitcher />
                        </Nav.Item>

                        {/* User Avatar Dropdown */}
                        <Nav.Item className="ms-2">
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    as="div"
                                    className="no-caret cursor-pointer"
                                    role="button"
                                >
                                    <div
                                        className="avatar avatar-rounded avatar-sm"
                                        style={{
                                            border: '0px solid var(--bs-border-color)',
                                            padding: '0px'
                                        }}
                                    >
                                        <img
                                            src={user?.profile?.avatar_url || avatar12}
                                            alt="user"
                                            className="avatar-img"
                                            style={{
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            onError={(e) => { e.target.src = avatar12; }}
                                        />
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="p-0 profile-dropdown-menu" style={{ minWidth: '320px', border: '1px solid var(--bs-border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                    {/* Header with light blue background */}
                                    <div
                                        className="profile-dropdown-header"
                                        style={{
                                            background: '#e8f4fd',
                                            padding: '24px 24px 24px 24px',
                                            position: 'relative'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.2' }}>
                                                    {userName}
                                                </div>
                                                <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
                                                    {user?.profile?.role || 'Member'}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                style={{
                                                    fontSize: '12px',
                                                    opacity: 0.6,
                                                    marginTop: '4px'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.body.click();
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div style={{ padding: '16px 20px 20px 20px' }}>
                                        <Dropdown.Item
                                            as={Link}
                                            to="/profile"
                                            className="profile-dropdown-item"
                                            style={{
                                                padding: '16px 8px',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '400',
                                                color: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                background: 'transparent'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            My Profile
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            as={Link}
                                            to="/email"
                                            className="profile-dropdown-item"
                                            style={{
                                                padding: '16px 8px',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '400',
                                                color: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                background: 'transparent'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            Inbox
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            as={Link}
                                            to="/settings"
                                            className="profile-dropdown-item"
                                            style={{
                                                padding: '16px 8px',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '400',
                                                color: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                background: 'transparent'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                            </svg>
                                            Setting
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            className="profile-dropdown-item"
                                            onClick={handleSignOut}
                                            style={{
                                                padding: '16px 8px',
                                                borderRadius: '8px',
                                                fontSize: '18px',
                                                fontWeight: '400',
                                                color: '#1a1a1a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                background: 'transparent'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                                <line x1="12" y1="2" x2="12" y2="12" />
                                            </svg>
                                            Log Out
                                        </Dropdown.Item>
                                    </div>

                                    <style>
                                        {`
                                        .profile-dropdown-item:hover {
                                            background-color: #f5f5f5 !important;
                                        }
                                        .profile-dropdown-item:active {
                                            background-color: #ebebeb !important;
                                            color: #1a1a1a !important;
                                        }
                                        [data-bs-theme="dark"] .profile-dropdown-menu {
                                            background: var(--bs-body-bg);
                                            border-color: var(--bs-border-color) !important;
                                        }
                                        [data-bs-theme="dark"] .profile-dropdown-header {
                                            background: #1e3a5f !important;
                                        }
                                        [data-bs-theme="dark"] .profile-dropdown-header > div > div:first-child {
                                            color: #ffffff !important;
                                        }
                                        [data-bs-theme="dark"] .profile-dropdown-header > div > div:last-child {
                                            color: #94a3b8 !important;
                                        }
                                        [data-bs-theme="dark"] .profile-dropdown-item {
                                            color: var(--bs-body-color) !important;
                                        }
                                        [data-bs-theme="dark"] .profile-dropdown-item:hover {
                                            background-color: rgba(255,255,255,0.08) !important;
                                        }
                                        `}
                                    </style>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav.Item>
                    </Nav>
                </div>
            </Container>

            {/* AI Drawer */}
            <AIDrawer show={showAIDrawer} onHide={() => setShowAIDrawer(false)} />
        </Navbar>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(TopNav);