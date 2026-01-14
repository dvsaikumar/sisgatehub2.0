import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Card, Table, Modal, Form, Row, Col, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { Plus, Trash, PencilSimple, MagnifyingGlass, Cpu, Globe, Key, ArrowsClockwise } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import classNames from 'classnames';

const providersData = [
    { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
    { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com' },
    { name: 'GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4' },
    { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
    { name: 'Grok', baseUrl: 'https://api.x.ai/v1' },
    { name: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1' },
    { name: 'Qwen', baseUrl: 'https://dashscope.aliyuncs.com/api/v1' },
    { name: 'Local', baseUrl: 'http://localhost:11434/v1' },
    { name: 'Custom', baseUrl: '' }
];

const AI = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [modelSearchTerm, setModelSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingModels, setFetchingModels] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fetchedModels, setFetchedModels] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        provider: 'OpenAI',
        api_key: '',
        base_url: 'https://api.openai.com/v1',
        models: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_ai_configs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setConfigs(data || []);
        } catch (error) {
            console.error('Error fetching AI configs:', error);
            toast.error('Failed to load AI configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleProviderChange = (providerName) => {
        const provider = providersData.find(p => p.name === providerName);
        setFormData({
            ...formData,
            provider: providerName,
            base_url: provider ? provider.baseUrl : formData.base_url
        });
        setFetchedModels([]);
        setModelSearchTerm('');
    };

    const fetchModelsFromAPI = useCallback(async () => {
        if (!formData.api_key || !formData.base_url) {
            toast.error('API Key and Base URL are required to fetch models');
            return;
        }

        try {
            setFetchingModels(true);
            const toastId = toast.loading(`Fetching ${formData.provider} models...`);

            const response = await fetch(`${formData.base_url}/models`, {
                headers: {
                    'Authorization': `Bearer ${formData.api_key}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch models');

            const data = await response.json();
            let modelsArr = [];

            // Handle different API response structures
            if (data.data && Array.isArray(data.data)) {
                modelsArr = data.data.map(m => m.id);
            } else if (Array.isArray(data)) {
                modelsArr = data.map(m => m.id || m.name);
            }

            setFetchedModels(modelsArr);

            if (modelsArr.length > 0) {
                toast.success(`Successfully fetched ${modelsArr.length} models`, { id: toastId });
            } else {
                toast.error('No models found for this configuration', { id: toastId });
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            toast.error('Could not fetch models. Verify API Key and Base URL.', { id: 'fetch-err' });
        } finally {
            setFetchingModels(false);
        }
    }, [formData.api_key, formData.base_url, formData.provider]);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredConfigs = useMemo(() => configs.filter(config =>
        (config.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        config.provider.toLowerCase().includes(searchTerm.toLowerCase())
    ), [configs, searchTerm]);

    const filteredModels = useMemo(() => fetchedModels.filter(model =>
        model.toLowerCase().includes(modelSearchTerm.toLowerCase())
    ), [fetchedModels, modelSearchTerm]);

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setFetchedModels([]);
        setModelSearchTerm('');
        setFormData({ name: '', provider: 'OpenAI', api_key: '', base_url: 'https://api.openai.com/v1', models: '', status: 'Active' });
    };

    const handleShow = (config = null) => {
        if (config) {
            setEditingId(config.id);
            setFormData({
                name: config.name || '',
                provider: config.provider,
                api_key: config.api_key || '',
                base_url: config.base_url || '',
                models: config.models || '',
                status: config.status || 'Active'
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', provider: 'OpenAI', api_key: '', base_url: 'https://api.openai.com/v1', models: '', status: 'Active' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('app_ai_configs')
                    .update({ ...formData, updated_at: new Date() })
                    .eq('id', editingId);
                if (error) throw error;
                toast.success('Configuration updated');
            } else {
                const { error } = await supabase
                    .from('app_ai_configs')
                    .insert([formData]);
                if (error) throw error;
                toast.success('Configuration saved');
            }
            fetchConfigs();
            handleClose();
        } catch (error) {
            console.error('Error saving AI config:', error);
            toast.error('Failed to save configuration');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this configuration?')) {
            try {
                const { error } = await supabase
                    .from('app_ai_configs')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                toast.success('Configuration deleted');
                fetchConfigs();
            } catch (error) {
                toast.error('Failed to delete configuration');
            }
        }
    };

    const toggleModel = (model) => {
        setFormData({ ...formData, models: model });
    };

    const togglePrimary = async (targetId) => {
        try {
            // First unset all primaries
            await supabase
                .from('app_ai_configs')
                .update({ is_primary: false })
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to target all

            // Set the new primary
            const { error } = await supabase
                .from('app_ai_configs')
                .update({ is_primary: true })
                .eq('id', targetId);

            if (error) throw error;
            toast.success('Primary AI configuration updated');
            fetchConfigs();
        } catch (error) {
            console.error('Error setting primary AI:', error);
            toast.error('Failed to set primary configuration');
        }
    };

    return (
        <>
            <Card className="card-border">
                <Card.Body className="p-0">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h5 className="mb-0 me-3">AI Configurations</h5>
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
                                    <th>Config Name</th>
                                    <th>Provider</th>
                                    <th>Base URL</th>
                                    <th>Model ID</th>
                                    <th>Status</th>
                                    <th>Primary</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center p-5">
                                            <div className="d-flex flex-column align-items-center">
                                                <Spinner animation="border" variant="primary" className="mb-2" />
                                                <span className="text-muted">Fetching AI configurations...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredConfigs.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center p-5 text-muted">No AI configurations found.</td></tr>
                                ) : (
                                    filteredConfigs.map((config) => {
                                        return (
                                            <tr key={config.id}>
                                                <td className="fw-bold">
                                                    <span className="text-dark">{config.name || 'Unnamed Config'}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar avatar-xs avatar-soft-info avatar-rounded me-2">
                                                            <span className="initial-wrap"><Cpu size={18} /></span>
                                                        </div>
                                                        {config.provider}
                                                    </div>
                                                </td>
                                                <td className="text-muted small">{config.base_url || 'Default'}</td>
                                                <td style={{ maxWidth: '250px' }} className="text-truncate fw-medium text-primary">
                                                    {config.models || 'Not set'}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className={classNames("badge badge-indicator badge-indicator-lg", {
                                                            "badge-success": config.status === 'Active',
                                                            "badge-secondary": config.status === 'Inactive' || !config.status
                                                        })} />
                                                        <span className="ms-2 fw-medium">{config.status || 'Active'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Form.Check
                                                        type="switch"
                                                        id={`primary-switch-${config.id}`}
                                                        checked={config.is_primary || false}
                                                        onChange={() => togglePrimary(config.id)}
                                                    />
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
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card >

            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit' : 'Add'} AI Configuration</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Configuration Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. My OpenAI GPT-4o Settings"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Provider</Form.Label>
                                    <Form.Select
                                        value={formData.provider}
                                        onChange={(e) => handleProviderChange(e.target.value)}
                                    >
                                        {providersData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
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
                                    <Form.Label className="fw-bold d-flex align-items-center gap-2">
                                        <Key size={18} /> API Key
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your API key"
                                        value={formData.api_key}
                                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-bold d-flex align-items-center gap-2">
                                        <Globe size={18} /> Base URL
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. https://api.openai.com/v1"
                                        value={formData.base_url}
                                        onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                                    />
                                    <Form.Text className="text-muted">Managed based on provider selection.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <Form.Label className="fw-bold mb-0">Model Selection</Form.Label>
                                        <Button
                                            variant="ghost-primary"
                                            size="sm"
                                            onClick={fetchModelsFromAPI}
                                            disabled={fetchingModels || !formData.api_key}
                                            className="px-2 py-1 h-auto"
                                        >
                                            {fetchingModels ? <Spinner size="sm" animation="border" className="me-2" /> : <ArrowsClockwise size={16} className="me-2" weight="bold" />}
                                            Auto-Fetch Models
                                        </Button>
                                    </div>

                                    {fetchedModels.length > 0 && (
                                        <div className="mb-3 border rounded overflow-hidden shadow-sm">
                                            <div className="bg-light p-2 border-bottom">
                                                <InputGroup size="sm">
                                                    <InputGroup.Text className="bg-white border-end-0"><MagnifyingGlass weight="bold" /></InputGroup.Text>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Search fetched models..."
                                                        className="border-start-0 ps-0 shadow-none"
                                                        value={modelSearchTerm}
                                                        onChange={(e) => setModelSearchTerm(e.target.value)}
                                                    />
                                                </InputGroup>
                                            </div>
                                            <div className="p-3 bg-white" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {filteredModels.length > 0 ? (
                                                        filteredModels.map(model => {
                                                            const isSelected = formData.models === model;
                                                            return (
                                                                <Badge
                                                                    key={model}
                                                                    bg={isSelected ? "primary" : "soft-primary"}
                                                                    className={`cursor-pointer transition-all py-1 px-2 ${isSelected ? 'shadow-sm' : 'text-primary'}`}
                                                                    onClick={() => toggleModel(model)}
                                                                    style={{ fontSize: '0.8rem' }}
                                                                >
                                                                    {model} {isSelected && '✓'}
                                                                </Badge>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-muted small text-center w-100 py-2">No models match your search.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Form.Control
                                        type="text"
                                        placeholder="Select a model ID above or enter manually"
                                        value={formData.models}
                                        onChange={(e) => setFormData({ ...formData, models: e.target.value })}
                                    />
                                    <Form.Text className="text-muted">Click on a fetched model above to select it. Only one model can be active per configuration.</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="me-auto">
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={fetchModelsFromAPI}
                                disabled={fetchingModels || !formData.api_key}
                                className="d-flex align-items-center gap-2"
                            >
                                {fetchingModels ? <Spinner size="sm" animation="border" /> : <ArrowsClockwise size={18} />}
                                Test & Fetch Models
                            </Button>
                        </div>
                        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button className="btn-gradient-primary" type="submit" disabled={fetchingModels}>
                            Save Configuration
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default AI;
