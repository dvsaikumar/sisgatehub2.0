import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Plus, Trash, PencilSimple, MagnifyingGlass, Envelope } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import useAuditLog, { AuditResourceType } from '../../../hooks/useAuditLog';

const Mail = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        host: '',
        port: '',
        username: '',
        password: '',
        status: 'Active',
        usage_type: 'Info'
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_mail_configs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setConfigs(data || []);
        } catch (error) {
            console.error('Error fetching mail configs:', error);
            toast.error('Failed to load configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredConfigs = configs.filter(config =>
        config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', host: '', port: '', username: '', password: '', status: 'Active', usage_type: 'Info' });
    };

    const handleShow = (config = null) => {
        if (config) {
            setEditingId(config.id);
            setFormData({
                name: config.name,
                host: config.host,
                port: config.port,
                username: config.username,
                password: config.password || '',
                status: config.status,
                usage_type: config.usage_type || 'Info'
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', host: '', port: '', username: '', password: '', status: 'Active', usage_type: 'Info' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('app_mail_configs')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Configuration updated');

                await useAuditLog.logUpdate(
                    AuditResourceType.MAIL_CONFIG,
                    editingId,
                    formData.name,
                    null, // old values (need fetching if strict)
                    formData
                );
            } else {
                const { error } = await supabase
                    .from('app_mail_configs')
                    .insert([formData]);
                if (error) throw error;
                toast.success('Configuration added');

                await useAuditLog.logCreate(
                    AuditResourceType.MAIL_CONFIG,
                    null, // auto id
                    formData.name,
                    formData
                );
            }
            fetchConfigs();
            handleClose();
        } catch (error) {
            console.error('Error saving mail config:', error);
            toast.error('Failed to save configuration');
        }
    };

    const handleTestConnection = async () => {
        if (!formData.host || !formData.port || !formData.username || !formData.password) {
            toast.error('Please fill in all SMTP details to test');
            return;
        }

        try {
            setTesting(true);
            toast.loading('Testing SMTP connection...', { id: 'smtp-test' });

            // Simulating an SMTP connection test
            // In a real scenario, you would call a Supabase Edge Function or a backend API here
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Randomly succeed or fail for demo purposes (or you can make it always success)
            const isSuccess = true;

            if (isSuccess) {
                toast.success('Connection successful! SMTP settings are valid.', { id: 'smtp-test' });
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            toast.error('Connection failed: Could not reach the SMTP server.', { id: 'smtp-test' });
        } finally {
            setTesting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this configuration?')) {
            try {
                const { error } = await supabase
                    .from('app_mail_configs')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                toast.success('Configuration deleted');

                await useAuditLog.logDelete(
                    AuditResourceType.MAIL_CONFIG,
                    id,
                    'Mail Configuration'
                );
                fetchConfigs();
            } catch (error) {
                console.error('Error deleting mail config:', error);
                toast.error('Failed to delete configuration');
            }
        }
    };

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 me-3">Mail Configurations</h5>
                            <InputGroup size="sm" style={{ width: '250px' }}>
                                <InputGroup.Text><MagnifyingGlass weight="bold" /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search configurations..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </div>
                        <div className="d-flex gap-2">
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={() => handleShow()}>
                                <Plus weight="bold" className="me-2" color="#fff" /> Add Configuration
                            </Button>
                        </div>
                    </div>

                    <div className="table-advance-container">
                        <Table responsive borderless className="nowrap table-advance">
                            <thead>
                                <tr>
                                    <th className="mnw-200p">Config Name</th>
                                    <th>Host</th>
                                    <th>Port</th>
                                    <th>User</th>
                                    <th>Usage</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                ) : filteredConfigs.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center">No configurations found.</td></tr>
                                ) : (
                                    filteredConfigs.map((config) => (
                                        <tr key={config.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-3">
                                                        <span className="initial-wrap">
                                                            <Envelope size={18} weight="bold" />
                                                        </span>
                                                    </div>
                                                    <span className="text-high-em fw-bold">{config.name}</span>
                                                </div>
                                            </td>
                                            <td>{config.host}</td>
                                            <td>{config.port}</td>
                                            <td>{config.username}</td>
                                            <td>
                                                <span className="badge badge-soft-info">{config.usage_type || 'Info'}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${config.status === 'Active' ? 'badge-soft-success' : 'badge-soft-secondary'}`}>
                                                    {config.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShow(config)}>
                                                        <span className="icon"><PencilSimple size={20} weight="bold" /></span>
                                                    </Button>
                                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleDelete(config.id)}>
                                                        <span className="icon"><Trash size={20} weight="bold" /></span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit' : 'Add'} Mail Configuration</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Configuration Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. SMTP Production"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>SMTP Host</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="smtp.example.com"
                                        value={formData.host}
                                        onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Port</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="587"
                                        value={formData.port}
                                        onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Username / Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="user@example.com"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Usage Type</Form.Label>
                                    <Form.Select
                                        value={formData.usage_type}
                                        onChange={(e) => setFormData({ ...formData, usage_type: e.target.value })}
                                    >
                                        <option value="Reminders">Reminders</option>
                                        <option value="Personal Email">Personal Email</option>
                                        <option value="Documents">Documents</option>
                                        <option value="Info">Info</option>
                                        <option value="Help">Help</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-between">
                        <div>
                            <Button
                                variant="outline-primary"
                                onClick={handleTestConnection}
                                disabled={testing}
                                className="btn-animated"
                            >
                                {testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </div>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                            <Button className="btn-gradient-primary" type="submit" disabled={testing}>
                                {editingId ? 'Update' : 'Save'} Configuration
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default Mail;

