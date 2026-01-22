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
import EventsDrawer from './EventsDrawer';
import CreateNewEvent from './CreateNewEvent';
import 'bootstrap-icons/font/bootstrap-icons.css';
//Redux
import { connect, useDispatch } from 'react-redux';
import { toggleTopNav, toggleCollapsedNav } from '../../redux/action/Theme';
//Icons
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChevronDown, ChevronUp } from 'react-feather';
import { supabase } from '../../configs/supabaseClient';
import useReminderPoller from './useReminderPoller';
import '../../styles/css/calendar-fixes.css';

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
    const [upcomingEvents, setUpcomingEvents] = useState([]);

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
                    .slice(0, 3);
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
                        visibility: evt.visibility
                    }
                }));
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
                    />
                    <div className="calendarapp-content">
                        <div id="calendar" className="w-100">

                            <header className="cd-header">
                                <div className="d-flex flex-1 justify-content-start">
                                    <Button variant="outline-light me-3" onClick={() => handleChange("today")} >Today</Button>
                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleChange("prev")} >
                                        <span className="icon">
                                            <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                                        </span>
                                    </Button>
                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleChange("next")} >
                                        <span className="icon">
                                            <FontAwesomeIcon icon={faChevronRight} size="sm" />
                                        </span>
                                    </Button>
                                </div>
                                <div className="d-flex flex-1 justify-content-center">
                                    <h4 className="mb-0">{dayjs(date).format('MMMM' + ' ' + 'YYYY')}</h4>
                                </div>
                                <div className="cd-options-wrap d-flex flex-1 justify-content-end">
                                    <ButtonGroup className="d-none d-md-flex">
                                        <Button variant="outline-light" onClick={() => handleView("month")} active={currentView === "month"} >month</Button>
                                        <Button variant="outline-light" onClick={() => handleView("week")} active={currentView === "week"}>week</Button>
                                        <Button variant="outline-light" onClick={() => handleView("day")} active={currentView === "day"}>day</Button>
                                        <Button variant="outline-light" onClick={() => handleView("list")} active={currentView === "list"}>list</Button>
                                    </ButtonGroup>
                                    <Button as="a" variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover hk-navbar-togglable" onClick={() => toggleTopNav(!topNavCollapsed)} >
                                        <span className="icon">
                                            <span className="feather-icon">
                                                {
                                                    topNavCollapsed ? <ChevronDown /> : <ChevronUp />
                                                }
                                            </span>
                                        </span>
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

            {/* Event Info */}
            <EventsDrawer show={showEventInfo} info={eventTitle} event={targetEvent} onClose={() => setShowEventInfo(!showEventInfo)} />

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