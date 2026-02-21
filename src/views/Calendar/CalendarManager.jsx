import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Row, InputGroup, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { PencilSimple, Trash, Plus, Star, Eye, EyeSlash, ShareNetwork } from '@phosphor-icons/react';

/**
 * CalendarManager — Modal for managing multiple user calendars.
 * Create, edit, delete calendars. Toggle visibility, set default.
 */
const CalendarManager = ({
    show,
    hide,
    calendars = [],
    loading = false,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisibility,
    onSetDefault,
    onShare,
}) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#009B84');
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!show) {
            setName('');
            setColor('#009B84');
            setEditingId(null);
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            if (editingId) {
                await onUpdate?.(editingId, { name: name.trim(), color });
            } else {
                await onCreate?.(name.trim(), color);
            }
            setName('');
            setColor('#009B84');
            setEditingId(null);
        } catch {
            // handled externally
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (cal) => {
        setEditingId(cal.id);
        setName(cal.name);
        setColor(cal.color);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this calendar? All events in it will be unassigned.')) {
            await onDelete?.(id);
        }
    };

    const handleCancel = () => {
        setName('');
        setColor('#009B84');
        setEditingId(null);
    };

    return (
        <Modal show={show} onHide={hide} centered>
            <Modal.Body>
                <Button bsPrefix="btn-close" onClick={hide}>
                    <span aria-hidden="true">×</span>
                </Button>
                <h6 className="text-uppercase fw-bold mb-3">Manage Calendars</h6>

                {/* Add/Edit Form */}
                <Form onSubmit={handleSubmit}>
                    <Row className="gx-2 mb-3">
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="Calendar Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={submitting}
                            />
                        </Col>
                        <Col xs="auto">
                            <InputGroup className="color-picker">
                                <span className="input-group-text colorpicker-input-addon rounded-3 p-1">
                                    <Form.Control
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        style={{ width: 32, height: 32, padding: 0, border: 'none' }}
                                        disabled={submitting}
                                    />
                                </span>
                            </InputGroup>
                        </Col>
                        <Col xs="auto">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!name.trim() || submitting}
                                className="btn-icon"
                            >
                                {submitting ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <Plus weight="bold" size={18} />
                                )}
                            </Button>
                        </Col>
                    </Row>
                    {editingId && (
                        <div className="mb-3">
                            <small className="text-muted">Editing calendar</small>
                            <Button variant="link" size="sm" onClick={handleCancel}>Cancel</Button>
                        </div>
                    )}
                </Form>

                <div className="separator separator-light my-3" />
                <div className="title-sm text-muted mb-2">Your Calendars</div>

                {loading ? (
                    <div className="text-center py-3">
                        <Spinner size="sm" />
                    </div>
                ) : calendars.length === 0 ? (
                    <p className="text-muted small">No calendars yet. Create your first one above.</p>
                ) : (
                    <ListGroup variant="flush">
                        {calendars.map(cal => (
                            <ListGroup.Item
                                key={cal.id}
                                className="d-flex align-items-center justify-content-between px-0 py-2"
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <span
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            backgroundColor: cal.color,
                                            flexShrink: 0
                                        }}
                                    />
                                    <span className="fw-medium">{cal.name}</span>
                                    {cal.is_default && (
                                        <Badge bg="warning" text="dark" className="ms-1" style={{ fontSize: '0.65rem' }}>
                                            Default
                                        </Badge>
                                    )}
                                </div>
                                <div className="d-flex gap-1">
                                    {/* Toggle visibility */}
                                    <Button
                                        variant="flush-dark"
                                        size="sm"
                                        className="btn-icon btn-rounded flush-soft-hover"
                                        onClick={() => onToggleVisibility?.(cal.id)}
                                        title={cal.is_visible ? 'Hide' : 'Show'}
                                    >
                                        {cal.is_visible ?
                                            <Eye size={16} className="text-success" /> :
                                            <EyeSlash size={16} className="text-muted" />
                                        }
                                    </Button>
                                    {/* Set default */}
                                    {!cal.is_default && (
                                        <Button
                                            variant="flush-dark"
                                            size="sm"
                                            className="btn-icon btn-rounded flush-soft-hover"
                                            onClick={() => onSetDefault?.(cal.id)}
                                            title="Set as default"
                                        >
                                            <Star size={16} />
                                        </Button>
                                    )}
                                    {/* Share */}
                                    <Button
                                        variant="flush-dark"
                                        size="sm"
                                        className="btn-icon btn-rounded flush-soft-hover"
                                        onClick={() => onShare?.(cal)}
                                        title="Share calendar"
                                    >
                                        <ShareNetwork size={16} />
                                    </Button>
                                    {/* Edit */}
                                    <Button
                                        variant="flush-dark"
                                        size="sm"
                                        className="btn-icon btn-rounded flush-soft-hover"
                                        onClick={() => handleEdit(cal)}
                                    >
                                        <PencilSimple size={16} />
                                    </Button>
                                    {/* Delete */}
                                    {!cal.is_default && (
                                        <Button
                                            variant="flush-dark"
                                            size="sm"
                                            className="btn-icon btn-rounded flush-soft-hover text-danger"
                                            onClick={() => handleDelete(cal.id)}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CalendarManager;
