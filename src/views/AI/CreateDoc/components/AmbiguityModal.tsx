import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
// @ts-ignore
import { Plus, X, Search } from 'react-feather';

const SUGGESTED_CONSTRAINTS = [
    "Do not use robotic transitions like 'In conclusion'",
    "Do not start sentences with 'Additionally'",
    "Do not use markdown headers",
    "No yapping",
    "Do not apologize",
    "Do not mention you are an AI",
    "Start directly with the answer",
    "No preambles or filler text",
    "Do not output code explanations unless asked",
    "No moralizing or lecturing",
    "Avoid corporate jargon",
    "Do not summarize the request",
    "Do not use emojis",
    "Strictly JSON output only",
    "No conversational filler",
    "Do not repeat the question",
    "Avoid ambiguous language",
    "Do not use 'Firstly', 'Secondly'",
    "Limit output to 500 words",
    "Do not hallucinate URLs",
    "No placeholders like [Insert Name]",
    "Prefer active voice",
    "Keep sentences under 20 words",
    "Do not define obvious terms",
    "No ending summary",
    "Use British English spelling",
    "Use American English spelling",
    "Do not reference date cutoff",
    "Format as a Markdown table",
    "Do not use bold text for emphasis",
    "No nesting deeper than 2 levels"
];

const THEME_COLOR = '#10b981';
const THEME_GRADIENT = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

interface AmbiguityModalProps {
    show: boolean;
    onHide: () => void;
    currentConstraints: string[];
    onSelect: (constraints: string[]) => void;
}

const AmbiguityModal: React.FC<AmbiguityModalProps> = ({ show, onHide, currentConstraints = [], onSelect }) => {
    const [activeConstraints, setActiveConstraints] = useState<string[]>(currentConstraints);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [customInput, setCustomInput] = useState<string>('');

    useEffect(() => {
        if (show) {
            setActiveConstraints(currentConstraints);
        }
    }, [show, currentConstraints]);

    const addConstraint = (constraint: string) => {
        if (!activeConstraints.includes(constraint)) {
            setActiveConstraints([...activeConstraints, constraint]);
        }
    };

    const removeConstraint = (constraint: string) => {
        setActiveConstraints(activeConstraints.filter(c => c !== constraint));
    };

    const addCustomConstraint = () => {
        if (customInput.trim() && !activeConstraints.includes(customInput.trim())) {
            setActiveConstraints([...activeConstraints, customInput.trim()]);
            setCustomInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomConstraint();
        }
    };

    const handleDone = () => {
        onSelect(activeConstraints);
        onHide();
    };

    const filteredSuggestions = SUGGESTED_CONSTRAINTS.filter(
        c => c.toLowerCase().includes(searchTerm.toLowerCase()) && !activeConstraints.includes(c)
    );

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                <div>
                    <Modal.Title className="fw-bold fs-4" style={{ color: THEME_COLOR }}>Ambiguity Rules</Modal.Title>
                    <p className="text-muted fs-7 mb-0 mt-1">Define strictly what the AI must NOT do. This reduces hallucinations and enforces precision.</p>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 py-3">
                {/* Search/Add Input */}
                <InputGroup className="mb-4 shadow-sm rounded-3 overflow-hidden" style={{ border: '1px solid var(--bs-border-color)' }}>
                    <InputGroup.Text className="bg-white border-0">
                        <Search size={18} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Search or add restriction..."
                        value={customInput || searchTerm}
                        onChange={(e) => {
                            setCustomInput(e.target.value);
                            setSearchTerm(e.target.value);
                        }}
                        onKeyPress={handleKeyPress}
                        className="border-0 py-3 shadow-none"
                        style={{ fontSize: '0.95rem' }}
                    />
                    <Button
                        onClick={addCustomConstraint}
                        className="border-0 px-4 fw-bold"
                        style={{ background: THEME_GRADIENT }}
                    >
                        Add
                    </Button>
                </InputGroup>

                {/* Active Constraints */}
                <div className="mb-4 p-3 rounded-3" style={{ background: '#f8fafc', minHeight: '80px' }}>
                    {activeConstraints.length === 0 ? (
                        <p className="text-muted text-center mb-0 py-3 fst-italic">No active constraints.</p>
                    ) : (
                        <div className="d-flex flex-wrap gap-2">
                            {activeConstraints.map((constraint, idx) => (
                                <span
                                    key={idx}
                                    className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill text-white fw-medium"
                                    style={{
                                        background: THEME_GRADIENT,
                                        fontSize: '0.8rem',
                                        boxShadow: '0 2px 8px -2px ' + THEME_COLOR + '60'
                                    }}
                                >
                                    {constraint}
                                    <X
                                        size={14}
                                        className="cursor-pointer opacity-75 hover-opacity-100"
                                        onClick={() => removeConstraint(constraint)}
                                        style={{ marginLeft: '4px' }}
                                    />
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Suggested Constraints */}
                <div>
                    <h6 className="text-uppercase text-muted fw-bold fs-8 ls-1 mb-3">Suggested Constraints</h6>
                    <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {filteredSuggestions.map((constraint, idx) => (
                            <span
                                key={idx}
                                className="d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill cursor-pointer transition-all"
                                onClick={() => addConstraint(constraint)}
                                style={{
                                    background: '#fff',
                                    border: '1px solid var(--bs-border-color)',
                                    fontSize: '0.8rem',
                                    color: '#374151'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = THEME_COLOR;
                                    e.currentTarget.style.color = THEME_COLOR;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--bs-border-color)';
                                    e.currentTarget.style.color = '#374151';
                                }}
                            >
                                <Plus size={14} style={{ color: THEME_COLOR }} />
                                {constraint}
                            </span>
                        ))}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 px-4 pb-4">
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <div className="text-muted fs-7">
                        <span className="fw-bold" style={{ color: THEME_COLOR }}>{activeConstraints.length}</span> constraints active
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
                            Apply Rules
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AmbiguityModal;
