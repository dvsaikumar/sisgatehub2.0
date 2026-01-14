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
        watermark_opacity: 0.1
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
                setForm(data);
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
        <div className="fm-body p-4">
            <Form onSubmit={handleSave}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">PDF Design Settings</h4>
                        <p className="text-muted small">Configure the global look and feel of generated A4 documents.</p>
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

                <Row className="g-4">
                    {/* Page Layout Settings */}
                    <Col xl={8}>
                        <Row className="g-4">
                            <Col md={12}>
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                    <Card.Header className="bg-white border-bottom py-3 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <Layout size={22} className="text-primary" weight="bold" />
                                            <h6 className="mb-0 fw-bold">Page & General Layout</h6>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <Row className="g-3">
                                            <Col md={4}>
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
                                            <Col md={4}>
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
                                            <Col md={4}>
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

                            {/* Typography & Color */}
                            <Col md={6}>
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                    <Card.Header className="bg-white border-bottom py-3 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <TextT size={22} className="text-secondary" weight="bold" />
                                            <h6 className="mb-0 fw-bold">Typography</h6>
                                        </div>
                                    </Card.Header>
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
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="color"
                                                            value={form.font_color}
                                                            onChange={(e) => setForm({ ...form, font_color: e.target.value })}
                                                            className="rounded-pill p-1 border-0"
                                                            style={{ width: '40px', height: '38px' }}
                                                        />
                                                        <Form.Control
                                                            type="text"
                                                            value={form.font_color}
                                                            onChange={(e) => setForm({ ...form, font_color: e.target.value })}
                                                            className="rounded-end-3"
                                                        />
                                                    </InputGroup>
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

                            {/* Margins */}
                            <Col md={6}>
                                <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                    <Card.Header className="bg-white border-bottom py-3 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <CornersIn size={22} className="text-info" weight="bold" />
                                            <h6 className="mb-0 fw-bold">Page Margins ({form.unit})</h6>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Top</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={form.margin_top}
                                                        onChange={(e) => setForm({ ...form, margin_top: parseFloat(e.target.value) })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Bottom</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={form.margin_bottom}
                                                        onChange={(e) => setForm({ ...form, margin_bottom: parseFloat(e.target.value) })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Left</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={form.margin_left}
                                                        onChange={(e) => setForm({ ...form, margin_left: parseFloat(e.target.value) })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fs-12px text-muted text-uppercase tracking-wider">Right</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={form.margin_right}
                                                        onChange={(e) => setForm({ ...form, margin_right: parseFloat(e.target.value) })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Header & Footer */}
                            <Col md={12}>
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                    <Card.Header className="bg-white border-bottom py-3 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <IdentificationBadge size={22} className="text-warning" weight="bold" />
                                            <h6 className="mb-0 fw-bold">Header & Footer</h6>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
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
                                                <Row className="g-2">
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
                                                            onChange={(e) => setForm({ ...form, header_font_size: parseInt(e.target.value) })}
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
                                                <Row className="g-2">
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
                                                            onChange={(e) => setForm({ ...form, footer_font_size: parseInt(e.target.value) })}
                                                            disabled={!form.footer_enabled}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Borders & Decoration */}
                            <Col md={12}>
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                                    <Card.Header className="bg-white border-bottom py-3 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <Palette size={22} className="text-danger" weight="bold" />
                                            <h6 className="mb-0 fw-bold">Page Border & Decoration</h6>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <Row className="g-4">
                                            <Col md={6} className="border-end pr-md-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fs-13px fw-bold text-muted text-uppercase tracking-wider mb-0">Border Options</h6>
                                                    <Form.Check
                                                        type="switch"
                                                        id="border-switch"
                                                        checked={form.border_enabled}
                                                        onChange={(e) => setForm({ ...form, border_enabled: e.target.checked })}
                                                    />
                                                </div>
                                                <Row className="g-3">
                                                    <Col md={6}>
                                                        <Form.Label className="fs-12px text-muted">Width (pt)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.1"
                                                            value={form.border_width}
                                                            onChange={(e) => setForm({ ...form, border_width: parseFloat(e.target.value) })}
                                                            disabled={!form.border_enabled}
                                                        />
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Label className="fs-12px text-muted">Color</Form.Label>
                                                        <Form.Control
                                                            type="color"
                                                            value={form.border_color}
                                                            onChange={(e) => setForm({ ...form, border_color: e.target.value })}
                                                            disabled={!form.border_enabled}
                                                            className="p-1"
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
                                            <Col md={6} className="pl-md-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fs-13px fw-bold text-muted text-uppercase tracking-wider mb-0">Watermark</h6>
                                                    <Form.Check
                                                        type="switch"
                                                        id="watermark-switch"
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
                                                <Form.Label className="fs-12px text-muted">Opacity ({Math.round(form.watermark_opacity * 100)}%)</Form.Label>
                                                <Form.Range
                                                    min="0.05"
                                                    max="0.3"
                                                    step="0.01"
                                                    value={form.watermark_opacity}
                                                    onChange={(e) => setForm({ ...form, watermark_opacity: parseFloat(e.target.value) })}
                                                    disabled={!form.watermark_enabled}
                                                />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Live Preview Column */}
                    <Col xl={4}>
                        <div className="sticky-top" style={{ top: '80px', zIndex: 1 }}>
                            <Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-dark">
                                <Card.Header className="bg-transparent border-bottom border-white-10 py-3 px-4 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2">
                                        <Browser size={22} className="text-white" weight="bold" />
                                        <h6 className="mb-0 fw-bold text-white">Live PDF Preview</h6>
                                    </div>
                                    <Badge bg="primary">A4 Format</Badge>
                                </Card.Header>
                                <Card.Body className="p-4 d-flex justify-content-center bg-gray-900" style={{ minHeight: '500px' }}>
                                    {/* Mock PDF Page */}
                                    <div
                                        className="bg-white shadow-lg position-relative"
                                        style={{
                                            width: form.orientation === 'portrait' ? '100%' : '140%',
                                            aspectRatio: form.orientation === 'portrait' ? '1 / 1.41' : '1.41 / 1',
                                            transform: form.orientation === 'portrait' ? 'none' : 'rotate(0deg)',
                                            padding: `${form.margin_top / 2}px ${form.margin_right / 2}px ${form.margin_bottom / 2}px ${form.margin_left / 2}px`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            fontSize: `${form.font_size / 2.5}px`,
                                            color: form.font_color,
                                            fontFamily: form.font_family,
                                            border: form.border_enabled ? `${form.border_width}px ${form.border_style} ${form.border_color}` : 'none'
                                        }}
                                    >
                                        {/* Header */}
                                        {form.header_enabled && (
                                            <div className="border-bottom pb-2 mb-3" style={{ textAlign: form.header_align }}>
                                                <div style={{ fontSize: `${form.header_font_size / 2.2}px`, fontWeight: 'bold' }}>
                                                    {form.header_text}
                                                </div>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-grow-1 position-relative">
                                            {form.watermark_enabled && (
                                                <div className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center" style={{
                                                    zIndex: 0,
                                                    opacity: form.watermark_opacity,
                                                    transform: 'rotate(-45deg)',
                                                    fontSize: '40px',
                                                    pointerEvents: 'none',
                                                    fontWeight: '900',
                                                    userSelect: 'none'
                                                }}>
                                                    {form.watermark_text}
                                                </div>
                                            )}
                                            <div className="position-relative" style={{ zIndex: 1, lineHeight: form.line_height }}>
                                                <h1 className="fw-bold mb-2" style={{ fontSize: '1.5em' }}>Sample Document Heading</h1>
                                                <p className="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
                                                <p className="mb-2">Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.</p>
                                                <ul className="ps-4 mb-2">
                                                    <li>List item one with professional formatting</li>
                                                    <li>List item two demonstrating margin and line heights</li>
                                                    <li>List item three with consistent typography settings</li>
                                                </ul>
                                                <p>In a real export, this area would contain the full document content from your library, formatted according to these settings.</p>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        {form.footer_enabled && (
                                            <div className="border-top pt-2 mt-3" style={{ textAlign: form.footer_align }}>
                                                <div className="text-muted" style={{ fontSize: `${form.footer_font_size / 2.5}px` }}>
                                                    {form.footer_text.replace('{page_number}', '1').replace('{total_pages}', '1')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                                <Card.Footer className="bg-transparent border-top border-white-10 p-3 text-center">
                                    <small className="text-white-50">Dimensions: {form.orientation === 'portrait' ? '210mm x 297mm' : '297mm x 210mm'}</small>
                                </Card.Footer>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Form >
        </div >
    );
};

export default PDFDesign;
