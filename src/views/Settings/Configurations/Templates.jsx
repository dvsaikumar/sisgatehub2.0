import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Table, Modal, Form, Row, Col, InputGroup, Badge, Nav, Tab as BootstrapTab } from 'react-bootstrap';
import { Plus, Trash, PencilSimple, MagnifyingGlass, FileText, Copy, Code, Eye, Info } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import dayjs from '../../../lib/dayjs';
import AIFormControl from '../../../components/AIFormControl/AIFormControl';

const availableVariables = [
    { name: 'User Name', key: '{{username}}', description: 'Full name of the user' },
    { name: 'User Email', key: '{{user_email}}', description: 'Email address of the user' },
    { name: 'Company Name', key: '{{company_name}}', description: 'Your company name' },
    { name: 'Current Date', key: '{{date}}', description: 'Today\'s date' },
    { name: 'Document ID', key: '{{doc_id}}', description: 'Unique ID of the document' },
];

const sampleData = {
    '{{username}}': 'John Doe',
    '{{user_email}}': 'john.doe@example.com',
    '{{company_name}}': 'Sisgate PRO',
    '{{date}}': dayjs().format('DD-MM-YYYY'),
    '{{doc_id}}': 'DOC-12345'
};

const Templates = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [activeModalTab, setActiveModalTab] = useState('edit');
    const contentRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Email',
        category: '',
        content: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredTemplates = templates.filter(tpl =>
        tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tpl.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setActiveModalTab('edit');
        setFormData({ name: '', type: 'Email', category: '', content: '', status: 'Active' });
    };

    const handleShow = (tpl = null) => {
        if (tpl) {
            setEditingId(tpl.id);
            setFormData({
                name: tpl.name,
                type: tpl.type || 'Email',
                category: tpl.category || '',
                content: tpl.content || '',
                status: tpl.status || 'Active'
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', type: 'Email', category: '', content: '', status: 'Active' });
        }
        setShowModal(true);
    };

    const insertVariable = (variableKey) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const newContent = before + variableKey + after;
        setFormData({ ...formData, content: newContent });

        // Reset focus and cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variableKey.length, start + variableKey.length);
        }, 0);
    };

    const renderPreview = () => {
        let content = formData.content;
        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            content = content.replace(regex, sampleData[key]);
        });
        return content;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('app_templates')
                    .update({ ...formData, updated_at: new Date() })
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Template updated successfully');
            } else {
                const { error } = await supabase
                    .from('app_templates')
                    .insert([formData]);
                if (error) throw error;
                toast.success('Template created successfully');
            }
            fetchTemplates();
            handleClose();
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Failed to save template');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                const { error } = await supabase
                    .from('app_templates')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                toast.success('Template deleted');
                fetchTemplates();
            } catch (error) {
                console.error('Error deleting template:', error);
                toast.error('Failed to delete template');
            }
        }
    };

    const handleDuplicate = async (tpl) => {
        try {
            const { id, created_at, updated_at, ...duplicateData } = tpl;
            duplicateData.name = `${duplicateData.name} (Copy)`;
            const { error } = await supabase
                .from('app_templates')
                .insert([duplicateData]);
            if (error) throw error;
            toast.success('Template duplicated');
            fetchTemplates();
        } catch (error) {
            console.error('Error duplicating template:', error);
            toast.error('Failed to duplicate template');
        }
    };

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 me-3">Templates</h5>
                            <InputGroup size="sm" style={{ width: '250px' }}>
                                <InputGroup.Text><MagnifyingGlass weight="bold" /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </div>
                        <div className="d-flex gap-2">
                            <Button className="btn-gradient-primary btn-animated" size="sm" onClick={() => handleShow()}>
                                <Plus weight="bold" className="me-2" color="#fff" /> Add Template
                            </Button>
                        </div>
                    </div>

                    <div className="table-advance-container">
                        <Table responsive borderless className="nowrap table-advance">
                            <thead>
                                <tr>
                                    <th className="mnw-200p">Template Name</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading templates...</td></tr>
                                ) : filteredTemplates.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">No templates found.</td></tr>
                                ) : (
                                    filteredTemplates.map((tpl) => (
                                        <tr key={tpl.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-3">
                                                        <span className="initial-wrap">
                                                            <FileText size={18} weight="bold" />
                                                        </span>
                                                    </div>
                                                    <span className="text-high-em fw-bold">{tpl.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-soft-secondary py-1 px-2">{tpl.type || 'Email'}</span>
                                            </td>
                                            <td>{tpl.category || 'Uncategorized'}</td>
                                            <td>
                                                <span className={`badge ${tpl.status === 'Active' ? 'badge-soft-success' : 'badge-soft-secondary'}`}>
                                                    {tpl.status}
                                                </span>
                                            </td>
                                            <td>{dayjs(tpl.updated_at || tpl.created_at).format('DD-MM-YYYY')}</td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" title="Duplicate" onClick={() => handleDuplicate(tpl)}>
                                                        <span className="icon"><Copy size={18} weight="bold" /></span>
                                                    </Button>
                                                    <Button variant="flush-light" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleShow(tpl)}>
                                                        <span className="icon"><PencilSimple size={20} weight="bold" /></span>
                                                    </Button>
                                                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => handleDelete(tpl.id)}>
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

            <Modal show={showModal} onHide={handleClose} centered size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit' : 'Add New'} Template</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-0">
                        <Nav variant="tabs" className="nav-tabs-line px-3 pt-3" activeKey={activeModalTab} onSelect={setActiveModalTab}>
                            <Nav.Item>
                                <Nav.Link eventKey="edit" className="d-flex align-items-center">
                                    <Code size={18} className="me-2" /> Editor
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="preview" className="d-flex align-items-center">
                                    <Eye size={18} className="me-2" /> Preview
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <div className="p-4">
                            {activeModalTab === 'edit' ? (
                                <Row className="g-4">
                                    <Col lg={8}>
                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Template Name</Form.Label>
                                                    <AIFormControl
                                                        type="text"
                                                        placeholder="e.g. Monthly Report"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                        fieldName="Template Name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Category</Form.Label>
                                                    <AIFormControl
                                                        type="text"
                                                        placeholder="e.g. Legal, HR"
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                        required
                                                        fieldName="Category"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Format Type</Form.Label>
                                                    <Form.Select
                                                        value={formData.type}
                                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                        required
                                                    >
                                                        <option value="Email">Email (HTML)</option>
                                                        <option value="PDF">PDF Document</option>
                                                        <option value="Docx">Word Document</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Status</Form.Label>
                                                    <Form.Select
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Template Content</Form.Label>
                                                    <AIFormControl
                                                        as="textarea"
                                                        rows={12}
                                                        ref={contentRef}
                                                        placeholder="Write your template here... use {{variable}} for dynamic data"
                                                        value={formData.content}
                                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                        className="font-monospace"
                                                        fieldName="Template Content"
                                                        noInputGroup={true}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Tip: Click on a variable in the right panel to insert it.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={4}>
                                        <Card className="bg-light border-0">
                                            <Card.Body>
                                                <div className="d-flex align-items-center mb-3">
                                                    <Info size={20} className="text-primary me-2" />
                                                    <h6 className="mb-0">Available Variables</h6>
                                                </div>
                                                <p className="text-muted small mb-4">You can use these placeholders in your template content. Click to insert.</p>
                                                <div className="d-flex flex-column gap-2">
                                                    {availableVariables.map((v) => (
                                                        <div
                                                            key={v.key}
                                                            className="p-3 bg-white rounded border border-transparent hover-border-primary cursor-pointer transition-all variable-card"
                                                            onClick={() => insertVariable(v.key)}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <code className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{v.key}</code>
                                                                <Badge bg="soft-primary" className="fw-normal">Insert</Badge>
                                                            </div>
                                                            <div className="small text-muted">{v.name} - {v.description}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            ) : (
                                <div className="preview-container border rounded p-4 bg-white min-vh-50">
                                    <div className="preview-header mb-4 pb-3 border-bottom d-flex justify-content-between">
                                        <div>
                                            <h4 className="mb-1">{formData.name}</h4>
                                            <Badge bg="soft-secondary">{formData.type} Preview</Badge>
                                        </div>
                                        <div className="text-muted small text-end">
                                            Generating with sample data...
                                        </div>
                                    </div>
                                    <div
                                        className="preview-content whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: renderPreview().replace(/\n/g, '<br/>') }}
                                    />
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button className="btn-gradient-primary" type="submit">
                            {editingId ? 'Update' : 'Save'} Template
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default Templates;
