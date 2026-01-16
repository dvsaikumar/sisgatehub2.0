import React from 'react';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { Link } from 'react-router-dom';
import { ArrowLineLeft, ArrowLineRight } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../utils/theme-provider/theme-provider';

//Images
import logo from '../../assets/img/sisgate-icon.png';
import jampackImg from '../../assets/img/sisgate-logo.png';
import jampackImgDark from '../../assets/img/sisgate-logo.png';

// Brand colors - matching the responsive navigation
const brandColors = {
    primary: '#3b82f6',
    primaryDark: '#1d4ed8',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0'
};

const SidebarHeader = ({ navCollapsed, toggleCollapsedNav }) => {

    const { theme } = useTheme();

    const toggleSidebar = () => {
        toggleCollapsedNav(!navCollapsed);
        document.getElementById('tggl-btn').blur();
    }

    // Responsive logo styles
    const headerStyles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: navCollapsed ? '1rem 0.75rem' : '1rem 1.25rem',
            borderBottom: `1px solid ${brandColors.border}`,
            minHeight: '65px',
            transition: 'all 0.3s ease'
        },
        brandLink: {
            display: 'flex',
            alignItems: 'center',
            gap: navCollapsed ? '0' : '0.625rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        },
        logoIcon: {
            width: navCollapsed ? '2.25rem' : '2rem',
            height: navCollapsed ? '2.25rem' : '2rem',
            minWidth: navCollapsed ? '2.25rem' : '2rem',
            borderRadius: '0.625rem',
            objectFit: 'contain',
            transition: 'all 0.3s ease',
            filter: theme === 'dark' ? 'brightness(1.1)' : 'none'
        },
        logoText: {
            height: '1.75rem',
            width: navCollapsed ? '0' : 'auto',
            opacity: navCollapsed ? 0 : 1,
            objectFit: 'contain',
            transition: 'all 0.3s ease',
            marginLeft: navCollapsed ? '0' : '0.25rem',
            overflow: 'hidden'
        },
        toggleBtn: {
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            minHeight: '36px',
            transition: 'all 0.2s ease',
            color: brandColors.textSecondary
        }
    };

    return (
        <div className="menu-header" style={headerStyles.container}>
            <Link className="navbar-brand" to="/" style={headerStyles.brandLink}>
                {/* Logo Icon */}
                <img
                    className="brand-img img-fluid"
                    src={logo}
                    alt="Sisgate"
                    style={headerStyles.logoIcon}
                />
                {/* Logo Text - CSS handles visibility based on hover/collapse state */}
                <img
                    className="brand-img img-fluid brand-logo-text"
                    src={theme === 'light' ? jampackImg : jampackImgDark}
                    alt="Sisgate"
                    style={headerStyles.logoText}
                />
            </Link>

            {/* Toggle Button */}
            <Button
                id="tggl-btn"
                variant="flush-dark"
                onClick={toggleSidebar}
                className="btn-icon btn-rounded flush-soft-hover navbar-toggle"
                style={headerStyles.toggleBtn}
                title={navCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <span className="icon">
                    <span className="svg-icon fs-5">
                        {navCollapsed ? <ArrowLineRight size={18} /> : <ArrowLineLeft size={18} />}
                    </span>
                </span>
            </Button>
        </div>
    )
}

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed }
};

export default connect(mapStateToProps, { toggleCollapsedNav })(SidebarHeader);
