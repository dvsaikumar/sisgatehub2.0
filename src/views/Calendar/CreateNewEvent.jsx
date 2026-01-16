import React, { useState } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import dayjs from '../../lib/dayjs';

const CreateNewEvent = ({ show, hide, calendarRef, refreshEvents }) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [start, setStart] = useState(new Date());
    const [startTime, setStartTime] = useState("09:00");
    const [end, setEnd] = useState(new Date());
    const [endTime, setEndTime] = useState("10:00");
    const [isSingleTime, setIsSingleTime] = useState(false);
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("Work");
    const [visibility, setVisibility] = useState("Public");
    const [priority, setPriority] = useState("Medium");
    const [backgroundColor, setBackgroundColor] = useState("#009B84");
    const [loading, setLoading] = useState(false);

    const updateEventList = async (e) => {
        e.preventDefault();

        if (!title) {
            toast.error("Please enter a title");
            return;
        }

        setLoading(true);
        try {
            // Combine date and time
            const sDate = dayjs(start).format('YYYY-MM-DD');
            const startDateTime = new Date(`${sDate}T${startTime}`);

            let endDateTime;
            if (isSingleTime) {
                // Default to 1 hour after start time if single time
                endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
            } else {
                const eDate = dayjs(end).format('YYYY-MM-DD');
                endDateTime = new Date(`${eDate}T${endTime}`);
            }

            const { data, error } = await supabase
                .from('reminders')
                .insert([
                    {
                        title,
                        description,
                        start_date: startDateTime.toISOString(),
                        end_date: endDateTime.toISOString(),
                        location,
                        category,
                        visibility,
                        priority,
                        background_color: backgroundColor,
                    }
                ])
                .select();

            if (error) throw error;

            toast.success("Reminder created successfully!");

            // Refresh calendar events
            if (refreshEvents) refreshEvents();

            // Reset form
            setTitle("");
            setDescription("");
            setLocation("");
            setCategory("Work");

            hide();
        } catch (error) {
            console.error('Error creating reminder:', error);
            toast.error("Failed to create reminder");
        } finally {
            setLoading(false);
        }
    }



    return (
        <Modal show={show} onHide={hide} size="lg" centered >
            <Modal.Body>
                <Button bsPrefix='btn-close' onClick={hide} >
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-4">Create New Reminder</h5>
                <Form>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control className="cal-event-name" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Meeting with Client" />
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3" >
                            <div className="form-label-group">
                                <Form.Label>Note/Description</Form.Label>
                            </div>
                            <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={12}>
                            <Form.Check
                                className="mb-3"
                                type="checkbox"
                                label="Single Time Event"
                                checked={isSingleTime}
                                onChange={(e) => setIsSingleTime(e.target.checked)}
                            />
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
                                    <Form.Control type="text" name="single-date-pick1" />
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
                    {!isSingleTime && (
                        <Row className="gx-3">
                            <Col sm={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <DateRangePicker
                                        initialSettings={{
                                            singleDatePicker: true,
                                            showDropdowns: true,
                                            startDate: end,
                                        }}
                                        onApply={(event, picker) => {
                                            setEnd(new Date(picker.startDate));
                                        }}
                                    >
                                        <Form.Control type="text" name="single-date-pick2" />
                                    </DateRangePicker>
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                    <Row className="gx-3">
                        <Col sm={12}>
                            <Form.Label>Location</Form.Label>
                            <Form.Group className="mb-3" >
                                <Form.Control type="text" value={location} onChange={e => setLocation(e.target.value)} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="Work">Work</option>
                                    <option value="Personal">Personal</option>
                                    <option value="Important">Important</option>
                                    <option value="Travel">Travel</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col sm={7}>
                            <Form.Group className="mb-3">
                                <Form.Label>Visibility</Form.Label>
                                <div className="d-flex">
                                    <Form.Select className="me-3" value={visibility} onChange={e => setVisibility(e.target.value)} >
                                        <option value="Public">Public</option>
                                        <option value="Private">Private</option>
                                    </Form.Select>
                                    <InputGroup className="color-picker w-auto">
                                        <span className="input-group-text colorpicker-input-addon rounded-3">
                                            <Form.Control
                                                type="color"
                                                id="exampleColorInput"
                                                value={backgroundColor}
                                                title="Choose your color"
                                                onChange={e => setBackgroundColor(e.target.value)}
                                            />
                                        </span>
                                    </InputGroup>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="gx-3">
                        <Col sm={12}>
                            <Form.Group className="mt-3">
                                <Form.Label className="me-3">Set priority:</Form.Label>
                                {['Urgent', 'High', 'Low', 'Medium'].map((p) => (
                                    <Form.Check
                                        inline
                                        key={p}
                                        label={p}
                                        name="priority"
                                        type="radio"
                                        id={p.toLowerCase()}
                                        checked={priority === p}
                                        onChange={() => setPriority(p)}
                                    />
                                ))}
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="align-items-center">
                <Button variant="secondary" onClick={hide} >Discard</Button>
                <Button variant="primary" className="fc-addEventButton-button" onClick={updateEventList} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Reminder'}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default CreateNewEvent
