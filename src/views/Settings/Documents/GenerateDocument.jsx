import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import AIFormControl from '../../../components/AIFormControl/AIFormControl';
import { FileText, DownloadSimple, MagicWand } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import { generateDocument } from '../../../utils/docGenerator';
import toast from 'react-hot-toast';

const GenerateDocument = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [loading, setLoading] = useState(false);

    // Dynamic form data for the template
    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        company: '',
        address: ''
    });

    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            // Fetch documents that are marked as 'Templates'
            const { data, error } = await supabase
                .from('app_documents')
                .select('*')
                .eq('type', 'Templates')
                .order('name', { ascending: true });

            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, price: '' }]);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!selectedTemplate) {
            toast.error("Please select a template");
            return;
        }

        const templateDoc = templates.find(t => t.id === selectedTemplate);
        if (!templateDoc) return;

        let fileUrl = templateDoc.file_path;

        if (!fileUrl) {
            toast.error("The selected template has no file attached.");
            return;
        }

        try {
            setLoading(true);
            await generateDocument(
                fileUrl,
                {
                    ...formData, // Pass all form data
                    items: items, // Pass the line items array
                    full_name: `${formData.name}`,
                    current_date: formData.date
                },
                `Generated_${templateDoc.name.replace(/\s+/g, '_')}.docx`
            );
            toast.success("Document generated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate document. Ensure the template is a valid .docx file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="card-border">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm avatar-soft-primary avatar-rounded me-3">
                        <MagicWand size={20} weight="fill" />
                    </div>
                    <div>
                        <h5 className="mb-0">Document Automation</h5>
                        <small className="text-muted">Generate documents from your templates instantly.</small>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <Alert variant="light" className="mb-4 border border-dashed text-center">
                    <p className="mb-0 small">
                        <strong>Note:</strong> This tool uses <code>docxtemplater</code>.<br />
                        Basic placeholders: <code>{`{name}`}</code>, <code>{`{date}`}</code>, <code>{`{company}`}</code>, <code>{`{address}`}</code>.<br />
                        For lists/tables use: <code>{`{#items} {description} {quantity} {price} {/items}`}</code>
                    </p>
                </Alert>

                <Form onSubmit={handleGenerate}>
                    <Row className="g-4">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Select Template</Form.Label>
                                <Form.Select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a Legal Template --</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </Form.Select>
                                {templates.length === 0 && (
                                    <Form.Text className="text-danger">
                                        No templates found. Go to 'Documents' tab and add a document with Type 'Templates'.
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <h6 className="text-uppercase text-tracking fw-bold text-muted fs-12px mb-3 mt-2">Fill Details</h6>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Client / Full Name</Form.Label>
                                <AIFormControl
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John Doe"
                                    required
                                    fieldName="Client Name"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Company Name</Form.Label>
                                <AIFormControl
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Acme Corp"
                                    fieldName="Company Name"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <AIFormControl
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="City, Country"
                                    fieldName="Address"
                                />
                            </Form.Group>
                        </Col>

                        {/* Dynamic Line Items Section */}
                        <Col md={12}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="mb-0">Line Items (Optional)</Form.Label>
                                <Button variant="link" size="sm" onClick={addItem}>+ Add Item</Button>
                            </div>
                            {items.map((item, index) => (
                                <Row key={index} className="g-2 mb-2 align-items-end">
                                    <Col md={6}>
                                        <AIFormControl
                                            type="text"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            fieldName="Item Description"
                                        />
                                    </Col>
                                    <Col md={2}>
                                        <Form.Control
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <AIFormControl
                                            type="text"
                                            placeholder="Price"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                            fieldName="Price/Value"
                                        />
                                    </Col>
                                    <Col md={1}>
                                        <Button variant="flush-danger" size="sm" onClick={() => removeItem(index)}>
                                            <i className="bi bi-trash"></i> X
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            {items.length === 0 && <small className="text-muted">No items added.</small>}
                        </Col>

                        <Col md={12} className="mt-4">
                            <Button
                                variant="gradient-primary"
                                type="submit"
                                className="w-100 py-2 d-flex align-items-center justify-content-center"
                                disabled={loading || !selectedTemplate}
                            >
                                {loading ? 'Generating...' : (
                                    <>
                                        <DownloadSimple size={20} className="me-2" weight="bold" />
                                        Generate Document
                                    </>
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default GenerateDocument;
