import React, { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import moment from 'moment';
import useAuditLog, { AuditResourceType } from '../../hooks/useAuditLog';

const SetReminder = ({ show, hide, refreshEvents }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [start, setStart] = useState(new Date());
    const [startTime, setStartTime] = useState("09:00");
    const [recurrence, setRecurrence] = useState("One-time"); // Simplified for now
    const [loading, setLoading] = useState(false);

    const handleAddReminder = async () => {
        if (!title) {
            toast.error("Please enter a reminder name");
            return;
        }

        setLoading(true);
        try {
            // Combine date and time
            const sDate = moment(start).format('YYYY-MM-DD');
            const startDateTime = new Date(`${sDate}T${startTime}`);

            // Create a default 1-hour duration for the calendar visual
            const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

            const reminderData = {
                title,
                description,
                start_date: startDateTime.toISOString(),
                end_date: endDateTime.toISOString(),
                category: 'Important', // Default category for quick reminders
                visibility: 'Private',
                priority: 'High',
                background_color: '#ffc107', // Gold/Yellow for reminders
            };

            const { data, error } = await supabase
                .from('reminders')
                .insert([reminderData])
                .select()
                .single();

            if (error) throw error;

            // ✅ Log successful reminder creation
            await useAuditLog.logCreate(
                AuditResourceType.REMINDER,
                data.id,
                title,
                reminderData,
                {
                    start_date: startDateTime.toISOString(),
                    has_notification: true,
                    created_via: 'set_reminder_modal'
                }
            );

            toast.success("Reminder set successfully!");

            // Refresh calendar if function provided
            if (refreshEvents) refreshEvents();

            // Reset and close
            setTitle("");
            setDescription("");
            hide();

        } catch (error) {
            console.error('Error creating reminder:', error);

            // ✅ Log failed reminder creation
            await useAuditLog.logFailedAction(
                'CREATE',
                AuditResourceType.REMINDER,
                error.message,
                {
                    attempted_title: title,
                    attempted_start_date: start.toISOString(),
                    error_code: error.code
                }
            );

            toast.error("Failed to create reminder");
        } finally {
            setLoading(false);
        }
    };



    return (
        <Modal show={show} onHide={hide} centered >
            <Modal.Body>
                <Button bsPrefix="btn-close" onClick={hide} >
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-4">Create a Reminder</h5>
                <Form>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call Mom" />
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3">
                            <div className="form-label-group">
                                <Form.Label>Note/Description</Form.Label>
                            </div>
                            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Date</Form.Label>
                                <DateRangePicker
                                    initialSettings={{
                                        singleDatePicker: true,
                                        showDropdowns: true,
                                        startDate: start,
                                    }}
                                    onApply={(event, picker) => {
                                        setStart(new Date(picker.startDate));
                                    }}
                                >
                                    <Form.Control type="text" name="single-date-pick" />
                                </DateRangePicker>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Start Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* 
                    <Row className="gx-3">
                        <Col sm={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Remind</Form.Label>
                                <Form.Select className="me-20" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                                    <option value="One-time">One-time</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row> 
                    */}
                </Form>
            </Modal.Body>
            <Modal.Footer className="align-items-center">
                <Button variant="secondary" onClick={hide} >Discard</Button>
                <Button variant="primary" onClick={handleAddReminder} disabled={loading}>
                    {loading ? 'Adding...' : 'Add'}
                </Button>
            </Modal.Footer>
        </Modal >
    )
}

export default SetReminder
