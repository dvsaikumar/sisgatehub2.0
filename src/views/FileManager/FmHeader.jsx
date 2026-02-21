import classNames from 'classnames';
import React, { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { CaretDown, CaretUp, File, FilePlus, FolderPlus, SquaresFour, Info, List, CloudArrowUp, UserPlus, MagnifyingGlass, X } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { Link, NavLink, useMatch } from 'react-router-dom';
import HkTooltip from '../../components/@hk-tooltip/HkTooltip';
import { toggleTopNav } from '../../redux/action/Theme';

const FmHeader = ({ topNavCollapsed, toggleTopNav, toggleSidebar, showSidebar, showInfo, toggleInfo, title, onSearch, searchValue, viewMode, setViewMode, children }) => {

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
                    <h1 className="fw-bold">{title ? title : "My Space"}</h1>
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
                {setViewMode && (
                    <Dropdown className="inline-block">
                        <Dropdown.Toggle as="a" className="btn btn-icon btn-flush-dark flush-soft-hover no-caret active ms-lg-0 d-sm-inline-block d-none p-3">
                            <span className="icon">
                                <span className="feather-icon">
                                    {viewMode === 'list' ? <List size={24} /> : <SquaresFour size={24} />}
                                </span>
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item
                                onClick={() => setViewMode('list')}
                                className={classNames("d-flex align-items-center gap-2", { active: viewMode === 'list' })}
                            >
                                <span className="feather-icon">
                                    <List size={18} />
                                </span>
                                <span>List View</span>
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => setViewMode('grid')}
                                className={classNames("d-flex align-items-center gap-2", { active: viewMode === 'grid' })}
                            >
                                <span className="feather-icon">
                                    <SquaresFour size={18} />
                                </span>
                                <span>Grid View</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>
            <div className={classNames("hk-sidebar-togglable", { "active": !showSidebar })} onClick={toggleSidebar} />
        </header >
    )
}

const mapStateToProps = ({ theme }) => {
    const { topNavCollapsed } = theme;
    return { topNavCollapsed }
};

export default connect(mapStateToProps, { toggleTopNav })(FmHeader);