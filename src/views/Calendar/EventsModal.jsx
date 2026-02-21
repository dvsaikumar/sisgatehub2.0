import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Badge } from 'react-bootstrap';
import dayjs from '../../lib/dayjs';
import Swal from 'sweetalert2';
import { Calendar, Clock, MapPin, List, Eye, Trash, Pencil, X, CheckCircle, WarningCircle, Bell, Repeat, CalendarBlank } from '@phosphor-icons/react';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.css';
import 'animate.css';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import CreatableSelect from 'react-select/creatable';
import { useCategories } from '../../hooks/useCategories';
import { useCalendars } from '../../hooks/useCalendars';
import RecurrenceSelector from './RecurrenceSelector';
import ReminderSelector from './ReminderSelector';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';

const EventsModal = ({ show, onClose, info, event, onUpdate }) => {
    const [editable, setEditable] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // DayJS objects for MUI
    const [editStartDateTime, setEditStartDateTime] = useState(dayjs());
    const [editEndDateTime, setEditEndDateTime] = useState(dayjs().add(1, 'hour'));

    // const [editLocation, setEditLocation] = useState(''); // Location handled by discriminator
    const [editCategory, setEditCategory] = useState('');
    const [editPriority, setEditPriority] = useState('Medium');
    const [editVisibility, setEditVisibility] = useState('Public');
    const [eventColor, setEventColor] = useState("#009B84");

    // Recurrence & Reminder edit state
    const [editRecurrenceRule, setEditRecurrenceRule] = useState(null);
    const [editReminderMinutes, setEditReminderMinutes] = useState([]);
    const [editBusyStatus, setEditBusyStatus] = useState('busy');
    const [editCalendarId, setEditCalendarId] = useState(null);

    // Email Handling
    const [editEmails, setEditEmails] = useState([]);
    const [emailOptions, setEmailOptions] = useState([]);
    const [emailError, setEmailError] = useState("");

    // Fetch categories & calendars
    const { categories } = useCategories();
    const { calendars } = useCalendars();

    // Fetch Users for Email Selection
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('email, full_name, display_name');

                if (error) throw error;

                if (data) {
                    const options = data
                        .filter(u => u.email)
                        .map(u => ({
                            value: u.email,
                            label: `${u.full_name || u.display_name || 'User'} (${u.email})`
                        }));
                    setEmailOptions(options);
                }
            } catch (err) {
                console.error("Error fetching users for email list:", err);
            }
        };
        fetchUsers();
    }, []);

    // Initialize edit form when entering edit mode
    const startEditing = () => {
        const eProps = event?.extendedProps || {};
        setEditTitle(event?.title || '');
        setEditDescription(eProps.description || '');
        setEditCategory(eProps.category || 'Work');
        setEditPriority(eProps.priority || 'Medium');
        setEditVisibility(eProps.visibility || 'Public');
        setEventColor(event?.backgroundColor || '#009B84');
        setEditRecurrenceRule(eProps.recurrence_rule || null);
        setEditReminderMinutes(eProps.reminder_minutes || []);
        setEditBusyStatus(eProps.busy_status || 'busy');
        setEditCalendarId(eProps.calendar_id || null);

        if (event?.start) {
            setEditStartDateTime(dayjs(event.start));
        }
        if (event?.end) {
            setEditEndDateTime(dayjs(event.end));
        } else if (event?.start) {
            setEditEndDateTime(dayjs(event.start).add(1, 'hour'));
        }

        // Parse Emails
        if (eProps.extra_email) {
            const emailArray = eProps.extra_email.split(',').map(e => ({ value: e.trim(), label: e.trim() }));
            setEditEmails(emailArray);
        } else {
            setEditEmails([]);
        }

        setEditable(true);
    };

    // Helper: human-readable recurrence text
    const getRecurrenceText = (rule) => {
        if (!rule) return null;
        if (rule.includes('FREQ=DAILY')) return 'Daily';
        if (rule.includes('FREQ=WEEKLY')) {
            const match = rule.match(/BYDAY=([A-Z,]+)/);
            return match ? `Weekly on ${match[1]}` : 'Weekly';
        }
        if (rule.includes('FREQ=MONTHLY')) return 'Monthly';
        if (rule.includes('FREQ=YEARLY')) return 'Yearly';
        return 'Custom';
    };

    // Helper: reminder label
    const getReminderLabel = (minutes) => {
        if (minutes === 0) return 'At event time';
        if (minutes < 60) return `${minutes} min before`;
        if (minutes === 60) return '1 hour before';
        if (minutes < 1440) return `${minutes / 60} hours before`;
        if (minutes === 1440) return '1 day before';
        if (minutes === 10080) return '1 week before';
        return `${minutes} min before`;
    };

    const handleEmailInputChange = (inputValue, { action }) => {
        if (action === 'input-change') {
            if (inputValue && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputValue)) {
                setEmailError("Invalid email format");
            } else {
                setEmailError("");
            }
        }
    };

    // Save edited reminder
    const saveChanges = async () => {
        if (!editTitle.trim()) {
            toast.error("Title is required");
            return;
        }

        // Validate Emails
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const invalidEmails = editEmails.filter(opt => !emailRegex.test(opt.value));
        if (invalidEmails.length > 0) {
            toast.error(`Please provide valid email addresses. The following are incorrect: ${invalidEmails.map(e => e.value).join(', ')}`);
            return;
        }

        setSaving(true);
        try {
            const emailString = editEmails.map(opt => opt.value).join(',');
            const eProps = event?.extendedProps || {};
            const isReminder = eProps.location === 'REMINDER';

            const payload = {
                title: editTitle,
                description: editDescription,
                start_date: editStartDateTime.toISOString(),
                end_date: editEndDateTime.toISOString(),
                category: editCategory,
                background_color: eventColor,
                extra_email: emailString || null,
                recurrence_rule: editRecurrenceRule || null,
                is_recurring: !!editRecurrenceRule,
                reminder_minutes: editReminderMinutes.length > 0 ? editReminderMinutes : null,
                busy_status: editBusyStatus,
                calendar_id: editCalendarId || null,
            };

            if (isReminder) {
                // Keep existing priority/visibility for reminders
            } else {
                payload.priority = editPriority;
                payload.visibility = editVisibility;
            }

            // Location stays same (discriminator)

            const { error } = await supabase
                .from('reminders')
                .update(payload)
                .eq('id', event.id);

            if (error) throw error;

            toast.success('Updated successfully!');
            setEditable(false);

            // Trigger parent refresh
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating:', error);
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    /*Event Delete*/
    const DeletEvent = () => {
        Swal.fire({
            html:
                '<div class="mb-3"><div class="avatar avatar-icon avatar-soft-danger avatar-xl"><span class="initial-wrap"><i class="ri-delete-bin-line"></i></span></div></div><h5 class="text-danger">Delete Item?</h5><p class="text-muted">This action cannot be undone.</p>',
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-light text-muted',
                container: 'swal2-has-bg'
            },
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            showDenyButton: false,
            width: 380
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
                    toast.success("Deleted successfully");
                } catch (error) {
                    toast.error("Failed to delete");
                }
            }
        })
    }

    // Safe access to event props
    const eProps = event?.extendedProps || {};
    const isReminder = eProps.location === 'REMINDER';
    const startDate = event?.start ? dayjs(event.start).format('DD MMM, YYYY') : '';
    const startDayName = event?.start ? dayjs(event.start).format('dddd') : '';
    const fullDateRange = event?.start ?
        `${dayjs(event.start).format('h:mm A')} - ${dayjs(event.end || event.start).format('h:mm A')}` : '';

    // Check if reminder is in the past (completed)
    const isPast = event?.start ? dayjs(event.start).isBefore(dayjs()) : false;

    // Stop editing when modal closes
    const handleClose = () => {
        setEditable(false);
        onClose();
    };

    // Helper for icons with backgrounds
    const IconBox = ({ icon: Icon, color }) => (
        <div style={{
            width: 36, height: 36,
            borderRadius: '10px',
            background: color ? `${color}15` : '#f3f4f6',
            color: color || '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 12
        }}>
            <Icon size={18} weight="duotone" />
        </div>
    );

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size={editable ? 'lg' : undefined}
            contentClassName="border-0 shadow-lg overflow-hidden"
            style={{ borderRadius: '16px' }}
        >
            {/* Custom Header */}
            <div className="position-relative" style={{
                height: '8px',
                background: editable ? '#e5e7eb' : (event?.backgroundColor || '#009B84')
            }} />

            <div className="px-4 pt-4 pb-0 d-flex justify-content-between align-items-start">
                <div>
                    {!editable && (
                        <Badge bg="light" text="dark" className="border fw-normal mb-2" style={{ fontSize: '0.75rem' }}>
                            {eProps.category || 'Event'}
                        </Badge>
                    )}
                </div>
                <div className="d-flex align-items-center gap-1" style={{ margin: '-8px -8px 0 0' }}>
                    {!editable && (
                        <>
                            {!isPast && (
                                <button
                                    className="btn btn-icon btn-sm btn-ghost-dark rounded-circle"
                                    onClick={startEditing}
                                    title="Edit"
                                >
                                    <Pencil size={20} />
                                </button>
                            )}
                            <button
                                className="btn btn-icon btn-sm btn-ghost-danger rounded-circle text-danger"
                                onClick={DeletEvent}
                                title="Delete"
                            >
                                <Trash size={20} />
                            </button>
                            <div className="vr h-50 my-auto mx-2 opacity-25"></div>
                        </>
                    )}
                    <button
                        className="btn btn-icon btn-sm btn-ghost-secondary rounded-circle"
                        onClick={handleClose}
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            <Modal.Body className="px-4 pt-2 pb-4">
                {!editable ? (
                    // VIEW MODE
                    <div className="animate__animated animate__fadeIn">
                        {/* Title */}
                        <div className="d-flex align-items-center gap-2 mb-4">
                            {isReminder ? <Bell size={28} weight="fill" className="text-warning" /> : null}
                            <h3 className="fw-bold text-dark mb-0">{info}</h3>
                        </div>

                        {/* Hero Metric: Date */}
                        <div className="d-flex align-items-center mb-4 p-3 rounded-3 bg-light-soft border-0">
                            <div className="text-center pe-3 border-end">
                                <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                    {dayjs(event?.start).format('MMM')}
                                </div>
                                <div className="fw-bolder h4 mb-0 text-dark">
                                    {dayjs(event?.start).format('DD')}
                                </div>
                            </div>
                            <div className="ps-3">
                                <div className="fw-semibold text-dark mb-0">{startDayName}</div>
                                <div className="text-muted small">{fullDateRange}</div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="row g-3 mb-4">
                            {/* For Event, show extra details if standard event */}
                            {!isReminder && (
                                <>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center">
                                            <IconBox icon={WarningCircle} color={
                                                eProps.priority === 'High' || eProps.priority === 'Urgent' ? '#EF4444' : '#F59E0B'
                                            } />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>PRIORITY</div>
                                                <div className="fw-medium text-dark">{eProps.priority || 'Medium'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center">
                                            <IconBox icon={Eye} color="#6B7280" />
                                            <div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>VISIBILITY</div>
                                                <div className="fw-medium text-dark">{eProps.visibility || 'Public'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Recurrence Info */}
                        {eProps.recurrence_rule && (
                            <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-2" style={{ background: '#f0fdf4' }}>
                                <Repeat size={16} weight="bold" className="text-success" />
                                <span className="small fw-medium text-success">
                                    Repeats {getRecurrenceText(eProps.recurrence_rule)}
                                </span>
                            </div>
                        )}

                        {/* Reminders Info */}
                        {eProps.reminder_minutes && eProps.reminder_minutes.length > 0 && (
                            <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-2" style={{ background: '#fffbeb' }}>
                                <Bell size={16} weight="bold" className="text-warning" />
                                <span className="small fw-medium text-dark">
                                    {eProps.reminder_minutes.map(m => getReminderLabel(m)).join(', ')}
                                </span>
                            </div>
                        )}

                        {/* Busy Status */}
                        {eProps.busy_status && eProps.busy_status !== 'busy' && (
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <CalendarBlank size={14} className="text-muted" />
                                <span className="small text-muted">Show as: <strong>{eProps.busy_status}</strong></span>
                            </div>
                        )}

                        {/* Description */}
                        {eProps.description && (
                            <div className="mb-4">
                                <div className="d-flex align-items-start bg-white border rounded-3 p-3">
                                    <List size={20} className="text-muted mt-1 me-3 flex-shrink-0" />
                                    <p className="mb-0 text-secondary" style={{ lineHeight: '1.6' }}>
                                        {eProps.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Recipients */}
                        {eProps.extra_email && (
                            <div className="mb-4">
                                <small className="text-muted fw-bold d-block mb-1">RECIPIENTS</small>
                                <div className="d-flex flex-wrap gap-1">
                                    {eProps.extra_email.split(',').map((email, i) => (
                                        <Badge key={i} bg="light" text="dark" className="border">
                                            {email}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    // EDIT MODE - MODERN FORM
                    <Form className="animate__animated animate__fadeIn">
                        <h4 className="fw-bold mb-4">{isReminder ? 'Edit Reminder' : 'Edit Event'}</h4>

                        <Row className="mb-3">
                            <Col sm={12} as={Form.Group}>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="form-control-lg"
                                />
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </Form.Group>

                        {/* Edit Emails with Validation */}
                        <Col sm={12} as={Form.Group} className="mb-3">
                            <Form.Label className="d-flex justify-content-between align-items-center">
                                <span>Extra Emails</span>
                                {emailError && <span className="text-danger small fw-bold">{emailError}</span>}
                            </Form.Label>
                            <CreatableSelect
                                isMulti
                                options={emailOptions}
                                value={editEmails}
                                onChange={(val) => { setEditEmails(val); setEmailError(""); }}
                                onInputChange={handleEmailInputChange}
                                placeholder="Select users or type email..."
                                classNamePrefix="react-select"
                                isValidNewOption={(inputValue) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputValue)}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderColor: state.isFocused ? '#009B84' : '#E0E0E0',
                                        borderRadius: '8px',
                                        minHeight: '44px',
                                        boxShadow: state.isFocused ? '0 0 0 1px #009B84' : 'none',
                                        backgroundColor: '#F9FAFB',
                                        '&:hover': {
                                            borderColor: '#009B84'
                                        },
                                        padding: '2px'
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: '#E5E7EB',
                                        borderRadius: '6px',
                                        padding: '2px 4px',
                                        margin: '2px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#374151',
                                        fontSize: '0.875rem',
                                        padding: '2px 6px',
                                        paddingRight: '4px',
                                        fontWeight: 500
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#6B7280',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginLeft: '2px',
                                        padding: '2px',
                                        '&:hover': {
                                            backgroundColor: '#D1D5DB',
                                            color: '#1F2937',
                                        },
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: '#9CA3AF'
                                    })
                                }}
                            />
                        </Col>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Row className="mb-3">
                                <Col sm={isReminder ? 12 : 6}>
                                    <Form.Label>Start Date & Time</Form.Label>
                                    <DateTimePicker
                                        value={editStartDateTime}
                                        onChange={(newVal) => {
                                            setEditStartDateTime(newVal);
                                            // Auto adjust end if reminder (or even event logic?)
                                            // Let's keep simple sync for reminder
                                            if (newVal) {
                                                const diff = editEndDateTime.diff(editStartDateTime);
                                                setEditEndDateTime(newVal.add(Math.max(diff, 3600 * 1000), 'milliseconds'));
                                            }
                                        }}
                                        format="DD-MM-YYYY hh:mm A"
                                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                        viewRenderers={{
                                            hours: renderTimeViewClock,
                                            minutes: renderTimeViewClock,
                                            seconds: renderTimeViewClock,
                                        }}
                                    />
                                </Col>
                                {!isReminder && (
                                    <Col sm={6}>
                                        <Form.Label>End Date & Time</Form.Label>
                                        <DateTimePicker
                                            value={editEndDateTime}
                                            onChange={setEditEndDateTime}
                                            minDateTime={editStartDateTime}
                                            format="DD-MM-YYYY hh:mm A"
                                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                            viewRenderers={{
                                                hours: renderTimeViewClock,
                                                minutes: renderTimeViewClock,
                                                seconds: renderTimeViewClock,
                                            }}
                                        />
                                    </Col>
                                )}
                            </Row>
                        </LocalizationProvider>

                        {/* Recurrence & Reminders */}
                        {!isReminder && (
                            <Row className="mb-3">
                                <Col sm={12} className="mb-3">
                                    <RecurrenceSelector
                                        value={editRecurrenceRule}
                                        onChange={setEditRecurrenceRule}
                                        eventDate={editStartDateTime}
                                    />
                                </Col>
                            </Row>
                        )}

                        <Row className="mb-3">
                            <Col sm={12}>
                                <ReminderSelector
                                    value={editReminderMinutes}
                                    onChange={setEditReminderMinutes}
                                />
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col sm={6} as={Form.Group} className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat.name}>{cat.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col sm={6} as={Form.Group} className="mb-3">
                                <Form.Label>Calendar</Form.Label>
                                <Form.Select
                                    value={editCalendarId || ''}
                                    onChange={e => setEditCalendarId(e.target.value || null)}
                                >
                                    <option value="">No calendar</option>
                                    {calendars.map(cal => (
                                        <option key={cal.id} value={cal.id}>{cal.name}</option>
                                    ))}
                                </Form.Select>
                            </Col>

                            {!isReminder && (
                                <>
                                    <Col sm={4} as={Form.Group} className="mb-3">
                                        <Form.Label>Priority</Form.Label>
                                        <Form.Select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </Form.Select>
                                    </Col>
                                    <Col sm={4} as={Form.Group} className="mb-3">
                                        <Form.Label>Visibility</Form.Label>
                                        <Form.Select value={editVisibility} onChange={(e) => setEditVisibility(e.target.value)}>
                                            <option value="Public">Public</option>
                                            <option value="Private">Private</option>
                                        </Form.Select>
                                    </Col>
                                    <Col sm={4} as={Form.Group} className="mb-3">
                                        <Form.Label>Show As</Form.Label>
                                        <Form.Select value={editBusyStatus} onChange={(e) => setEditBusyStatus(e.target.value)}>
                                            <option value="busy">Busy</option>
                                            <option value="free">Free</option>
                                            <option value="tentative">Tentative</option>
                                        </Form.Select>
                                    </Col>
                                </>
                            )}
                        </Row>

                        <div className="d-flex justify-content-end gap-2 border-top pt-3">
                            <Button variant="light" onClick={() => setEditable(false)} disabled={saving} className="px-4">
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={saveChanges} disabled={saving} className="px-4 fw-medium">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default EventsModal;
