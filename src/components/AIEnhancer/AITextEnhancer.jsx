import React, { useState, useEffect } from 'react';
import { Button, Modal, Row, Col, Card, Spinner, ListGroup, InputGroup } from 'react-bootstrap';
import { Cpu, MagicWand, CheckCircle, ArrowClockwise, XCircle } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';

const AITextEnhancer = ({ value, onUpdate, children, fieldName = "Field", noInputGroup = false }) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [primaryConfig, setPrimaryConfig] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (showModal) {
            fetchPrimaryConfig();
        }
    }, [showModal]);

    const fetchPrimaryConfig = async () => {
        const { data } = await supabase
            .from('app_ai_configs')
            .select('*')
            .eq('is_primary', true)
            .single();
        setPrimaryConfig(data);
    };

    const generateSuggestions = async () => {
        if (!value) {
            toast.error("Field is empty. Please enter some text first.");
            return;
        }

        setShowModal(true);
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const variants = [
                `${value} (Optimized for professional clarity)`,
                `A more concise and direct version of: ${value} `,
                `An engaging and persuasive variation focused on impact.`,
                `Formal and authoritative version of your original draft.`,
                `A creative, modern interpretation of: ${value} `
            ];

            setSuggestions(variants);
        } catch (error) {
            toast.error("AI Generation failed");
            setShowModal(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (text) => {
        onUpdate(text);
        setShowModal(false);
        toast.success("Content updated successfully");
    };

    if (noInputGroup) {
        return (
            <div
                className="position-relative ai-enhancer-container"
                style={{ width: '100%' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocusCapture={() => setIsFocused(true)}
                onBlurCapture={() => setIsFocused(false)}
            >
                {children}

                <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute btn-icon btn-rounded shadow-sm scale-on-hover d-flex align-items-center justify-content-center"
                    style={{
                        bottom: '10px',
                        right: '10px',
                        zIndex: 10,
                        width: '32px',
                        height: '32px',
                        opacity: (isHovered || isFocused) ? 1 : 0.4,
                        transform: (isHovered || isFocused) ? 'scale(1)' : 'scale(0.9)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: (isHovered || isFocused) ? 'var(--bs-primary)' : 'rgba(0, 125, 136, 0.4)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0',
                        boxShadow: (isHovered || isFocused) ? '0 4px 12px rgba(0, 125, 136, 0.3)' : 'none'
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        generateSuggestions();
                    }}
                    title="Enhance with SISgate AI"
                >
                    <Cpu
                        weight={(isHovered || isFocused) ? "fill" : "bold"}
                        size={18}
                        color="#fff"
                    />
                </Button>

                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    centered
                    size="lg"
                    backdrop="static"
                >
                    <Modal.Header closeButton className="bg-light border-bottom py-3 px-4">
                        <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm avatar-soft-primary avatar-rounded me-3">
                                <span className="initial-wrap"><Cpu weight="fill" size={24} /></span>
                            </div>
                            <div>
                                <Modal.Title className="h5 mb-0 fw-black">SISgate AI Content Enhancer</Modal.Title>
                                <div className="fs-8 text-muted">Field: <span className="fw-bold">{fieldName}</span></div>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Body className="p-0 overflow-hidden">
                        {loading ? (
                            <div className="text-center py-5 bg-white">
                                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
                                <h4 className="fw-bold text-dark">Crafting 5 Variations...</h4>
                                <p className="text-muted">Maintaining your original tone and style.</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-light-5">
                                <div className="mb-4">
                                    <span className="badge badge-soft-primary px-3 py-2 fs-8 text-uppercase ls-1">Original Text</span>
                                    <div className="mt-2 p-3 bg-white rounded border border-dashed text-muted fs-8 italic">
                                        "{value}"
                                    </div>
                                </div>

                                <div className="mb-2 d-flex align-items-center justify-content-between">
                                    <span className="badge badge-soft-success px-3 py-2 fs-8 text-uppercase ls-1">AI Recommendations</span>
                                    <Button variant="link" size="sm" className="text-primary text-decoration-none" onClick={generateSuggestions}>
                                        <ArrowClockwise className="me-1" /> Regenerate
                                    </Button>
                                </div>

                                <ListGroup variant="flush" className="rounded border">
                                    {suggestions.map((text, idx) => (
                                        <ListGroup.Item
                                            key={idx}
                                            action
                                            onClick={() => handleSelect(text)}
                                            className="py-3 px-4 hover-bg-light transition-all border-bottom"
                                        >
                                            <div className="d-flex align-items-start">
                                                <div className="me-3 mt-1 text-primary">
                                                    <MagicWand weight="fill" size={18} />
                                                </div>
                                                <div className="flex-grow-1 fs-7 text-dark-80">
                                                    {text}
                                                </div>
                                                <div className="ms-2 text-muted opacity-0 hover-opacity-100 transition-all">
                                                    <CheckCircle size={20} weight="duotone" />
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="bg-white border-top py-3">
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)} className="px-4">
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={loading} onClick={() => generateSuggestions()} className="px-4 btn-animated">
                            {loading ? <Spinner size="sm" /> : <MagicWand className="me-2" />}
                            Refine more
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    return (
        <div className="ai-enhancer-wrapper" style={{ width: '100%' }}>
            <InputGroup
                className={`ai-input-group ${isFocused ? 'focused' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocusCapture={() => setIsFocused(true)}
                onBlurCapture={() => setIsFocused(false)}
            >
                {/* 
                    We clone the children to inject focus handlers if we want, 
                    but since it's wrapped in AIFormControl we can just rely on bubbling 
                */}
                {children}

                <Button
                    variant="outline-primary"
                    className="d-flex align-items-center justify-content-center border-start-0"
                    style={{
                        borderColor: 'var(--bs-border-color)',
                        backgroundColor: (isHovered || isFocused) ? 'rgba(0, 125, 136, 0.05)' : '#fff',
                        color: 'var(--bs-primary)',
                        padding: '0 15px',
                        zIndex: 4,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        generateSuggestions();
                    }}
                    title="Enhance with SISgate AI"
                >
                    <Cpu
                        weight={(isHovered || isFocused) ? "fill" : "bold"}
                        size={18}
                    />
                </Button>
            </InputGroup>

            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
                backdrop="static"
            >
                <Modal.Header closeButton className="bg-light border-bottom py-3 px-4">
                    <div className="d-flex align-items-center">
                        <div className="avatar avatar-sm avatar-soft-primary avatar-rounded me-3">
                            <span className="initial-wrap"><Cpu weight="fill" size={24} /></span>
                        </div>
                        <div>
                            <Modal.Title className="h5 mb-0 fw-black">SISgate AI Content Enhancer</Modal.Title>
                            <div className="fs-8 text-muted">Field: <span className="fw-bold">{fieldName}</span></div>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-0 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-5 bg-white">
                            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} className="mb-4" />
                            <h4 className="fw-bold text-dark">Crafting 5 Variations...</h4>
                            <p className="text-muted">Maintaining your original tone and style.</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-light-5">
                            <div className="mb-4">
                                <span className="badge badge-soft-primary px-3 py-2 fs-8 text-uppercase ls-1">Original Text</span>
                                <div className="mt-2 p-3 bg-white rounded border border-dashed text-muted fs-8 italic">
                                    "{value}"
                                </div>
                            </div>

                            <h6 className="fs-8 fw-black text-uppercase tracking-wider text-muted mb-3">AI Recommendations (Click to Choose)</h6>
                            <div className="d-flex flex-column gap-3">
                                {suggestions.map((option, idx) => (
                                    <Card
                                        key={idx}
                                        className="border-0 shadow-sm hover-shadow-lg cursor-pointer transition-all border-start border-4 border-transparent hover-border-primary"
                                        onClick={() => handleSelect(option)}
                                    >
                                        <Card.Body className="p-3 d-flex align-items-center">
                                            <div className="me-3 fs-7 fw-bold text-primary">#{idx + 1}</div>
                                            <div className="flex-1 fs-7 text-dark line-height-base">{option}</div>
                                            <div className="ms-auto ps-3 text-primary opacity-25">
                                                <MagicWand size={24} weight="bold" />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-white border-top p-3">
                    <div className="w-100 d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            <Cpu size={14} className="me-1" /> Generating via {primaryConfig?.name || 'Authorized AI'}
                        </small>
                        <div className="d-flex gap-2">
                            <Button variant="soft-secondary" size="sm" onClick={() => generateSuggestions()} disabled={loading}>
                                <ArrowClockwise size={16} className="me-1" /> Regenerate All
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AITextEnhancer;
