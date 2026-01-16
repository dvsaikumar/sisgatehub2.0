import classNames from 'classnames';
import React, { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { CaretDown, CaretUp, File, FilePlus, FolderPlus, SquaresFour, Info, List, CloudArrowUp, UserPlus, MagnifyingGlass, X } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { Link, NavLink, useMatch } from 'react-router-dom';
import HkTooltip from '../../components/@hk-tooltip/HkTooltip';
import { toggleTopNav } from '../../redux/action/Theme';

const FmHeader = ({ topNavCollapsed, toggleTopNav, toggleSidebar, showSidebar, showInfo, toggleInfo, title, onSearch, searchValue, children }) => {

    const listViewRoute = useMatch("/apps/file-manager/list-view");
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    return (
        <header className="fm-header">
            {/* Mobile Search Overlay */}
            {mobileSearchOpen && onSearch && (
                <div className="mobile-search-overlay d-md-none">
                    <Form className="flex-grow-1" role="search" onSubmit={e => e.preventDefault()}>
                        <Form.Control
                            type="text"
                            placeholder="Search templates..."
                            value={searchValue}
                            onChange={(e) => onSearch(e.target.value)}
                            autoFocus
                            className="mobile-search-input"
                        />
                    </Form>
                    <Button
                        variant="link"
                        className="mobile-search-close p-2"
                        onClick={() => {
                            setMobileSearchOpen(false);
                            if (onSearch) onSearch('');
                        }}
                    >
                        <X size={20} weight="bold" />
                    </Button>
                </div>
            )}

            <div className={classNames("d-flex align-items-center flex-grow-1", { "d-none d-md-flex": mobileSearchOpen })}>
                <div className="fmapp-title link-dark">
                    <h1>{title ? title : "My Space"}</h1>
                </div>
                {children}

                {/* Desktop Search - visible on md and up */}
                {onSearch && (
                    <Form className="mx-3 flex-grow-1 mw-400p d-none d-md-block" role="search" onSubmit={e => e.preventDefault()}>
                        <Form.Control type="text" placeholder="Search..." value={searchValue} onChange={(e) => onSearch(e.target.value)} />
                    </Form>
                )}

                {/* Mobile Search Icon - visible on mobile only */}
                {onSearch && (
                    <Button
                        variant="flush-dark"
                        className="btn-icon btn-rounded flush-soft-hover d-md-none ms-auto"
                        onClick={() => setMobileSearchOpen(true)}
                    >
                        <span className="icon">
                            <span className="feather-icon">
                                <MagnifyingGlass size={20} />
                            </span>
                        </span>
                    </Button>
                )}
            </div>
            <div className="fm-options-wrap">
                <Link to="#" className="btn btn-icon btn-flush-dark btn-rounded flush-soft-hover disabled d-xl-inline-block d-none">
                    <span className="icon">
                        <span className="feather-icon">
                            <UserPlus />
                        </span>
                    </span>
                </Link>
                <Button as="a" variant="flush-dark" className={classNames("btn-icon btn-rounded flush-soft-hover fmapp-info-toggle", { "active": showInfo })} onClick={toggleInfo} >
                    <span className="icon">
                        <span className="feather-icon">
                            <Info />
                        </span>
                    </span>
                </Button>
                <div className="v-separator d-xl-inline-block d-none" />
                <Button as="a" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover ms-0 d-xl-inline-block d-none">
                    <HkTooltip placement="top" title="Add New Folder">
                        <span className="icon">
                            <span className="feather-icon">
                                <FolderPlus />
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
                <Button as="a" variant="flush-dark" className="btn-icon btn-rounded btn-file flush-soft-hover  d-md-inline-block d-none">
                    <HkTooltip placement="top" title="Upload">
                        <span className="icon">
                            <span className="feather-icon">
                                <CloudArrowUp />
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
                <div className="v-separator d-lg-inline-block d-none" />
                <Dropdown className="inline-block">
                    <Dropdown.Toggle as="a" className="btn btn-icon btn-flush-dark flush-soft-hover no-caret active ms-lg-0 d-sm-inline-block d-none">
                        <span className="icon">
                            <span className="feather-icon">
                                {listViewRoute ? <List /> : <SquaresFour />}
                            </span>
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" >
                        <Dropdown.Item as={NavLink} to="list-view" activeClassName="active" >
                            <span className="feather-icon dropdown-icon">
                                <List />
                            </span>
                            <span>List View</span>
                        </Dropdown.Item>
                        <Dropdown.Item as={NavLink} to="grid-view" activeClassName="active">
                            <span className="feather-icon dropdown-icon">
                                <SquaresFour />
                            </span>
                            <span>Grid View</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Button as="a" href="#" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none" onClick={() => toggleTopNav(!topNavCollapsed)} >
                    <HkTooltip placement={topNavCollapsed ? "bottom" : "top"} title="Collapse" >
                        <span className="icon">
                            <span className="feather-icon">
                                {
                                    topNavCollapsed ? <CaretDown /> : <CaretUp />
                                }
                            </span>
                        </span>
                    </HkTooltip>
                </Button>
            </div>
            <div className={classNames("hk-sidebar-togglable", { "active": !showSidebar })} onClick={toggleSidebar} />
        </header>
    )
}

const mapStateToProps = ({ theme }) => {
    const { topNavCollapsed } = theme;
    return { topNavCollapsed }
};

export default connect(mapStateToProps, { toggleTopNav })(FmHeader);