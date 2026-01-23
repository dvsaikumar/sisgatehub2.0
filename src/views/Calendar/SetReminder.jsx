import React, { useState, useRef, useEffect } from 'react';
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import dayjs from '../../lib/dayjs';
import { useCategories } from '../../hooks/useCategories';
import { Paperclip, X, File } from '@phosphor-icons/react';
import CreatableSelect from 'react-select/creatable';
import useAuditLog, { AuditResourceType } from '../../hooks/useAuditLog';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';

const SetReminder = ({ show, hide, refreshEvents }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [emailOptions, setEmailOptions] = useState([]);
    const [emailError, setEmailError] = useState("");

    // Date Time State using Dayjs - Only Start Time Needed
    const [startDateTime, setStartDateTime] = useState(dayjs().set('hour', 9).set('minute', 0));

    const [category, setCategory] = useState("");
    // Visibility and Priority default to Private/High, controls removed from UI
    const [visibility, setVisibility] = useState("Private");
    const [priority, setPriority] = useState("High");
    const [backgroundColor, setBackgroundColor] = useState("#009B84");
    const [loading, setLoading] = useState(false);

    // File Upload State
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch categories
    const { categories } = useCategories();

    // Set default category
    useEffect(() => {
        if (categories.length > 0 && !category) {
            const defaultCat = categories[0];
            setCategory(defaultCat.name);
            setBackgroundColor(defaultCat.color);
        }
    }, [categories, category]);

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

    const handleCategoryChange = (e) => {
        const selectedName = e.target.value;
        setCategory(selectedName);
        const selectedCat = categories.find(c => c.name === selectedName);
        if (selectedCat) {
            setBackgroundColor(selectedCat.color);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
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

    const handleAddReminder = async (e) => {
        e?.preventDefault();

        if (!title.trim()) {
            toast.error("Reminder Name is required.");
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

            // Calculate final dates - Always 1 hour duration logic implicitly
            const finalStart = startDateTime.toISOString();
            const finalEnd = startDateTime.add(1, 'hour').toISOString();

            const emailString = selectedEmails.map(opt => opt.value).join(',');

            const reminderData = {
                title,
                description,
                start_date: finalStart,
                end_date: finalEnd,
                location: "REMINDER",
                category,
                visibility,
                priority,
                background_color: backgroundColor,
                extra_email: emailString || null,
                attachment_path: attachmentPath
            };

            const { data, error } = await supabase
                .from('reminders')
                .insert([reminderData])
                .select()
                .single();

            if (error) throw error;

            await useAuditLog.logCreate(
                AuditResourceType.REMINDER,
                data.id,
                title,
                reminderData,
                {
                    start_date: finalStart,
                    has_notification: true,
                    has_extra_email: !!emailString,
                    has_attachment: !!attachmentPath,
                    created_via: 'set_reminder_modal'
                }
            );

            toast.success("Reminder set successfully!");

            if (refreshEvents) refreshEvents();

            setTitle("");
            setDescription("");
            setSelectedEmails([]);
            setAttachmentFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            setStartDateTime(dayjs().set('hour', 9).set('minute', 0));
            // No endDateTime to reset

            hide();
        } catch (error) {
            console.error('Error creating reminder:', error);

            await useAuditLog.logFailedAction(
                'CREATE',
                AuditResourceType.REMINDER,
                error.message,
                {
                    attempted_title: title,
                    error_code: error.code
                }
            );

            toast.error("Failed to create reminder");
        } finally {
            setLoading(false);
            setUploading(false);
        }
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

    return (
        <Modal show={show} onHide={hide} size="lg" centered >
            <Modal.Body>
                <Button bsPrefix='btn-close' onClick={hide} >
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-4">Create a Reminder</h5>
                <Form>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control className="cal-event-name" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Call Mom" />
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

                    {/* MUI Date Pickers - Only Start Time */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Row className="gx-3">
                            <Col sm={12} className="mb-3">
                                <Form.Label>Date & Time</Form.Label>
                                <DateTimePicker
                                    value={startDateTime}
                                    onChange={setStartDateTime}
                                    format="DD-MM-YYYY hh:mm A"
                                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                                    viewRenderers={{
                                        hours: renderTimeViewClock,
                                        minutes: renderTimeViewClock,
                                        seconds: renderTimeViewClock,
                                    }}
                                />
                            </Col>
                        </Row>
                    </LocalizationProvider>

                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={category} onChange={handleCategoryChange}>
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat.name}>{cat.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        {/* Visibility and Priority Removed from UI */}
                    </Row>

                    <Row className="gx-3 align-items-end">
                        {/* File Attachment - Full Width */}
                        <Col sm={12} className="mb-3">
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
                                    id="reminder-file-upload"
                                />
                                {!attachmentFile ? (
                                    <label
                                        htmlFor="reminder-file-upload"
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
                    </Row>

                    <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                        <Button className="btn-light" onClick={hide}>Discard</Button>
                        <Button className="btn-primary" type="submit" onClick={handleAddReminder} disabled={loading || uploading}>
                            {uploading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Uploading...
                                </>
                            ) : (
                                loading ? 'Adding...' : 'Add Reminder'
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default SetReminder;
