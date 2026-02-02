import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, InputGroup, Spinner, Badge } from 'react-bootstrap';
import { FilePdf, FloppyDisk, Palette, TextT, Layout, CornersIn, Browser, IdentificationBadge } from '@phosphor-icons/react';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';

const PDFDesign = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configId, setConfigId] = useState(null);

    const [form, setForm] = useState({
        // Page Settings
        page_size: 'a4',
        orientation: 'portrait',
        unit: 'mm',

        // Font Settings
        font_family: 'helvetica',
        font_size: 11,
        font_color: '#333333',
        line_height: 1.5,

        // Border Settings
        border_enabled: false,
        border_width: 0.5,
        border_style: 'solid',
        border_color: '#e0e0e0',
        border_margin: 10,

        // Margins (mm)
        margin_top: 20,
        margin_bottom: 20,
        margin_left: 20,
        margin_right: 20,

        // Header settings
        header_enabled: true,
        header_text: 'Sisgate Hub - Professional Document',
        header_align: 'center',
        header_font_size: 9,

        // Footer settings
        footer_enabled: true,
        footer_text: 'Confidential | Page {page_number} of {total_pages}',
        footer_align: 'center',
        footer_font_size: 9,

        // Watermark (Optional but premium)
        watermark_enabled: false,
        watermark_text: 'SISGATE HUB',
        watermark_opacity: 0.1,
        watermark_size: 72
    });

    useEffect(() => {
        fetchPDFConfig();
    }, []);

    const fetchPDFConfig = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_pdf_configs')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.warn('Supabase PDF Config Fetch Info:', error.message);
            }

            if (data) {
                // Merge fetched data with default form state to ensure new fields (like border_margin) have defaults
                setForm(prevForm => ({
                    ...prevForm,
                    ...data
                }));
                setConfigId(data.id);
            }
        } catch (error) {
            console.error('Error fetching PDF design settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const loadToast = toast.loading('Saving PDF design settings...');

            let result;
            if (configId) {
                result = await supabase
                    .from('app_pdf_configs')
                    .update(form)
                    .eq('id', configId);
            } else {
                result = await supabase
                    .from('app_pdf_configs')
                    .insert([form]);
            }

            if (result.error) {
                if (result.error.code === '42P01' || result.error.code === 'PGRST204' || result.error.code === 'PGRST205') {
                    throw new Error('Database table "app_pdf_configs" not found. please creating it in Supabase.');
                }
                throw result.error;
            }

            toast.success('PDF Design settings updated successfully!', { id: loadToast });
            fetchPDFConfig();
        } catch (error) {
            console.error('Error saving PDF config:', error);
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" variant="primary" />
                <span className="ms-3">Loading PDF Settings...</span>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column bg-white h-100 container-fluid px-0">
            <Form onSubmit={handleSave} className="d-flex flex-column h-100">
                {/* Fixed Header */}
                <div className="sticky-top border-bottom py-3 px-4 d-flex justify-content-between align-items-center bg-white" style={{ zIndex: 100, top: 0 }}>
                    <div>
                        <h4 className="fw-bold mb-1">PDF Design Settings</h4>
                        <p className="text-muted small mb-0">Configure the global look and feel of generated A4 documents.</p>
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        className="btn-animated d-flex align-items-center gap-2 px-4 shadow-sm"
                        disabled={saving}
                    >
                        {saving ? <Spinner size="sm" /> : <FloppyDisk size={20} weight="bold" />}
                        Save Settings
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-grow-1">
                    <Row className="g-0">
                        {/* Settings Column - Scrollable */}
                        <Col lg={7} className="p-4" style={{ paddingBottom: '100px' }}>
                            <Row className="g-4">
                                {/* Page & General Layout */}
                                <Col xl={6} className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="d-flex align-items-center justify-content-center bg-soft-primary rounded-circle me-2" style={{ width: '40px', height: '40px' }}>
                                            <Layout size={22} className="text-primary" weight="bold" />
                                        </div>
                                        <h6 className="fw-bold mb-0">Page & General Layout</h6>
                                    </div>
                                    <Card className="border-0 shadow-sm rounded-4 mb-4 flex-grow-1">
                                        <Card.Body className="p-4">
                                            <Row className="g-3">
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Page Size</Form.Label>
                                                        <Form.Select
                                                            value={form.page_size}
                                                            onChange={(e) => setForm({ ...form, page_size: e.target.value })}
                                                            className="rounded-3"
                                                        >
                                                            <option value="a4">A4 (210 x 297 mm)</option>
                                                            <option value="letter">Letter (8.5 x 11 in)</option>
                                                            <option value="legal">Legal (8.5 x 14 in)</option>
                                                            <option value="a3">A3 (297 x 420 mm)</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Orientation</Form.Label>
                                                        <Form.Select
                                                            value={form.orientation}
                                                            onChange={(e) => setForm({ ...form, orientation: e.target.value })}
                                                            className="rounded-3"
                                                        >
                                                            <option value="portrait">Portrait</option>
                                                            <option value="landscape">Landscape</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Units</Form.Label>
                                                        <Form.Select
                                                            value={form.unit}
                                                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                                            className="rounded-3"
                                                        >
                                                            <option value="mm">Millimeters (mm)</option>
                                                            <option value="cm">Centimeters (cm)</option>
                                                            <option value="in">Inches (in)</option>
                                                            <option value="px">Pixels (px)</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Margins */}
                                <Col xl={6} className="d-flex flex-column">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="d-flex align-items-center justify-content-center bg-soft-success rounded-circle me-2" style={{ width: '40px', height: '40px' }}>
                                            <CornersIn size={22} className="text-success" weight="bold" />
                                        </div>
                                        <h6 className="fw-bold mb-0">Page Margins ({form.unit})</h6>
                                    </div>
                                    <Card className="border-0 shadow-sm rounded-4 mb-4 flex-grow-1">
                                        <Card.Body className="p-4">
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Top</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={form.margin_top}
                                                            onChange={(e) => setForm({ ...form, margin_top: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Bottom</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={form.margin_bottom}
                                                            onChange={(e) => setForm({ ...form, margin_bottom: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Left</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={form.margin_left}
                                                            onChange={(e) => setForm({ ...form, margin_left: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Right</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={form.margin_right}
                                                            onChange={(e) => setForm({ ...form, margin_right: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Typography Card */}
                                <Col xl={12}>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="d-flex align-items-center justify-content-center bg-soft-info rounded-circle me-2" style={{ width: '40px', height: '40px' }}>
                                            <TextT size={22} className="text-info" weight="bold" />
                                        </div>
                                        <h6 className="fw-bold mb-0">Typography</h6>
                                    </div>
                                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                                        <Card.Body className="p-4">
                                            <Row className="g-3">
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Primary Font</Form.Label>
                                                        <Form.Select
                                                            value={form.font_family}
                                                            onChange={(e) => setForm({ ...form, font_family: e.target.value })}
                                                            className="rounded-3"
                                                        >
                                                            <option value="helvetica">Helvetica (Standard)</option>
                                                            <option value="times">Times New Roman</option>
                                                            <option value="courier">Courier (Monospace)</option>
                                                            <option value="arial">Arial</option>
                                                            <option value="inter">Inter (Web Font)</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Font Size (pt)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={form.font_size}
                                                            onChange={(e) => setForm({ ...form, font_size: parseInt(e.target.value) })}
                                                            className="rounded-3"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Text Color</Form.Label>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div style={{ width: '50px', height: '38px' }}>
                                                                <Form.Control
                                                                    type="color"
                                                                    value={form.font_color || '#000000'}
                                                                    onChange={(e) => setForm({ ...form, font_color: e.target.value })}
                                                                    className="w-100 h-100 p-1"
                                                                    title="Choose text color"
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <Form.Control
                                                                    type="text"
                                                                    value={form.font_color}
                                                                    onChange={(e) => setForm({ ...form, font_color: e.target.value })}
                                                                    className="rounded-3"
                                                                    spellCheck={false}
                                                                    placeholder="#000000"
                                                                />
                                                            </div>
                                                        </div>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="fs-13px fw-bold text-muted text-uppercase tracking-wider">Line Height ({form.line_height})</Form.Label>
                                                        <Form.Range
                                                            min="1.0"
                                                            max="3.0"
                                                            step="0.1"
                                                            value={form.line_height}
                                                            onChange={(e) => setForm({ ...form, line_height: parseFloat(e.target.value) })}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Header & Footer */}
                                <Col md={12}>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="d-flex align-items-center justify-content-center bg-soft-warning rounded-circle me-2" style={{ width: '40px', height: '40px' }}>
                                            <IdentificationBadge size={22} className="text-warning" weight="bold" />
                                        </div>
                                        <h6 className="fw-bold mb-0">Header & Footer</h6>
                                    </div>
                                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                                        <Card.Body className="p-4 pb-5">
                                            <Row className="g-4">
                                                <Col md={6} className="border-end pr-md-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fs-14px fw-bold text-dark mb-0">Header Settings</h6>
                                                        <Form.Check
                                                            type="switch"
                                                            id="header-switch"
                                                            checked={form.header_enabled}
                                                            onChange={(e) => setForm({ ...form, header_enabled: e.target.checked })}
                                                        />
                                                    </div>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-12px text-muted text-uppercase">Header Text</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={form.header_text}
                                                            onChange={(e) => setForm({ ...form, header_text: e.target.value })}
                                                            disabled={!form.header_enabled}
                                                            className="fs-13px"
                                                        />
                                                    </Form.Group>
                                                    <Row className="g-2 mb-3">
                                                        <Col md={6}>
                                                            <Form.Label className="fs-11px text-muted text-uppercase">Alignment</Form.Label>
                                                            <Form.Select
                                                                size="sm"
                                                                value={form.header_align}
                                                                onChange={(e) => setForm({ ...form, header_align: e.target.value })}
                                                                disabled={!form.header_enabled}
                                                            >
                                                                <option value="left">Left</option>
                                                                <option value="center">Center</option>
                                                                <option value="right">Right</option>
                                                            </Form.Select>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Label className="fs-11px text-muted text-uppercase">Size (pt)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                size="sm"
                                                                value={form.header_font_size}
                                                                onChange={(e) => setForm({ ...form, header_font_size: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                                disabled={!form.header_enabled}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col md={6} className="pl-md-4">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fs-14px fw-bold text-dark mb-0">Footer Settings</h6>
                                                        <Form.Check
                                                            type="switch"
                                                            id="footer-switch"
                                                            checked={form.footer_enabled}
                                                            onChange={(e) => setForm({ ...form, footer_enabled: e.target.checked })}
                                                        />
                                                    </div>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-12px text-muted text-uppercase">Footer Text</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={form.footer_text}
                                                            onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                                                            disabled={!form.footer_enabled}
                                                            className="fs-13px"
                                                        />
                                                    </Form.Group>
                                                    <Row className="g-2 mb-3">
                                                        <Col md={6}>
                                                            <Form.Label className="fs-11px text-muted text-uppercase">Alignment</Form.Label>
                                                            <Form.Select
                                                                size="sm"
                                                                value={form.footer_align}
                                                                onChange={(e) => setForm({ ...form, footer_align: e.target.value })}
                                                                disabled={!form.footer_enabled}
                                                            >
                                                                <option value="left">Left</option>
                                                                <option value="center">Center</option>
                                                                <option value="right">Right</option>
                                                            </Form.Select>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Label className="fs-11px text-muted text-uppercase">Size (pt)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                size="sm"
                                                                value={form.footer_font_size}
                                                                onChange={(e) => setForm({ ...form, footer_font_size: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                                disabled={!form.footer_enabled}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Page Border & Decoration */}
                                <Col md={12}>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="d-flex align-items-center justify-content-center bg-soft-danger rounded-circle me-2" style={{ width: '40px', height: '40px' }}>
                                            <Palette size={22} className="text-danger" weight="bold" />
                                        </div>
                                        <h6 className="fw-bold mb-0">Page Border & Decoration</h6>
                                    </div>
                                    <Card className="border-0 shadow-sm rounded-4">
                                        <Card.Body className="p-4 pb-5">
                                            <Row className="g-4">
                                                <Col md={6}>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fs-13px fw-bold text-muted text-uppercase mb-0">Border Options</h6>
                                                        <Form.Check
                                                            type="switch"
                                                            checked={form.border_enabled}
                                                            onChange={(e) => setForm({ ...form, border_enabled: e.target.checked })}
                                                        />
                                                    </div>
                                                    <Row className="g-3 mb-3">
                                                        <Col md={8}>
                                                            <Form.Label className="fs-12px text-muted">Width (pt)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                step="0.5"
                                                                value={form.border_width}
                                                                onChange={(e) => setForm({ ...form, border_width: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                                disabled={!form.border_enabled}
                                                            />
                                                        </Col>
                                                        <Col md={4}>
                                                            <Form.Label className="fs-12px text-muted">Margin (mm)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                value={form.border_margin}
                                                                onChange={(e) => setForm({ ...form, border_margin: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                                                disabled={!form.border_enabled}
                                                            />
                                                        </Col>
                                                        <Col md={4}>
                                                            <Form.Label className="fs-12px text-muted">Color</Form.Label>
                                                            <Form.Control
                                                                type="color"
                                                                value={form.border_color}
                                                                onChange={(e) => setForm({ ...form, border_color: e.target.value })}
                                                                disabled={!form.border_enabled}
                                                                title="Choose border color"
                                                                className="w-100 p-1"
                                                            />
                                                        </Col>
                                                        <Col md={12}>
                                                            <Form.Label className="fs-12px text-muted">Style</Form.Label>
                                                            <Form.Select
                                                                value={form.border_style}
                                                                onChange={(e) => setForm({ ...form, border_style: e.target.value })}
                                                                disabled={!form.border_enabled}
                                                            >
                                                                <option value="solid">Solid Line</option>
                                                                <option value="dashed">Dashed Line</option>
                                                                <option value="dotted">Dotted Line</option>
                                                                <option value="double">Double Line</option>
                                                            </Form.Select>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="fs-13px fw-bold text-muted text-uppercase mb-0">Watermark</h6>
                                                        <Form.Check
                                                            type="switch"
                                                            checked={form.watermark_enabled}
                                                            onChange={(e) => setForm({ ...form, watermark_enabled: e.target.checked })}
                                                        />
                                                    </div>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-12px text-muted">Watermark Text</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.watermark_text}
                                                            onChange={(e) => setForm({ ...form, watermark_text: e.target.value })}
                                                            disabled={!form.watermark_enabled}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-12px text-muted">Opacity ({Math.round(form.watermark_opacity * 100)}%)</Form.Label>
                                                        <Form.Range
                                                            min="0.05"
                                                            max="0.5"
                                                            step="0.01"
                                                            value={form.watermark_opacity}
                                                            onChange={(e) => setForm({ ...form, watermark_opacity: parseFloat(e.target.value) })}
                                                            disabled={!form.watermark_enabled}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fs-12px text-muted">Size ({form.watermark_size}px)</Form.Label>
                                                        <Form.Range
                                                            min="20"
                                                            max="200"
                                                            step="2"
                                                            value={form.watermark_size}
                                                            onChange={(e) => setForm({ ...form, watermark_size: parseInt(e.target.value) })}
                                                            disabled={!form.watermark_enabled}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <div style={{ height: '100px' }}></div>
                        </Col>

                        {/* Preview Column - Professional Workspace */}
                        <Col
                            lg={5}
                            key={`preview-${configId}-${JSON.stringify(form)}`}
                            className="position-relative overflow-hidden border-start"
                            style={{
                                backgroundColor: '#f0f2f5',
                                position: 'sticky',
                                top: '80px', // Header offset
                                height: 'calc(100vh - 100px)', // Fill viewport
                                overflowY: 'hidden'
                            }}
                        >
                            {/* Workspace Controls/Info */}
                            <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-center" style={{ zIndex: 20 }}>
                                <span className="badge bg-white text-dark shadow-sm border py-2 px-3 rounded-pill fw-bold small d-flex align-items-center gap-2">
                                    <Browser size={16} className="text-primary" /> Live Preview
                                </span>
                                <div className="d-flex gap-2">
                                    <span className="badge bg-white text-dark shadow-sm border py-2 px-3 rounded-pill small">
                                        100% Zoom
                                    </span>
                                    <span className="badge bg-white text-dark shadow-sm border py-2 px-3 rounded-pill small text-uppercase">
                                        {form.page_size} • {form.orientation}
                                    </span>
                                </div>
                            </div>

                            {/* Main Preview Area */}
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                <div className="position-relative shadow-lg" style={{
                                    maxHeight: '85%',
                                    maxWidth: '100%',
                                    aspectRatio: form.orientation === 'portrait' ? '210/297' : '297/210',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <Card className="border-0 rounded-0 h-100 w-100">
                                        <Card.Body className="p-0 bg-white h-100" style={{ position: 'relative' }}>
                                            {/* Mock PDF Page */}
                                            <div
                                                className="bg-white position-relative h-100 d-flex flex-column"
                                                style={{
                                                    fontFamily: form.font_family,
                                                    padding: `${(form.margin_top || 0) * 3.5}px ${(form.margin_right || 0) * 3.5}px ${(form.margin_bottom || 0) * 3.5}px ${(form.margin_left || 0) * 3.5}px`,
                                                    color: form.font_color,
                                                    // Emulate scale
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            >
                                                {/* Page Border */}
                                                {form.border_enabled && (
                                                    <div
                                                        className="position-absolute pointer-events-none"
                                                        style={{
                                                            border: `${form.border_width}px ${form.border_style} ${form.border_color}`,
                                                            zIndex: 10,
                                                            top: `${(form.border_margin || 0) * 3.5}px`,
                                                            left: `${(form.border_margin || 0) * 3.5}px`,
                                                            right: `${(form.border_margin || 0) * 3.5}px`,
                                                            bottom: `${(form.border_margin || 0) * 3.5}px`,
                                                            width: 'auto',
                                                            height: 'auto'
                                                        }}
                                                    />
                                                )}

                                                {/* Watermark */}
                                                {form.watermark_enabled && (
                                                    <div
                                                        className="position-absolute top-50 start-50 translate-middle text-nowrap pointer-events-none"
                                                        style={{
                                                            fontSize: `${form.watermark_size || 72}px`,
                                                            color: 'currentColor',
                                                            fontWeight: '900',
                                                            opacity: form.watermark_opacity,
                                                            transform: 'translate(-50%, -50%) rotate(-45deg)',
                                                            zIndex: 0,
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {form.watermark_text}
                                                    </div>
                                                )}

                                                {/* Header Portion */}
                                                {form.header_enabled && (
                                                    <div className="border-bottom pb-2 mb-4 w-100" style={{ textAlign: form.header_align, minHeight: '40px', borderColor: 'currentColor', opacity: 0.8 }}>
                                                        <div style={{ fontSize: `${Math.max(9, form.header_font_size)}px`, fontWeight: '700' }}>
                                                            {form.header_text}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content Body */}
                                                <div className="flex-grow-1 position-relative w-100 overflow-hidden" style={{ color: 'inherit' }}>
                                                    <div className="mb-4 d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h5 className="fw-bold mb-1" style={{ fontSize: '18px', color: 'inherit' }}>PROFESSIONAL SERVICE AGREEMENT</h5>
                                                            <div className="small opacity-50" style={{ fontSize: '11px' }}>Ref: #SG-2024-001</div>
                                                        </div>
                                                        <div className="text-end small opacity-50" style={{ fontSize: '11px' }}>
                                                            Date: {new Date().toLocaleDateString()}<br />
                                                            Location: London, UK
                                                        </div>
                                                    </div>

                                                    <div style={{ fontSize: `${Math.max(9, form.font_size)}px`, lineHeight: form.line_height }}>
                                                        <p className="mb-3 text-justify fw-bold" style={{ fontSize: '12px', color: 'inherit' }}>
                                                            1. OVERVIEW AND SCOPE
                                                        </p>
                                                        <p className="mb-3 text-justify" style={{ color: 'inherit' }}>
                                                            This document serves as a comprehensive preview of your current PDF design settings. The typography, margins, and branding elements shown here will be applied to all documents generated by the system.
                                                        </p>
                                                        <p className="mb-3 text-justify" style={{ color: 'inherit' }}>
                                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
                                                        </p>

                                                        <ul className="ps-3 mb-4" style={{ color: 'inherit' }}>
                                                            <li>Integration of corporate brand identity.</li>
                                                            <li>Optimized layout for professional readability.</li>
                                                            <li>High-fidelity PDF generation protocols.</li>
                                                        </ul>

                                                        <div className="mt-5 pt-4 d-flex justify-content-between">
                                                            <div className="border-top pt-2" style={{ width: '120px', borderColor: 'currentColor' }}>
                                                                <div className="fw-bold opacity-75" style={{ fontSize: '10px' }}>AUTHORIZED SIGNATORY</div>
                                                            </div>
                                                            <div className="border-top pt-2" style={{ width: '120px', borderColor: 'currentColor' }}>
                                                                <div className="fw-bold opacity-75" style={{ fontSize: '10px' }}>CLIENT ACKNOWLEDGMENT</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer Portion */}
                                                {form.footer_enabled && (
                                                    <div className="border-top pt-2 mt-4 w-100 d-flex justify-content-between align-items-end" style={{ minHeight: '40px', borderColor: 'currentColor', opacity: 0.8 }}>
                                                        <div style={{ fontSize: `${Math.max(8, form.footer_font_size)}px`, textAlign: form.footer_align, flex: 1 }}>
                                                            {form.footer_text.replace('{page_number}', '1').replace('{total_pages}', '1')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>

                            {/* Dimension Helper */}
                            <div className="position-absolute bottom-0 end-0 p-3 pointer-events-none">
                                <div className="bg-white shadow-sm border rounded py-1 px-3 fs-11px text-muted fw-bold">
                                    Canvas: {form.orientation === 'portrait' ? '210 x 297 mm' : '297 x 210 mm'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Form >
        </div >
    );
};

export default PDFDesign;
