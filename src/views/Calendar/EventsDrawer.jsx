import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import classNames from 'classnames';
import dayjs from '../../lib/dayjs';
import Swal from 'sweetalert2';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import * as Icons from 'react-feather';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.css';
import 'animate.css';
// Own Custom Components
import HkBadge from '../../components/@hk-badge/@hk-badge';
import HkChips from '../../components/@hk-chips/@hk-chips';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';

//Images
import avatar11 from '../../assets/img/avatar11.jpg';
import avatar12 from '../../assets/img/avatar12.jpg';
import avatar13 from '../../assets/img/avatar13.jpg';

const EventsDrawer = ({ show, onClose, info, event, onUpdate }) => {
    const [editable, setEditable] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState(new Date());
    const [editStartTime, setEditStartTime] = useState('09:00');
    const [editEndDate, setEditEndDate] = useState(new Date());
    const [editEndTime, setEditEndTime] = useState('10:00');
    const [editLocation, setEditLocation] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editPriority, setEditPriority] = useState('Medium');
    const [editVisibility, setEditVisibility] = useState('Public');
    const [eventColor, setEventColor] = useState("#009B84");

    // Initialize edit form when entering edit mode
    const startEditing = () => {
        const eProps = event?.extendedProps || {};
        setEditTitle(event?.title || '');
        setEditDescription(eProps.description || '');
        setEditLocation(eProps.location || '');
        setEditCategory(eProps.category || 'Meetings');
        setEditPriority(eProps.priority || 'Medium');
        setEditVisibility(eProps.visibility || 'Public');
        setEventColor(event?.backgroundColor || '#009B84');

        if (event?.start) {
            setEditStartDate(new Date(event.start));
            setEditStartTime(dayjs(event.start).format('HH:mm'));
        }
        if (event?.end) {
            setEditEndDate(new Date(event.end));
            setEditEndTime(dayjs(event.end).format('HH:mm'));
        }
        setEditable(true);
    };

    const hideCalender = (ev, picker) => {
        picker.container.find(".calendar-table").hide();
    };

    const handleClose = () => {
        if (editable) {
            setEditable(false);
        } else {
            onClose();
        }
    };

    // Save edited reminder
    const saveChanges = async () => {
        setSaving(true);
        try {
            const startDateTime = new Date(`${dayjs(editStartDate).format('YYYY-MM-DD')}T${editStartTime}`);
            const endDateTime = new Date(`${dayjs(editEndDate).format('YYYY-MM-DD')}T${editEndTime}`);

            const { error } = await supabase
                .from('reminders')
                .update({
                    title: editTitle,
                    description: editDescription,
                    start_date: startDateTime.toISOString(),
                    end_date: endDateTime.toISOString(),
                    location: editLocation,
                    category: editCategory,
                    priority: editPriority,
                    visibility: editVisibility,
                    background_color: eventColor,
                })
                .eq('id', event.id);

            if (error) throw error;

            toast.success('Reminder updated successfully!');
            setEditable(false);

            // Trigger parent refresh
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating reminder:', error);
            toast.error('Failed to update reminder');
        } finally {
            setSaving(false);
        }
    };

    /*Event Delete*/
    const DeletEvent = () => {
        Swal.fire({
            html:
                '<div class="mb-3"><i class="ri-delete-bin-6-line fs-5 text-danger"></i></div><h5 class="text-danger">Delete Reminder?</h5><p>Deleting a reminder will permanently remove it.</p>',
            customClass: {
                confirmButton: 'btn btn-outline-secondary text-danger',
                cancelButton: 'btn btn-outline-secondary text-grey',
                container: 'swal2-has-bg'
            },
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Keep',
            reverseButtons: true,
            showDenyButton: false,
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        }).then(async (result) => {
            if (result.value) {
                try {
                    const { error } = await supabase
                        .from('reminders')
                        .delete()
                        .eq('id', event.id);

                    if (error) throw error;

                    event.remove(); // Remove from FullCalendar UI
                    onClose();

                    Swal.fire({
                        html:
                            '<div class="d-flex align-items-center"><i class="ri-delete-bin-5-fill me-2 fs-3 text-danger"></i><h5 class="text-danger mb-0">Reminder deleted!</h5></div>',
                        timer: 2000,
                        customClass: {
                            content: 'p-0 text-left',
                            actions: 'justify-content-start',
                        },
                        showConfirmButton: false,
                        buttonsStyling: false,
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    })
                } catch (error) {
                    toast.error("Failed to delete reminder");
                }
            }
        })
    }

    // Safe access to event props
    const eProps = event?.extendedProps || {};
    const startDate = event?.start ? dayjs(event.start).format('DD-MM-YYYY') : '';
    const endDate = event?.end ? dayjs(event.end).format('DD-MM-YYYY') : startDate;
    const startTimeComponent = event?.start ? dayjs(event.start).format('h:mm A') : '';
    const endTimeComponent = event?.end ? dayjs(event.end).format('h:mm A') : '';

    // Check if reminder is in the past (completed)
    const isPastReminder = event?.start ? dayjs(event.start).isBefore(dayjs()) : false;

    return (
        <div className={classNames("hk-drawer calendar-drawer drawer-right", { "drawer-toggle": show })} >
            <div className={classNames({ "d-none": editable })}>
                <div className="drawer-header">
                    <div className="drawer-header-action">
                        {/* Show edit button only for future/incomplete reminders */}
                        {!isPastReminder && (
                            <Button size="sm" variant="flush-secondary" id="edit_event" className="btn-icon btn-rounded flush-soft-hover" onClick={startEditing}>
                                <span className="icon">
                                    <span className="feather-icon">
                                        <Icons.Edit2 />
                                    </span>
                                </span>
                            </Button>
                        )}
                        <Button size="sm" variant="flush-secondary" id="del_event" className="btn-icon btn-rounded flush-soft-hover" onClick={DeletEvent} >
                            <span className="icon">
                                <span className="feather-icon">
                                    <Icons.Trash2 />
                                </span>
                            </span>
                        </Button>
                        <Button bsPrefix="btn-close" className="drawer-close" onClick={onClose} >
                            <span aria-hidden="true">×</span>
                        </Button>
                    </div>
                </div>
                <div className="drawer-body">
                    <SimpleBar className="nicescroll-bar">
                        <div className="drawer-content-wrap">
                            <div className="event-head mb-4">
                                <HkBadge bg="violet" indicator className="badge-indicator-xl flex-shrink-0 me-2" style={{ backgroundColor: event?.backgroundColor }} />
                                <div>
                                    <div className="event-name">{info}</div>
                                    <span>{eProps.category || 'Event'}</span>
                                </div>
                            </div>
                            <ul className="event-detail">
                                <li>
                                    <span className="ev-icon-wrap">
                                        <span className="feather-icon">
                                            <Icons.Calendar />
                                        </span>
                                    </span>
                                    {startDate} {endDate !== startDate && `- ${endDate}`}
                                </li>
                                <li>
                                    <span className="ev-icon-wrap">
                                        <span className="feather-icon">
                                            <Icons.Clock />
                                        </span>
                                    </span>
                                    {startTimeComponent} {endTimeComponent && `- ${endTimeComponent}`}
                                </li>
                                {eProps.location && (
                                    <li>
                                        <span className="ev-icon-wrap">
                                            <span className="feather-icon">
                                                <Icons.MapPin />
                                            </span>
                                        </span>
                                        {eProps.location}
                                    </li>
                                )}
                                <li>
                                    <span className="ev-icon-wrap">
                                        <span className="feather-icon">
                                            <Icons.CheckSquare />
                                        </span>
                                    </span>
                                    {eProps.priority || 'Medium'} Priority
                                </li>
                                <li>
                                    <span className="ev-icon-wrap">
                                        <span className="feather-icon">
                                            <Icons.Eye />
                                        </span>
                                    </span>
                                    {eProps.visibility || 'Public'}
                                </li>

                                {eProps.description && (
                                    <li>
                                        <span className="ev-icon-wrap">
                                            <span className="feather-icon">
                                                <Icons.Menu />
                                            </span>
                                        </span>
                                        {eProps.description}
                                    </li>
                                )}
                            </ul>

                            {/* Show status badge */}
                            {isPastReminder && (
                                <div className="mt-3 p-2 bg-light rounded">
                                    <span className="text-muted small">
                                        <Icons.CheckCircle size={14} className="me-1 text-success" />
                                        This reminder has passed
                                    </span>
                                </div>
                            )}
                        </div>
                    </SimpleBar>
                </div>
            </div>

            {/* Edit Mode */}
            <div className={classNames({ "d-none": !editable })}>
                <div className="drawer-header">
                    <div className="drawer-header-action">
                        <h6 className="mb-0 flex-grow-1">Edit Reminder</h6>
                        <Button bsPrefix="btn-close" className="drawer-close" onClick={handleClose} >
                            <span aria-hidden="true">×</span>
                        </Button>
                    </div>
                </div>
                <div className="drawer-body">
                    <SimpleBar className="nicescroll-bar">
                        <div className="drawer-content-wrap">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Reminder title"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                </Form.Group>

                                <div className="row gx-3">
                                    <div className="col-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Date</Form.Label>
                                            <DateRangePicker
                                                initialSettings={{
                                                    singleDatePicker: true,
                                                    showDropdowns: true,
                                                    startDate: editStartDate,
                                                    locale: { format: 'DD-MM-YYYY' }
                                                }}
                                                onApply={(ev, picker) => setEditStartDate(new Date(picker.startDate))}
                                            >
                                                <Form.Control type="text" />
                                            </DateRangePicker>
                                        </Form.Group>
                                    </div>
                                    <div className="col-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={editStartTime}
                                                onChange={(e) => setEditStartTime(e.target.value)}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                <div className="row gx-3">
                                    <div className="col-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Date</Form.Label>
                                            <DateRangePicker
                                                initialSettings={{
                                                    singleDatePicker: true,
                                                    showDropdowns: true,
                                                    startDate: editEndDate,
                                                    locale: { format: 'DD-MM-YYYY' }
                                                }}
                                                onApply={(ev, picker) => setEditEndDate(new Date(picker.startDate))}
                                            >
                                                <Form.Control type="text" />
                                            </DateRangePicker>
                                        </Form.Group>
                                    </div>
                                    <div className="col-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={editEndTime}
                                                onChange={(e) => setEditEndTime(e.target.value)}
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editLocation}
                                        onChange={(e) => setEditLocation(e.target.value)}
                                        placeholder="Optional location"
                                    />
                                </Form.Group>

                                <div className="row gx-3">
                                    <div className="col-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Priority</Form.Label>
                                            <Form.Select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                                <option value="Urgent">Urgent</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                    <div className="col-6">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Visibility</Form.Label>
                                            <Form.Select value={editVisibility} onChange={(e) => setEditVisibility(e.target.value)}>
                                                <option value="Public">Public</option>
                                                <option value="Private">Private</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </div>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label>Color</Form.Label>
                                    <InputGroup className="color-picker">
                                        <InputGroup.Text className="colorpicker-input-addon">
                                            <Form.Control
                                                type="color"
                                                value={eventColor}
                                                onChange={(e) => setEventColor(e.target.value)}
                                            />
                                        </InputGroup.Text>
                                        <Form.Control type="text" value={eventColor} readOnly />
                                    </InputGroup>
                                </Form.Group>
                            </Form>
                        </div>
                    </SimpleBar>
                </div>
                <div className="drawer-footer d-flex justify-content-end">
                    <Button variant="secondary" className="me-2" onClick={() => setEditable(false)} disabled={saving}>
                        Discard
                    </Button>
                    <Button variant="primary" onClick={saveChanges} disabled={saving || !editTitle.trim()}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div >

    )
}

export default EventsDrawer
