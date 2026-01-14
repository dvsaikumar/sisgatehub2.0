import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, Form, Spinner, Card, Nav, Tab } from 'react-bootstrap';
import { Cpu, MagicWand, PaperPlaneTilt, Copy, ArrowClockwise, Sparkle, ChatCircleText, PencilCircle } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import SimpleBar from 'simplebar-react';

const AIDrawer = ({ show, onHide }) => {
    const [prompt, setPrompt] = useState("");
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState("");
    const [activeConfig, setActiveConfig] = useState(null);
    const [contentType, setContentType] = useState("Guide");
    const [appFields, setAppFields] = useState([]);
    const [selectedField, setSelectedField] = useState("");

    useEffect(() => {
        if (show) {
            fetchPrimaryConfig();
            fetchApplicationFields();
        }
    }, [show]);

    const fetchApplicationFields = async () => {
        try {
            // Fetch templates names
            const { data: templates } = await supabase.from('app_templates').select('id, name').order('name');
            // Fetch library documents names
            const { data: documents } = await supabase.from('app_documents').select('id, name').order('name');

            const combined = [
                ...(templates || []).map(t => ({ id: t.id, name: t.name, type: 'Template' })),
                ...(documents || []).map(d => ({ id: d.id, name: d.name, type: 'Library Doc' }))
            ];
            setAppFields(combined);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    const fetchPrimaryConfig = async () => {
        const { data, error } = await supabase
            .from('app_ai_configs')
            .select('*')
            .eq('is_primary', true)
            .single();

        if (data) setActiveConfig(data);
    };

    const handleGenerate = async () => {
        if (!prompt) {
            toast.error("Please enter a prompt");
            return;
        }

        setGenerating(true);
        try {
            // This is a placeholder for the actual AI call
            // In a real scenario, we would use activeConfig.api_key and base_url
            // For now, we simulate a response
            await new Promise(resolve => setTimeout(resolve, 2000));

            setResult(`### Generated ${contentType}: ${prompt}\n\nThis is a sample AI generated response for your request. It contains structured information based on your prompt.\n\n- Key Point 1\n- Key Point 2\n- Strategic Advice\n\n*Note: This is a simulated response. Connect your API key in settings to get real LLM output.*`);

            toast.success("Content generated successfully!");
        } catch (error) {
            toast.error("Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        toast.success("Copied to clipboard");
    };

    return (
        <Offcanvas
            show={show}
            onHide={onHide}
            placement="end"
            style={{ width: '60%', borderLeft: '1px solid #e0e0e0', boxShadow: '-15px 0 30px rgba(0,0,0,0.05)' }}
        >
            <Offcanvas.Header closeButton className="bg-light border-bottom py-4 px-5">
                <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm avatar-soft-primary avatar-rounded me-3">
                        <span className="initial-wrap"><Cpu size={24} weight="fill" /></span>
                    </div>
                    <div>
                        <Offcanvas.Title className="fw-bold h4 mb-0">SISgate AI Assistant</Offcanvas.Title>
                        <small className="text-muted">
                            {activeConfig ? `Active Model: ${activeConfig.name || activeConfig.provider}` : "No primary AI configured"}
                        </small>
                    </div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0 overflow-hidden">
                <SimpleBar style={{ height: '100%' }}>
                    <div className="p-5">
                        <div className="mb-5">
                            <h6 className="text-uppercase text-muted fs-8 fw-bold mb-3 tracking-wider d-flex align-items-center">
                                <Sparkle size={18} className="me-2 text-primary" weight="fill" /> I want to create...
                            </h6>
                            <div className="d-flex gap-2 mb-4">
                                {["Guide", "Email", "Policy", "Checklist"].map(type => (
                                    <Button
                                        key={type}
                                        variant={contentType === type ? "primary" : "soft-light"}
                                        className="btn-rounded px-4 border"
                                        size="sm"
                                        onClick={() => setContentType(type)}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold text-dark fs-7 d-flex align-items-center">
                                    <MagicWand size={16} className="me-2 text-primary" /> Target Application Field
                                </Form.Label>
                                <Form.Select
                                    className="border-2 shadow-none focus-ring"
                                    value={selectedField}
                                    onChange={(e) => setSelectedField(e.target.value)}
                                >
                                    <option value="">General Creation (No specific field)</option>
                                    <optgroup label="System Templates">
                                        {appFields.filter(f => f.type === 'Template').map(f => (
                                            <option key={f.id} value={f.name}>{f.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Library Documents">
                                        {appFields.filter(f => f.type === 'Library Doc').map(f => (
                                            <option key={f.id} value={f.name}>{f.name}</option>
                                        ))}
                                    </optgroup>
                                </Form.Select>
                                <Form.Text className="text-muted fs-9">
                                    Selecting a field helps the AI understand the context and formatting.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-dark fs-7 d-flex align-items-center">
                                    <PencilCircle size={18} className="me-2 text-primary" />
                                    {selectedField ? `Details for ${selectedField}` : 'Describe what you need'}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder={selectedField ? `e.g. Update the ${selectedField} with latest safety policies...` : `e.g. Create a ${contentType.toLowerCase()} for onboarding new employees...`}
                                    className="border-2 focus-ring shadow-none"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                className="w-100 py-3 fw-bold btn-animated shadow-sm d-flex align-items-center justify-content-center gap-2"
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? (
                                    <><Spinner animation="border" size="sm" /> Generating...</>
                                ) : (
                                    <><PaperPlaneTilt size={20} weight="bold" /> Generate Content</>
                                )}
                            </Button>
                        </div>

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-2 shadow-none bg-light overflow-hidden">
                                    <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                                        <div className="d-flex align-items-center text-dark fw-bold">
                                            <MagicWand size={18} className="me-2 text-primary" weight="bold" /> AI Generated Content
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button variant="flush-dark" size="sm" className="btn-icon btn-rounded flush-soft-hover" onClick={copyToClipboard}>
                                                <Copy size={18} />
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4" style={{ backgroundColor: '#fff' }}>
                                        <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.6' }}>
                                            {result}
                                        </div>
                                    </Card.Body>
                                    <Card.Footer className="bg-white border-top p-3 d-flex gap-2">
                                        <Button variant="primary" className="flex-1 btn-rounded fw-bold btn-sm">Use in Application</Button>
                                        <Button variant="soft-dark" className="btn-icon btn-rounded btn-sm" onClick={() => setResult("")}>
                                            <ArrowClockwise size={18} />
                                        </Button>
                                    </Card.Footer>
                                </Card>
                            </motion.div>
                        )}

                        {!result && !generating && (
                            <div className="text-center py-5 opacity-50">
                                <ChatCircleText size={64} weight="thin" className="mb-3 text-muted" />
                                <p className="text-muted">Enter a prompt above to start creating with AI.</p>
                            </div>
                        )}
                    </div>
                </SimpleBar>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default AIDrawer;
