import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';

const GroupFormModal = ({ show, onHide, onSuccess, initialGroup = null }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const isEdit = !!initialGroup;

    useEffect(() => {
        if (show && initialGroup) {
            setFormData({ name: initialGroup.name, description: initialGroup.description });
        } else if (show && !initialGroup) {
            setFormData({ name: '', description: '' });
        }
    }, [show, initialGroup]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("Group Name is required");
            return;
        }

        try {
            let result;
            if (isEdit) {
                result = await supabase.from('app_groups')
                    .update({ name: formData.name, description: formData.description })
                    .eq('id', initialGroup.id)
                    .select();
            } else {
                result = await supabase.from('app_groups').insert([
                    { name: formData.name, description: formData.description }
                ]).select();
            }

            const { data, error } = result;

            if (error) {
                if (error.message.includes('Could not find the table')) {
                    toast.error("Table missing! Please run the Setup Guide script.");
                } else {
                    throw error;
                }
                return;
            }

            const savedGroup = data && data[0];
            toast.success(isEdit ? "Group updated successfully!" : "Group created successfully!");

            if (onSuccess) onSuccess(savedGroup);
            onHide();
        } catch (error) {
            console.error('Error saving group:', error.message);
            toast.error(`Error: ${error.message}`);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Edit Group' : 'Add Group'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSave}>
                    <Form.Group className="mb-3">
                        <Form.Label>Group Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Enter group name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            placeholder="Enter description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" className="me-2" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {isEdit ? 'Update Group' : 'Create Group'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default GroupFormModal;
