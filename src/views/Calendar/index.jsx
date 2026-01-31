/* eslint-disable no-useless-concat */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import classNames from 'classnames';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from '../../lib/dayjs';
import { useWindowHeight } from '@react-hook/window-size';
import CalendarSidebar from './CalendarSidebar';
import EventsModal from './EventsModal';
import CreateNewEvent from './CreateNewEvent';
import 'bootstrap-icons/font/bootstrap-icons.css';
//Redux
import { connect, useDispatch } from 'react-redux';
import { toggleTopNav, toggleCollapsedNav } from '../../redux/action/Theme';
//Icons
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { supabase } from '../../configs/supabaseClient';
import useReminderPoller from './useReminderPoller';
import '../../styles/css/calendar-fixes.css';
import { Bell, CalendarBlank } from '@phosphor-icons/react';

const Calendar = ({ topNavCollapsed, toggleTopNav }) => {

    // Activate Auto-Reminder Polling
    useReminderPoller();

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(toggleCollapsedNav(true));
        return () => {
            dispatch(toggleCollapsedNav(false));
        };
    }, [dispatch]);

    const calendarRef = useRef(null);
    var curYear = dayjs().format('YYYY'),
        curMonth = dayjs().format('MM');

    const [showSidebar, setShowSidebar] = useState(true)
    const [showEventInfo, setShowEventInfo] = useState(false);
    const [createEvent, setCreateEvent] = useState(false);
    const [eventTitle, setEventTitle] = useState();
    const [targetEvent, setTargetEvent] = useState();
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD')); // Changed to dynamic today
    const [currentView, setCurrentView] = useState("month");
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]); // Store all events for filtering
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState(null); // null means show all

    const fetchEvents = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*');

            if (error) throw error;

            if (data) {
                // Filter for upcoming events
                const now = new Date().toISOString();
                const upcoming = data
                    .filter(evt => evt.start_date >= now)
                    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                    .slice(0, 5);
                setUpcomingEvents(upcoming);

                // Map for FullCalendar
                const mappedEvents = data.map(evt => ({
                    id: evt.id,
                    title: evt.title,
                    start: evt.start_date,
                    end: evt.end_date,
                    backgroundColor: evt.background_color,
                    borderColor: evt.background_color,
                    extendedProps: {
                        description: evt.description,
                        location: evt.location,
                        priority: evt.priority,
                        category: evt.category,
                        visibility: evt.visibility,
                        notified: evt.notified,
                        created_at: evt.created_at,
                        updated_at: evt.updated_at // Assuming this exists or will be null
                    }
                }));
                setAllEvents(mappedEvents);
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Calendar height calculation
    const onlyHeight = useWindowHeight();
    const Calender_height = topNavCollapsed ? onlyHeight - 15 : onlyHeight - 70;

    // Handle calendar navigation (prev, next, today)
    const handleChange = (action) => {
        const calendarApi = calendarRef.current.getApi();
        if (action === "today") {
            calendarApi.today();
        } else if (action === "prev") {
            calendarApi.prev();
        } else if (action === "next") {
            calendarApi.next();
        }
        setDate(calendarApi.getDate());
    };

    // Handle view change (month, week, day, list)
    const handleView = (view) => {
        const calendarApi = calendarRef.current.getApi();
        if (view === "month") {
            calendarApi.changeView('dayGridMonth');
        } else if (view === "week") {
            calendarApi.changeView('timeGridWeek');
        } else if (view === "day") {
            calendarApi.changeView('timeGridDay');
        } else if (view === "list") {
            calendarApi.changeView('listWeek');
        }
        setCurrentView(view);
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    // Handle category filter changes from sidebar
    const handleCategoryFilterChange = (activeCategories) => {
        if (activeCategories.length === 0) {
            // No categories selected, show nothing
            setEvents([]);
        } else {
            // Filter events by selected categories
            const filtered = allEvents.filter(event =>
                activeCategories.includes(event.extendedProps.category) ||
                !event.extendedProps.category // Show events without category
            );
            setEvents(filtered);
        }
    };

    const renderEventContent = (eventInfo) => {
        const isReminder = eventInfo.event.extendedProps.location === 'REMINDER';
        return (
            <div className="d-flex align-items-center gap-1 overflow-hidden px-1 w-100">
                {isReminder ?
                    <Bell size={12} weight="fill" className="flex-shrink-0" /> :
                    <CalendarBlank size={12} weight="bold" className="flex-shrink-0" />
                }
                <span className="text-truncate fw-medium fs-7">{eventInfo.timeText && <span className="me-1">{eventInfo.timeText}</span>}{eventInfo.event.title}</span>
            </div>
        );
    };

    return (
        <>
            <div className="hk-pg-body py-0">
                <div className={classNames("calendarapp-wrap", { "calendarapp-sidebar-toggle": !showSidebar })} >
                    <CalendarSidebar
                        showSidebar={showSidebar}
                        toggleSidebar={() => setShowSidebar(!showSidebar)}
                        createNewEvent={() => setCreateEvent(!createEvent)}
                        refreshEvents={fetchEvents}
                        upcomingEvents={upcomingEvents}
                        onCategoryFilterChange={handleCategoryFilterChange}
                    />
                    <div className="calendarapp-content">
                        <div id="calendar" className="w-100">

                            {/* Redesigned Header */}
                            <header className="cd-header redesigned-header">
                                {/* Left: Month/Year Title */}
                                <div className="cd-header-left">
                                    <h4 className="cd-month-title">{dayjs(date).format('MMMM YYYY')}</h4>
                                </div>

                                {/* Center: View Toggle Buttons */}
                                <div className="cd-header-center">
                                    <ButtonGroup className="view-toggle-group">
                                        <Button
                                            variant={currentView === "day" ? "primary" : "outline-secondary"}
                                            onClick={() => handleView("day")}
                                            className="view-toggle-btn"
                                        >
                                            day
                                        </Button>
                                        <Button
                                            variant={currentView === "week" ? "primary" : "outline-secondary"}
                                            onClick={() => handleView("week")}
                                            className="view-toggle-btn"
                                        >
                                            week
                                        </Button>
                                        <Button
                                            variant={currentView === "month" ? "primary" : "outline-secondary"}
                                            onClick={() => handleView("month")}
                                            className="view-toggle-btn"
                                        >
                                            month
                                        </Button>
                                    </ButtonGroup>
                                </div>

                                {/* Right: Navigation Controls */}
                                <div className="cd-header-right">
                                    <ButtonGroup className="nav-button-group">
                                        <Button
                                            variant="outline-secondary"
                                            className="nav-btn"
                                            onClick={() => handleChange("prev")}
                                        >
                                            <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            className="nav-btn"
                                            onClick={() => handleChange("next")}
                                        >
                                            <FontAwesomeIcon icon={faChevronRight} size="sm" />
                                        </Button>
                                    </ButtonGroup>
                                    <Button
                                        variant="outline-secondary"
                                        className="today-btn ms-2"
                                        onClick={() => handleChange("today")}
                                    >
                                        today
                                    </Button>
                                </div>

                                <div className={classNames("hk-sidebar-togglable", { "active": !showSidebar })} onClick={toggleSidebar} />
                            </header>

                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                initialDate={date}
                                headerToolbar={false}
                                themeSystem='bootstrap'
                                height={Calender_height - 130}
                                windowResizeDelay={500}
                                droppable={true}
                                eventContent={renderEventContent}
                                editable={true}
                                events={events}
                                eventClick={function (info) {
                                    setTargetEvent(info.event);
                                    setEventTitle(info.event._def.title);
                                    setShowEventInfo(true);
                                }
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Info (Modal) */}
            <EventsModal
                show={showEventInfo}
                info={eventTitle}
                event={targetEvent}
                onClose={() => setShowEventInfo(false)}
                onUpdate={fetchEvents}
            />

            {/* New Event */}
            <CreateNewEvent
                calendarRef={calendarRef}
                show={createEvent}
                hide={() => setCreateEvent(!createEvent)}
                refreshEvents={fetchEvents}
            />
        </>

    )
}

const mapStateToProps = ({ theme }) => {
    const { topNavCollapsed } = theme;
    return { topNavCollapsed }
};

export default connect(mapStateToProps, { toggleTopNav })(Calendar);