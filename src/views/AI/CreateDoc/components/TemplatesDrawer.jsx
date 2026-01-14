import React, { useState } from 'react';
import { Offcanvas, Row, Col, Button, Badge } from 'react-bootstrap';
import { Shield, Briefcase, DollarSign, Users, TrendingUp, PenTool, FileText, PieChart, Check } from 'react-feather';

// Mock Data with Gradients and Multi-Tones
const TEMPLATES = [
    {
        id: 'legal',
        title: 'Legal',
        framework: 'CO-STAR',
        tone: ['Formal', 'Precise'],
        icon: Shield,
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        description: 'Contract review, legal research, & memo drafting',
        bestFor: 'Drafting contracts, reviewing policies, and ensuring compliance'
    },
    {
        id: 'finance',
        title: 'Finance',
        framework: 'SCOPED',
        tone: ['Objective', 'Precise'],
        icon: DollarSign,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        description: 'Market analysis, investment reports, & financial modeling',
        bestFor: 'Financial modeling, risk assessment, and market reports'
    },
    {
        id: 'hr',
        title: 'HR & Recruiting',
        framework: 'CO-STAR',
        tone: ['Formal'],
        icon: Users,
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
        description: 'Job descriptions, interview scripts, & culture docs',
        bestFor: 'Job descriptions, interview scripts, and internal comms'
    },
    {
        id: 'consulting',
        title: 'Management Consulting',
        framework: 'SCOPED',
        tone: ['Authoritative', 'Journalistic'],
        icon: Briefcase,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        description: 'Strategy, frameworks, & change management',
        bestFor: 'Strategy decks, case studies, and business analysis'
    },
    {
        id: 'contract_law',
        title: 'Contract Law',
        framework: 'TAG',
        tone: ['Precise', 'Security First'],
        icon: PenTool,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        description: 'Drafting, reviewing, and negotiating contracts',
        bestFor: 'Contracts, agreements, and legal binding docs'
    },
    {
        id: 'ip',
        title: 'Intellectual Property',
        framework: 'CREATE',
        tone: ['Security First', 'Precise'],
        icon: FileText,
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        description: 'Patents, trademarks, and copyright',
        bestFor: 'Trademark filings, patent claims, and IP strategy'
    },
    {
        id: 'ib',
        title: 'Investment Banking',
        framework: 'SCOPED',
        tone: ['Authoritative', 'Objective'],
        icon: TrendingUp,
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        description: 'M&A models, pitch books, & valuation',
        bestFor: 'Pitch books, valuation models, and M&A docs'
    },
    {
        id: 'personal_finance',
        title: 'Personal Finance',
        framework: 'CARE',
        tone: ['Objective'],
        icon: PieChart,
        color: '#14b8a6',
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
        description: 'Budgeting, investing, & retirement planning',
        bestFor: 'Financial planning, budgeting advice, and education'
    }
];

const TemplateCard = ({ template, isSelected, onClick }) => {
    const Icon = template.icon;
    const toneString = Array.isArray(template.tone) ? template.tone.join(', ') : template.tone;

    return (
        <div
            className={`position-relative rounded-4 p-3 cursor-pointer transition-all h-100`}
            onClick={onClick}
            style={{
                background: isSelected ? template.gradient : '#fff',
                border: isSelected ? 'none' : '1px solid var(--bs-border-color)',
                boxShadow: isSelected ? '0 10px 40px -10px ' + template.color + '80' : '0 2px 8px rgba(0,0,0,0.04)',
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
            <div className="d-flex align-items-center gap-3 mb-3">
                <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : template.gradient,
                        boxShadow: isSelected ? 'none' : '0 4px 12px -2px ' + template.color + '40'
                    }}
                >
                    <Icon size={22} color="#fff" />
                </div>
                <div>
                    <h6
                        className="fw-bold mb-1"
                        style={{ color: isSelected ? '#fff' : '#1f2937', fontSize: '1rem' }}
                    >
                        {template.title}
                    </h6>
                    <div className="d-flex gap-1">
                        <Badge
                            bg="light"
                            text="dark"
                            className="border fw-bold"
                            style={{
                                fontSize: '0.65rem',
                                background: isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                                color: isSelected ? '#fff' : '#4b5563',
                                borderWidth: isSelected ? '0' : '1px',
                                border: 'none'
                            }}
                        >
                            {template.framework}
                        </Badge>
                        <Badge
                            bg="light"
                            text="dark"
                            className="border fw-bold opacity-75"
                            style={{
                                fontSize: '0.65rem',
                                background: isSelected ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                                color: isSelected ? '#fff' : '#6b7280',
                                border: 'none'
                            }}
                        >
                            {toneString}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p
                className="mb-3 lh-sm"
                style={{
                    color: isSelected ? 'rgba(255,255,255,0.9)' : '#4b5563',
                    fontSize: '0.8rem',
                    minHeight: '40px'
                }}
            >
                {template.description}
            </p>

            {/* Best For */}
            <div
                className="pt-2"
                style={{
                    borderTop: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--bs-border-color)'
                }}
            >
                <div className="d-flex align-items-start gap-2">
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
                        {template.bestFor}
                    </span>
                </div>
            </div>
        </div>
    );
};

const TemplatesDrawer = ({ show, onHide, onSelect }) => {
    const [selectedId, setSelectedId] = useState(null);

    const handleDone = () => {
        if (selectedId) {
            const template = TEMPLATES.find(t => t.id === selectedId);
            onSelect(template);
        }
        onHide();
    };

    const selectedTemplate = TEMPLATES.find(t => t.id === selectedId);

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '800px', zIndex: 9999 }}>
            <Offcanvas.Header closeButton className="border-bottom px-4 pt-4 pb-3">
                <div>
                    <Offcanvas.Title className="fw-bold fs-4">Select Template</Offcanvas.Title>
                    <p className="text-muted fs-7 mb-0 mt-1">Choose a starting point for your document</p>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body className="bg-light-subtle p-4">
                <Row className="g-3">
                    {TEMPLATES.map(template => (
                        <Col md={6} key={template.id}>
                            <TemplateCard
                                template={template}
                                isSelected={selectedId === template.id}
                                onClick={() => setSelectedId(template.id)}
                            />
                        </Col>
                    ))}
                </Row>
            </Offcanvas.Body>
            <div className="p-4 border-top bg-white d-flex justify-content-between align-items-center">
                <div className="text-muted fs-7">
                    {selectedId ? (
                        <span className="fw-bold text-primary">{selectedTemplate?.title} Selected</span>
                    ) : 'No selection active'}
                </div>
                <Button
                    variant="primary"
                    onClick={handleDone}
                    className="rounded-pill px-5 fw-bold btn-lg"
                    style={{
                        background: selectedTemplate?.gradient || 'var(--bs-primary)',
                        border: 'none'
                    }}
                >
                    Use Template
                </Button>
            </div>
        </Offcanvas>
    );
};

export default TemplatesDrawer;
