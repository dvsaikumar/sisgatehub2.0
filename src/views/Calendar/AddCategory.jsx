import React, { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Row, InputGroup, Spinner, ListGroup } from 'react-bootstrap';
import { PencilSimple, Trash, Plus } from '@phosphor-icons/react';

const AddCategory = ({ show, hide, categories = [], onCreate, onUpdate, onDelete, loading = false }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#007D88');
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!show) {
            setName('');
            setColor('#007D88');
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
            setColor('#007D88');
            setEditingId(null);
        } catch (error) {
            // Error handled in hook
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setColor(category.color);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            await onDelete?.(id);
        }
    };

    const handleCancel = () => {
        setName('');
        setColor('#007D88');
        setEditingId(null);
    };

    return (
        <Modal show={show} onHide={hide} centered>
            <Modal.Body>
                <Button bsPrefix='btn-close' onClick={hide}>
                    <span aria-hidden="true">×</span>
                </Button>
                <h6 className="text-uppercase fw-bold mb-3">Manage Categories</h6>

                {/* Form for Add/Edit */}
                <Form onSubmit={handleSubmit}>
                    <Row className="gx-2 mb-3">
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="Category Name"
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
                            <small className="text-muted">Editing category</small>
                            <Button variant="link" size="sm" onClick={handleCancel}>Cancel</Button>
                        </div>
                    )}
                </Form>

                {/* Categories List */}
                <div className="separator separator-light my-3" />
                <div className="title-sm text-muted mb-2">Existing Categories</div>

                {loading ? (
                    <div className="text-center py-3">
                        <Spinner size="sm" />
                    </div>
                ) : categories.length === 0 ? (
                    <p className="text-muted small">No categories yet.</p>
                ) : (
                    <ListGroup variant="flush">
                        {categories.map((cat) => (
                            <ListGroup.Item
                                key={cat.id}
                                className="d-flex align-items-center justify-content-between px-0 py-2"
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <span
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            backgroundColor: cat.color,
                                            flexShrink: 0
                                        }}
                                    />
                                    <span>{cat.name}</span>
                                </div>
                                <div className="d-flex gap-1">
                                    <Button
                                        variant="flush-dark"
                                        size="sm"
                                        className="btn-icon btn-rounded flush-soft-hover"
                                        onClick={() => handleEdit(cat)}
                                    >
                                        <PencilSimple size={16} />
                                    </Button>
                                    <Button
                                        variant="flush-dark"
                                        size="sm"
                                        className="btn-icon btn-rounded flush-soft-hover text-danger"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        <Trash size={16} />
                                    </Button>
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
    )
}

export default AddCategory

