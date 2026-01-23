import React, { useState, useRef, useEffect } from 'react';
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import dayjs from '../../lib/dayjs';
import { useCategories } from '../../hooks/useCategories';
import { Paperclip, X, File } from '@phosphor-icons/react';
import CreatableSelect from 'react-select/creatable';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';

const CreateNewEvent = ({ show, hide, calendarRef, refreshEvents }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [emailOptions, setEmailOptions] = useState([]);
    const [emailError, setEmailError] = useState("");

    // Date Time State using Dayjs
    const [startDateTime, setStartDateTime] = useState(dayjs().set('hour', 9).set('minute', 0));
    const [endDateTime, setEndDateTime] = useState(dayjs().set('hour', 10).set('minute', 0));

    const [isSingleTime, setIsSingleTime] = useState(false);

    // Location removed as per request
    const [category, setCategory] = useState("Work");
    const [visibility, setVisibility] = useState("Public");
    const [priority, setPriority] = useState("Medium");
    const [backgroundColor, setBackgroundColor] = useState("#009B84");
    const [loading, setLoading] = useState(false);

    // File Upload State
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch categories
    const { categories } = useCategories();

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
                        .filter(u => u.email) // Ensure email exists
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

    // Handle category change to update color
    const handleCategoryChange = (e) => {
        const selectedName = e.target.value;
        setCategory(selectedName);
        const selectedCat = categories.find(c => c.name === selectedName);
        if (selectedCat) {
            setBackgroundColor(selectedCat.color);
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit file size to 10MB
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB");
                return;
            }
            setAttachmentFile(file);
        }
    };

    const removeAttachment = () => {
        setAttachmentFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadAttachment = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `reminder-attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    };

    const updateEventList = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Event Name is required.");
            return;
        }

        // Validate Emails
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const invalidEmails = (selectedEmails || []).filter(opt => !emailRegex.test(opt.value));
        if (invalidEmails.length > 0) {
            toast.error(`Please provide valid email addresses. The following are incorrect: ${invalidEmails.map(e => e.value).join(', ')}`);
            return;
        }

        setLoading(true);
        try {
            let attachmentPath = null;

            // Upload attachment if present
            if (attachmentFile) {
                setUploading(true);
                try {
                    attachmentPath = await uploadAttachment(attachmentFile);
                } catch (uploadErr) {
                    console.error('Upload error:', uploadErr);
                    toast.error("Failed to upload file");
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            // Calculate final dates
            const finalStart = startDateTime.toISOString();
            let finalEnd;

            if (isSingleTime) {
                // Default to 1 hour after start time if single time
                finalEnd = startDateTime.add(1, 'hour').toISOString();
            } else {
                finalEnd = endDateTime.toISOString();
            }

            // Combine selected emails
            const emailString = selectedEmails.map(opt => opt.value).join(',');

            const { data, error } = await supabase
                .from('reminders')
                .insert([
                    {
                        title,
                        description,
                        start_date: finalStart,
                        end_date: finalEnd,
                        start_date: finalStart,
                        end_date: finalEnd,
                        location: "EVENT",
                        category,
                        category,
                        visibility,
                        priority,
                        background_color: backgroundColor,
                        extra_email: emailString || null,
                        attachment_path: attachmentPath
                    }
                ])
                .select();

            if (error) throw error;

            toast.success("Event created successfully!");

            // Refresh calendar events
            if (refreshEvents) refreshEvents();

            // Reset form
            setTitle("");
            setDescription("");
            setSelectedEmails([]);
            setCategory("Work");
            setAttachmentFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Reset dates to default
            setStartDateTime(dayjs().set('hour', 9).set('minute', 0));
            setEndDateTime(dayjs().set('hour', 10).set('minute', 0));

            hide();
        } catch (error) {
            console.error('Error creating event:', error);
            toast.error("Failed to create event");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    }

    // Default categories if loading or empty (fallback)
    const displayCategories = categories.length > 0 ? categories : [
        { name: 'Work', color: '#007D88' },
        { name: 'Personal', color: '#10B981' }
    ];

    // Date Time Handlers
    const handleEmailInputChange = (inputValue, { action }) => {
        if (action === 'input-change') {
            if (inputValue && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputValue)) {
                setEmailError("Invalid email format");
            } else {
                setEmailError("");
            }
        }
    };

    const handleStartChange = (newValue) => {
        setStartDateTime(newValue);
        // Automatically set end time to 1 hour after start time
        if (newValue) {
            setEndDateTime(newValue.add(1, 'hour'));
        }
    };

    return (
        <Modal show={show} onHide={hide} size="lg" centered >
            <Modal.Body>
                <Button bsPrefix='btn-close' onClick={hide} >
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-4">Create New Events</h5>
                <Form>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control className="cal-event-name" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Meeting with Client" />
                        </Col>
                        <Col sm={12} as={Form.Group} className="mb-3">
                            <Form.Label>Note/Description</Form.Label>
                            <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                        </Col>

                        <Col sm={12} as={Form.Group} className="mb-3">
                            <Form.Label className="d-flex justify-content-between align-items-center">
                                <span>Extra Emails</span>
                                {emailError && <span className="text-danger small fw-bold">{emailError}</span>}
                            </Form.Label>
                            <CreatableSelect
                                isMulti
                                options={emailOptions}
                                value={selectedEmails}
                                onChange={(val) => { setSelectedEmails(val); setEmailError(""); }}
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
                                        backgroundColor: '#E5E7EB', // Gray-200
                                        borderRadius: '6px',
                                        padding: '2px 4px',
                                        margin: '2px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#374151', // Gray-700
                                        fontSize: '0.875rem',
                                        padding: '2px 6px',
                                        paddingRight: '4px',
                                        fontWeight: 500
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#6B7280', // Gray-500
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginLeft: '2px',
                                        padding: '2px',
                                        '&:hover': {
                                            backgroundColor: '#D1D5DB', // Gray-300
                                            color: '#1F2937', // Gray-800
                                        },
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: '#9CA3AF'
                                    })
                                }}
                            />
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Check type="checkbox" label="Single Time Event" checked={isSingleTime} onChange={e => setIsSingleTime(e.target.checked)} />
                    </Form.Group>

                    {/* MUI Date Pickers */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Row className="gx-3">
                            <Col sm={isSingleTime ? 12 : 6} className="mb-3">
                                <Form.Label>Start Date & Time</Form.Label>
                                <DateTimePicker
                                    value={startDateTime}
                                    onChange={handleStartChange}
                                    format="DD-MM-YYYY hh:mm A"
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock,
                                    }}
                                />
                            </Col>

                            {!isSingleTime && (
                                <Col sm={6} className="mb-3">
                                    <Form.Label>End Date & Time</Form.Label>
                                    <DateTimePicker
                                        value={endDateTime}
                                        onChange={(newValue) => setEndDateTime(newValue)}
                                        minDateTime={startDateTime}
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

                    <Row className="gx-3">
                        <Col sm={6} as={Form.Group} className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={category} onChange={handleCategoryChange}>
                                {displayCategories.map((cat, idx) => (
                                    <option key={idx} value={cat.name}>{cat.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col sm={6} as={Form.Group} className="mb-3">
                            <Form.Label>Visibility</Form.Label>
                            <Form.Select value={visibility} onChange={e => setVisibility(e.target.value)}>
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row className="gx-3 align-items-end">
                        {/* File Attachment */}
                        <Col sm={6} className="mb-3">
                            <Form.Label className="d-flex justify-content-between mb-2">
                                <span>Attachment</span>
                                {attachmentFile && <small className="text-muted text-truncate ms-2" style={{ maxWidth: '120px' }}>{attachmentFile.name}</small>}
                            </Form.Label>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="event-file-upload"
                                />
                                {!attachmentFile ? (
                                    <label
                                        htmlFor="event-file-upload"
                                        className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 cursor-pointer"
                                        style={{ cursor: 'pointer', height: '38px' }}
                                    >
                                        <Paperclip size={18} /> Attach File
                                    </label>
                                ) : (
                                    <div className="d-flex align-items-center w-100 justify-content-between p-1 px-2 border rounded bg-light" style={{ height: '38px' }}>
                                        <div className="d-flex align-items-center overflow-hidden">
                                            <File size={18} className="text-primary flex-shrink-0" />
                                            <span className="text-truncate ms-2 small">{attachmentFile.name}</span>
                                        </div>
                                        <Button
                                            variant="link"
                                            className="p-0 text-danger ms-1 flex-shrink-0"
                                            onClick={removeAttachment}
                                        >
                                            <X size={18} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Col>

                        {/* Priority */}
                        <Col sm={6} className="mb-3">
                            <label className="form-label ms-1">Priority</label>
                            <div className="d-flex align-items-center justify-content-between mt-1 px-1">
                                <Form.Check type="radio" name="priority" id="urgent" label="Urgent" value="Urgent" checked={priority === "Urgent"} onChange={e => setPriority(e.target.value)} />
                                <Form.Check type="radio" name="priority" id="high" label="High" value="High" checked={priority === "High"} onChange={e => setPriority(e.target.value)} />
                                <Form.Check type="radio" name="priority" id="med" label="Medium" value="Medium" checked={priority === "Medium"} onChange={e => setPriority(e.target.value)} />
                                <Form.Check type="radio" name="priority" id="low" label="Low" value="Low" checked={priority === "Low"} onChange={e => setPriority(e.target.value)} />
                            </div>
                        </Col>
                    </Row>

                    <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                        <Button className="btn-light" onClick={hide}>Discard</Button>
                        <Button className="btn-primary" type="submit" onClick={updateEventList} disabled={loading || uploading}>
                            {uploading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Uploading...
                                </>
                            ) : (
                                loading ? 'Adding...' : 'Add Event'
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default CreateNewEvent;
