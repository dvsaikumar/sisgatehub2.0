import React from 'react';
import { connect } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { Link } from 'react-router-dom';
import { ArrowLineLeft } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../../utils/theme-provider/theme-provider';

//Images
import logo from '../../assets/img/sisgate-icon.png';
import jampackImg from '../../assets/img/sisgate-logo.png';
import jampackImgDark from '../../assets/img/sisgate-logo.png';


const SidebarHeader = ({ navCollapsed, toggleCollapsedNav }) => {

    const { theme } = useTheme();

    const toggleSidebar = () => {
        toggleCollapsedNav(!navCollapsed);
        document.getElementById('tggl-btn').blur();
    }
    return (
        <div className="menu-header">
            <span>
                <Link className="navbar-brand" to="/">
                    <img className="brand-img img-fluid" src={logo} alt="brand" style={{ maxHeight: '38px' }} />
                    {theme === "light" ? <img className="brand-img img-fluid logo-light" src={jampackImg} alt="brand" style={{ maxHeight: '38px', marginLeft: '5px' }} /> : <img className="brand-img img-fluid logo-dark" src={jampackImgDark} alt="brand" style={{ maxHeight: '38px', marginLeft: '5px' }} />}
                </Link>
                <Button id="tggl-btn" variant="flush-dark" onClick={toggleSidebar} className="btn-icon btn-rounded flush-soft-hover navbar-toggle">
                    <span className="icon">
                        <span className="svg-icon fs-5">
                            <ArrowLineLeft />
                        </span>
                    </span>
                </Button>
            </span>
        </div>
    )
}

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed }
};

export default connect(mapStateToProps, { toggleCollapsedNav })(SidebarHeader);
