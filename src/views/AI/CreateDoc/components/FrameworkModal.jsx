import React, { useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { Grid, FileText, Target, Layers, Zap, Heart, Check } from 'react-feather';

// Single color theme
const THEME_COLOR = '#6366f1';
const THEME_GRADIENT = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';

const FRAMEWORKS = [
    {
        id: 'CO-STAR',
        name: 'CO-STAR',
        icon: Grid,
        fullForm: 'Context • Objective • Style • Tone • Audience • Response',
        description: 'A comprehensive 6-element framework designed for structured, professional document generation. It ensures all critical aspects are addressed systematically, making it ideal for formal business and legal contexts.',
        bestFor: 'Legal documents, contracts, formal business communications, compliance materials, and policy drafts'
    },
    {
        id: 'ROSE',
        name: 'ROSE',
        icon: Heart,
        fullForm: 'Role • Objective • Scenario • Expected Outcome',
        description: 'A persona-driven framework that places emphasis on role-playing and scenario-based prompting. Perfect when you need the AI to adopt a specific character or perspective to deliver targeted, engaging content.',
        bestFor: 'Creative writing, storytelling, marketing copy, brand narratives, and persona-driven campaigns'
    },
    {
        id: 'SCOPED',
        name: 'SCOPED',
        icon: Target,
        fullForm: 'Situation • Core Objective • Obstacles • Plan • Evaluation • Decision',
        description: 'A strategic problem-solving framework that guides through complex scenarios requiring analytical thinking. It breaks down challenges into manageable components for thorough analysis and actionable insights.',
        bestFor: 'Business strategy, consulting reports, risk assessments, decision documents, and strategic planning'
    },
    {
        id: 'TAG',
        name: 'TAG',
        icon: FileText,
        fullForm: 'Task • Action • Goal',
        description: 'A minimalist, direct framework optimized for straightforward tasks. Its simplicity ensures clarity and speed, making it perfect for quick outputs where brevity and precision are paramount.',
        bestFor: 'Quick memos, task instructions, action items, simple directives, and brief communications'
    },
    {
        id: 'CREATE',
        name: 'CREATE',
        icon: Zap,
        fullForm: 'Character • Request • Examples • Adjustments • Type • Extras',
        description: 'An advanced, highly customizable framework for refined and sophisticated outputs. It provides granular control over every aspect of the generation process, enabling precise, tailored results.',
        bestFor: 'Technical documentation, detailed reports, research papers, complex analyses, and specialized content'
    },
    {
        id: 'CARE',
        name: 'CARE',
        icon: Layers,
        fullForm: 'Context • Action • Result • Example',
        description: 'A results-oriented framework that emphasizes tangible outcomes and concrete examples. It structures prompts to focus on practical applications and demonstrable results for educational content.',
        bestFor: 'Training materials, how-to guides, educational content, process documentation, and tutorials'
    }
];

const FrameworkCard = ({ framework, isSelected, onClick }) => {
    const Icon = framework.icon;

    return (
        <div
            className={`position-relative rounded-4 p-3 cursor-pointer transition-all h-100`}
            onClick={onClick}
            style={{
                background: isSelected ? THEME_GRADIENT : '#fff',
                border: isSelected ? 'none' : '1px solid var(--bs-border-color)',
                boxShadow: isSelected ? '0 10px 40px -10px ' + THEME_COLOR + '80' : '0 2px 8px rgba(0,0,0,0.04)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease'
            }}
        >
            {/* Selected Indicator */}
            {isSelected && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <Check size={14} color="#fff" strokeWidth={3} />
                </div>
            )}

            {/* Header: Icon + Title */}
            <div className="d-flex align-items-center gap-3 mb-2">
                <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : THEME_GRADIENT,
                        boxShadow: isSelected ? 'none' : '0 4px 12px -2px ' + THEME_COLOR + '40'
                    }}
                >
                    <Icon size={22} color="#fff" />
                </div>
                <div>
                    <h6
                        className="fw-bold mb-0"
                        style={{ color: isSelected ? '#fff' : '#1f2937', fontSize: '1rem' }}
                    >
                        {framework.name}
                    </h6>
                    <span
                        style={{
                            fontSize: '0.65rem',
                            color: isSelected ? 'rgba(255,255,255,0.7)' : THEME_COLOR,
                            fontWeight: 600,
                            letterSpacing: '0.3px'
                        }}
                    >
                        {framework.fullForm}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p
                className="mb-3 lh-base"
                style={{
                    color: isSelected ? 'rgba(255,255,255,0.9)' : '#4b5563',
                    fontSize: '0.8rem',
                    minHeight: '72px'
                }}
            >
                {framework.description}
            </p>

            {/* Best For */}
            <div
                className="pt-2"
                style={{
                    borderTop: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--bs-border-color)'
                }}
            >
                <div
                    className="d-flex align-items-start gap-2"
                >
                    <span
                        className="flex-shrink-0 mt-1"
                        style={{
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            color: isSelected ? 'rgba(255,255,255,0.6)' : '#9ca3af',
                            letterSpacing: '0.5px'
                        }}
                    >
                        ✨ Best for:
                    </span>
                    <span
                        style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: isSelected ? 'rgba(255,255,255,0.95)' : '#374151',
                            lineHeight: 1.4
                        }}
                    >
                        {framework.bestFor}
                    </span>
                </div>
            </div>
        </div>
    );
};

const FrameworkModal = ({ show, onHide, currentFramework, onSelect }) => {
    const [selectedId, setSelectedId] = useState(currentFramework || 'CO-STAR');

    const handleDone = () => {
        onSelect(selectedId);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="framework-modal">
            <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                <div>
                    <Modal.Title className="fw-bold fs-4">Choose Framework</Modal.Title>
                    <p className="text-muted fs-7 mb-0 mt-1">Select a prompting framework that best fits your document needs</p>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="g-3">
                    {FRAMEWORKS.map(framework => (
                        <Col xs={12} md={6} key={framework.id}>
                            <FrameworkCard
                                framework={framework}
                                isSelected={selectedId === framework.id}
                                onClick={() => setSelectedId(framework.id)}
                            />
                        </Col>
                    ))}
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 px-4 pb-4">
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <div
                        className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{ background: THEME_GRADIENT, boxShadow: '0 4px 12px -4px ' + THEME_COLOR + '60' }}
                    >
                        <span className="text-white fs-8 fw-medium opacity-75">Selected:</span>
                        <span className="text-white fs-7 fw-bold">{selectedId}</span>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="light" onClick={onHide} className="rounded-pill px-4 fw-medium">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDone}
                            className="rounded-pill px-4 fw-bold border-0 text-white"
                            style={{ background: THEME_GRADIENT }}
                        >
                            Apply Framework
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default FrameworkModal;
