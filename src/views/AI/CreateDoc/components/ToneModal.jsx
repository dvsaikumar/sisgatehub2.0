import React, { useState } from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { Briefcase, Shield, BookOpen, Eye, Crosshair, Lock, Radio, Check } from 'react-feather';

// Single color theme - using a warm orange/amber
const THEME_COLOR = '#f59e0b';
const THEME_GRADIENT = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

const TONES = [
    {
        id: 'Formal',
        name: 'Formal',
        icon: Briefcase,
        tagline: 'Professional & Polished',
        description: 'A dignified and respectful tone that maintains professional standards throughout. Uses proper grammar, avoids contractions, and employs sophisticated vocabulary suitable for official correspondence and executive communications.',
        bestFor: 'Official letters, executive summaries, board presentations, regulatory submissions, and corporate communications'
    },
    {
        id: 'Authoritative',
        name: 'Authoritative',
        icon: Shield,
        tagline: 'Confident & Commanding',
        description: 'Projects expertise and confidence without being condescending. Establishes credibility through well-researched statements, definitive language, and a commanding presence that inspires trust and compliance.',
        bestFor: 'Policy documents, guidelines, expert opinions, leadership communications, and directive instructions'
    },
    {
        id: 'Academic',
        name: 'Academic',
        icon: BookOpen,
        tagline: 'Scholarly & Research-Oriented',
        description: 'Employs scholarly conventions with precise terminology, citations mindset, and structured argumentation. Maintains intellectual rigor while presenting complex ideas in a logically organized manner.',
        bestFor: 'Research papers, academic reports, literature reviews, thesis drafts, and educational materials'
    },
    {
        id: 'Objective',
        name: 'Objective',
        icon: Eye,
        tagline: 'Neutral & Unbiased',
        description: 'Presents information without personal bias or emotional influence. Focuses on facts, data, and evidence-based statements while avoiding subjective language and maintaining balanced perspectives.',
        bestFor: 'Reports, analyses, fact sheets, news summaries, and documentation requiring impartiality'
    },
    {
        id: 'Precise',
        name: 'Precise',
        icon: Crosshair,
        tagline: 'Exact & Detailed',
        description: 'Prioritizes accuracy and specificity in every word choice. Eliminates ambiguity through careful language selection, exact measurements, defined terms, and meticulous attention to technical details.',
        bestFor: 'Technical specifications, legal clauses, scientific documentation, contracts, and compliance documents'
    },
    {
        id: 'Security First',
        name: 'Security First',
        icon: Lock,
        tagline: 'Cautious & Risk-Aware',
        description: 'Emphasizes safety, compliance, and risk mitigation throughout the content. Uses protective language, highlights safeguards, and prioritizes security considerations in recommendations and instructions.',
        bestFor: 'Security policies, risk assessments, compliance documents, safety protocols, and audit reports'
    },
    {
        id: 'Journalistic',
        name: 'Journalistic',
        icon: Radio,
        tagline: 'Clear & Newsworthy',
        description: 'Follows the inverted pyramid style with the most important information first. Uses clear, concise language that is accessible to general audiences while maintaining factual accuracy and attribution.',
        bestFor: 'Press releases, news articles, company announcements, public statements, and media communications'
    }
];

const ToneCard = ({ tone, isSelected, onClick }) => {
    const Icon = tone.icon;

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
                        {tone.name}
                    </h6>
                    <span
                        style={{
                            fontSize: '0.7rem',
                            color: isSelected ? 'rgba(255,255,255,0.7)' : THEME_COLOR,
                            fontWeight: 600,
                            letterSpacing: '0.3px'
                        }}
                    >
                        {tone.tagline}
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
                {tone.description}
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
                        {tone.bestFor}
                    </span>
                </div>
            </div>
        </div>
    );
};

const ToneModal = ({ show, onHide, currentTone, onSelect }) => {
    const [selectedId, setSelectedId] = useState(currentTone || 'Formal');

    const handleDone = () => {
        onSelect(selectedId);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                <div>
                    <Modal.Title className="fw-bold fs-4">Choose Tone & Style</Modal.Title>
                    <p className="text-muted fs-7 mb-0 mt-1">Select a writing tone that matches your document's purpose and audience</p>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Row className="g-3">
                    {TONES.map(tone => (
                        <Col xs={12} md={6} key={tone.id}>
                            <ToneCard
                                tone={tone}
                                isSelected={selectedId === tone.id}
                                onClick={() => setSelectedId(tone.id)}
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
                            Apply Tone
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ToneModal;
