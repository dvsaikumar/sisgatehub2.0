import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'react-feather';
import { Button, Dropdown, Form } from 'react-bootstrap';
import AddCategory from './AddCategory';
import SetReminder from './SetReminder';
import "react-datepicker/dist/react-datepicker.css";
import { Plus as PlusPhos, CalendarBlank, Bell, Plus } from '@phosphor-icons/react';
import dayjs from '../../lib/dayjs';
import { useCategories } from '../../hooks/useCategories';

interface CalendarSidebarProps {
    showSidebar: boolean;
    toggleSidebar: () => void;
    createNewEvent: () => void;
    refreshEvents: () => void;
    upcomingEvents: any[];
    onCategoryFilterChange: (categories: string[]) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ showSidebar, toggleSidebar, createNewEvent, refreshEvents, upcomingEvents = [], onCategoryFilterChange }) => {
    const [addCategory, setAddCategory] = useState<boolean>(false);
    const [reminder, setReminder] = useState<boolean>(false);
    const [categoriesOpen, setCategoriesOpen] = useState<boolean>(false); // Collapsed by default

    // Use categories hook for dynamic categories
    const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();

    // Track which categories are selected (all selected by default)
    const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});

    // Initialize all categories as selected when they load
    useEffect(() => {
        if (categories.length > 0) {
            const initialSelection: Record<string, boolean> = {};
            categories.forEach((cat: any) => {
                initialSelection[cat.name] = true;
            });
            setSelectedCategories(initialSelection);
        }
    }, [categories]);

    // Handle category checkbox toggle
    const handleCategoryToggle = (categoryName: string) => {
        const newSelection = {
            ...selectedCategories,
            [categoryName]: !selectedCategories[categoryName]
        };
        setSelectedCategories(newSelection);

        // Notify parent component of filter change
        if (onCategoryFilterChange) {
            const activeCategories = Object.keys(newSelection).filter(key => newSelection[key]);
            onCategoryFilterChange(activeCategories);
        }
    };

    // Event card color mapping based on background_color or category
    const getEventColor = (event: any) => {
        if (event.background_color) return event.background_color;
        switch (event.category) {
            case 'Important': return '#F59E0B';
            case 'Work': return '#3B82F6';
            case 'Personal': return '#10B981';
            default: return '#3B82F6';
        }
    };

    return (
        <>
            <nav className="calendarapp-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Scrollable Content */}
                <div className="menu-content-wrap" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {/* Create Button - Dropdown */}
                    <Dropdown className="w-100">
                        <Dropdown.Toggle className="btn-gradient-primary btn-animated w-100 d-flex align-items-center justify-content-center gap-2">
                            <PlusPhos weight="bold" size={18} color="#fff" />
                            <span>Create / Set</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={createNewEvent} className="d-flex align-items-center gap-2">
                                <CalendarBlank size={18} />
                                <span>Create an Event</span>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => setReminder(!reminder)} className="d-flex align-items-center gap-2">
                                <Bell size={18} />
                                <span>Set a Reminder</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Events List */}
                    <div className="events-list-container mt-4">
                        {upcomingEvents.length === 0 ? (
                            <div className="text-muted fs-7 text-center py-4">No upcoming events.</div>
                        ) : (
                            upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="event-card"
                                    style={{ '--event-color': getEventColor(event) } as any}
                                >
                                    <div className="event-indicator" style={{ backgroundColor: getEventColor(event) }} />
                                    <div className="event-content">
                                        <div className="event-time">
                                            {dayjs(event.start_date).calendar(null, {
                                                sameDay: '[Today], h:mm A - ',
                                                nextDay: '[Tomorrow], h:mm A - ',
                                                nextWeek: 'MMM DD, h:mm A - ',
                                                lastDay: '[Yesterday], h:mm A - ',
                                                lastWeek: '[Last] dddd, h:mm A - ',
                                                sameElse: 'MMM DD, h:mm A - '
                                            })}
                                            {event.end_date && dayjs(event.end_date).format('h:mm A')}
                                        </div>
                                        <div className="event-title">{event.title}</div>
                                    </div>
                                    <Dropdown className="event-menu">
                                        <Dropdown.Toggle as="button" className="btn btn-icon btn-flush">
                                            <MoreVertical size={16} />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align="end">
                                            <Dropdown.Item>Edit</Dropdown.Item>
                                            <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Categories Section - Fixed at Bottom */}
                <div
                    className="categories-footer"
                    onMouseEnter={() => setCategoriesOpen(true)}
                    onMouseLeave={() => setCategoriesOpen(false)}
                >
                    <div
                        className="categories-header clickable"
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                    >
                        <span className="categories-title">Categories</span>
                        <div className="categories-actions">
                            <Button
                                variant="light"
                                className="btn-icon btn-rounded add-category-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setAddCategory(!addCategory);
                                }}
                            >
                                <Plus size={14} />
                            </Button>
                        </div>
                    </div>
                    {categoriesOpen && (
                        <div className="categories-list">
                            {categoriesLoading ? (
                                <div className="text-muted small py-2">Loading...</div>
                            ) : categories.length === 0 ? (
                                <div className="text-muted small py-2">No categories</div>
                            ) : (
                                categories.map((cat: any) => (
                                    <div key={cat.id} className="category-item">
                                        <Form.Check
                                            type="checkbox"
                                            id={`category-${cat.id}`}
                                            label={cat.name}
                                            checked={selectedCategories[cat.name] ?? true}
                                            onChange={() => handleCategoryToggle(cat.name)}
                                            className="category-checkbox"
                                            style={{ '--category-color': cat.color || '#0d9488' } as any}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Add Category */}
            {/* @ts-ignore */}
            <AddCategory
                show={addCategory}
                hide={() => setAddCategory(!addCategory)}
                categories={categories}
                loading={categoriesLoading}
                onCreate={createCategory}
                onUpdate={updateCategory}
                onDelete={deleteCategory}
            />
            {/* New Event */}
            {/* @ts-ignore */}
            <SetReminder show={reminder} hide={() => setReminder(!reminder)} refreshEvents={refreshEvents} />
        </>
    )
}

export default CalendarSidebar;
