import React, { useState, useEffect } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import {
    Book, FileText, Star, Trash, CaretRight, CaretDown, Folder, Briefcase, Pulse,
    CurrencyDollar, House, Shield, User, Key, Wrench, Users, ClipboardText, Scissors,
    PenNib, UserCheck, ArrowElbowDownRight
} from '@phosphor-icons/react';
import SimpleBar from 'simplebar-react';
import { supabase } from '../../configs/supabaseClient';

const LibrarySidebar = ({ filter, setFilter, onCategorySelect }) => {
    const [categories, setCategories] = useState([]);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('app_document_categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            // Debug: log raw data
            console.log('Raw categories data:', data);

            // Simple nesting logic: parents first, then attach children
            const parentCats = data.filter(c => !c.parent_id);
            const nested = parentCats.map(parent => ({
                ...parent,
                children: data.filter(c => c.parent_id === parent.id)
            }));

            // Debug: log nested structure
            console.log('Nested categories:', nested);

            setCategories(nested);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // track expanded categories
    const toggleExpand = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    }

    // Icon mapping logic
    const iconMap = {
        Briefcase, Pulse, CurrencyDollar, House, Shield, User, Key, Wrench, Users, ClipboardText, Scissors, PenNib, UserCheck, Book, FileText, Star, Trash, Folder
    };

    const getRelevantIcon = (item) => {
        // 1. Check if item has a valid icon field in DB
        if (item.icon && iconMap[item.icon] && item.icon !== 'Folder') {
            return iconMap[item.icon];
        }

        // 2. Fallback to name-based mapping for relevance
        const name = item.name.toLowerCase();
        if (name.includes('secretarial') || name.includes('corporate')) return Briefcase;
        if (name.includes('start') || name.includes('business')) return Pulse;
        if (name.includes('debt') || name.includes('money') || name.includes('finance')) return CurrencyDollar;
        if (name.includes('franchis')) return House;
        if (name.includes('cyber') || name.includes('security') || name.includes('compliance')) return Shield;
        if (name.includes('coach')) return User;
        if (name.includes('landlord') || name.includes('tenant') || name.includes('lease') || name.includes('property')) return Key;
        if (name.includes('contractor') || name.includes('tool')) return Wrench;
        if (name.includes('meeting')) return Users;
        if (name.includes('agenda') || name.includes('minute')) return ClipboardText;
        if (name.includes('register')) return Book;
        if (name.includes('resolution')) return FileText;
        if (name.includes('hair') || name.includes('beauty')) return Scissors;
        if (name.includes('creative') || name.includes('design')) return PenNib;
        if (name.includes('consultant')) return UserCheck;

        return Folder;
    };

    return (
        <nav className="fmapp-sidebar">
            <style>
                {`
                .fmapp-sidebar .menu-content-wrap {
                    padding-top: 10px;
                }
                .fmapp-sidebar .nav-link, .nav-category-link {
                    padding: 0.35rem 1.25rem !important;
                    min-height: 38px;
                    display: flex;
                    align-items: center;
                }
                .fmapp-sidebar .nav-link-text {
                    font-size: 0.85rem !important;
                    font-weight: 500;
                }
                .fmapp-sidebar .nav-icon-wrap {
                    margin-right: 10px !important;
                    min-width: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .fmapp-sidebar .nav-icon-wrap svg {
                    width: 18px !important;
                    height: 18px !important;
                }
                .sidebar-divider {
                    margin: 8px 10px;
                    border-top: 1px solid rgba(0,0,0,0.1);
                    opacity: 1;
                }

                /* Custom Overrides */
                .nav-category-link {
                    padding: 0.35rem 1.25rem !important;
                    color: #5e656f;
                    transition: all 0.2s;
                    border-radius: 0; 
                }
                .nav-category-link:hover, .nav-category-link.active {
                    background-color: transparent;
                    color: #007D88;
                }
                .nav-category-link .phrase-icon {
                    color: #889098;
                    transition: color 0.2s;
                }
                .nav-category-link:hover .phrase-icon, .nav-category-link.active .phrase-icon {
                    color: #007D88;
                }
                
                .sub-category-link {
                    padding: 0.35rem 1rem 0.35rem 2.75rem !important;
                    font-size: 0.85rem;
                    color: #6c757d;
                    display: flex;
                    align-items: center;
                }
                .sub-category-link:hover, .sub-category-link.active {
                   color: #007D88;
                   background: transparent;
                }
                .sub-category-list {
                    margin-left: 1.5rem;
                    padding-left: 0;
                    border-left: 2px solid rgba(0,125,136,0.2);
                    list-style: none;
                }
                .sub-category-list .nav-item {
                    display: block !important;
                    visibility: visible !important;
                }
                .sub-category-list .nav-link {
                    display: flex !important;
                    visibility: visible !important;
                }
                /* Ensure Collapse content is visible */
                .collapse.show {
                    display: block !important;
                    visibility: visible !important;
                }
                .collapsing {
                    height: auto !important;
                    overflow: visible !important;
                }
                `}
            </style>

            <SimpleBar className="nicescroll-bar">
                <div className="menu-content-wrap">
                    <div className="menu-group">
                        <ul className="nav nav-light navbar-nav flex-column">
                            <li className="nav-item">
                                <a className={`nav-link ${filter === 'all' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setFilter('all'); onCategorySelect('All Templates'); }}>
                                    <span className="nav-icon-wrap">
                                        <Book size={18} />
                                    </span>
                                    <span className="nav-link-text">All Templates</span>
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className={`nav-link ${filter === 'starred' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setFilter('starred'); onCategorySelect('Starred'); }}>
                                    <span className="nav-icon-wrap">
                                        <Star size={18} />
                                    </span>
                                    <span className="nav-link-text">Starred</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <hr className="sidebar-divider" />

                    <div className="menu-group">
                        <ul className="nav nav-light navbar-nav flex-column">
                            {categories.map(cat => {
                                const IconTag = getRelevantIcon(cat);

                                return (
                                    <li className="nav-item" key={cat.id}>
                                        <a
                                            className={`nav-link nav-category-link ${filter === cat.id ? 'active' : ''} ${expanded[cat.id] ? 'bg-light text-primary' : ''}`}
                                            href="#"
                                            onClick={(e) => {
                                                if (cat.children && cat.children.length > 0) {
                                                    toggleExpand(cat.id, e);
                                                } else {
                                                    e.preventDefault();
                                                    setFilter(cat.id);
                                                    if (onCategorySelect) onCategorySelect(cat.name);
                                                }
                                            }}
                                        >
                                            <span className="nav-icon-wrap me-2">
                                                <IconTag size={20} className="phrase-icon" />
                                            </span>
                                            <span className="nav-link-text text-truncate flex-grow-1">{cat.name}</span>
                                            {cat.children && cat.children.length > 0 && (
                                                <span className="ms-2">
                                                    <CaretRight size={14} weight="bold" style={{
                                                        transform: expanded[cat.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s',
                                                        opacity: 0.5
                                                    }} />
                                                </span>
                                            )}
                                        </a>
                                        {cat.children && cat.children.length > 0 && (
                                            <Collapse in={expanded[cat.id]}>
                                                <div>
                                                    <ul className="nav nav-light navbar-nav flex-column sub-category-list">
                                                        {cat.children.map(child => {
                                                            const ChildIconTag = getRelevantIcon(child);

                                                            return (
                                                                <li className="nav-item" key={child.id}>
                                                                    <a
                                                                        className={`nav-link sub-category-link ${filter === child.id ? 'active' : ''}`}
                                                                        href="#"
                                                                        onClick={(e) => { e.preventDefault(); setFilter(child.id); if (onCategorySelect) onCategorySelect(child.name); }}
                                                                    >
                                                                        <span className="nav-icon-wrap me-2">
                                                                            <ChildIconTag size={18} />
                                                                        </span>
                                                                        <span className="nav-link-text">{child.name}</span>
                                                                    </a>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </div>
                                            </Collapse>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <hr className="sidebar-divider" />
                    <div className="menu-group">
                        <ul className="nav nav-light navbar-nav flex-column">
                            <li className="nav-item">
                                <a className={`nav-link ${filter === 'trash' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setFilter('trash'); onCategorySelect('Trash'); }}>
                                    <span className="nav-icon-wrap">
                                        <Trash size={18} />
                                    </span>
                                    <span className="nav-link-text">Trash</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>
            </SimpleBar>
        </nav >
    )
}

export default LibrarySidebar;
