import React, { useMemo } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Paperclip, HelpCircle, FileText } from 'react-feather';

const FRAMEWORK_DEFINITIONS = {
    'CO-STAR': [
        { key: 'context', label: 'Context', placeholder: 'Provide background information...' },
        { key: 'objective', label: 'Objective', placeholder: 'What is the specific task?' },
        { key: 'style', label: 'Style', placeholder: 'Writing style (e.g. Persuasive, Formal)...' },
        { key: 'tone', label: 'Tone', placeholder: 'Emotional tone (e.g. Empathetic, Serious)...' },
        { key: 'audience', label: 'Audience', placeholder: 'Who is this for?' },
        { key: 'response', label: 'Response', placeholder: 'Format requirements...' }
    ],
    'ROSE': [
        { key: 'role', label: 'Role', placeholder: 'Who is the AI acting as?' },
        { key: 'objective', label: 'Objective', placeholder: 'What is the goal?' },
        { key: 'scenario', label: 'Scenario', placeholder: 'Describe the situation...' },
        { key: 'expected_outcome', label: 'Expected Outcome', placeholder: 'What should the result look like?' }
    ],
    'SCOPED': [
        { key: 'situation', label: 'Situation', placeholder: 'Current status or problem...' },
        { key: 'core_objective', label: 'Core Objective', placeholder: 'Primary goal to achieve...' },
        { key: 'obstacles', label: 'Obstacles', placeholder: 'Constraints or challenges...' },
        { key: 'plan', label: 'Plan', placeholder: 'Proposed steps...' },
        { key: 'evaluation', label: 'Evaluation', placeholder: 'Metrics of success...' },
        { key: 'decision', label: 'Decision', placeholder: 'Final clear action...' }
    ],
    'TAG': [
        { key: 'task', label: 'Task', placeholder: 'What needs to be done?' },
        { key: 'action', label: 'Action', placeholder: 'How should it be done?' },
        { key: 'goal', label: 'Goal', placeholder: 'Why are we doing this?' }
    ],
    'CREATE': [
        { key: 'character', label: 'Character', placeholder: 'Persona definition...' },
        { key: 'request', label: 'Request', placeholder: 'Specific command...' },
        { key: 'examples', label: 'Examples', placeholder: 'Provide few-shot examples...' },
        { key: 'adjustments', label: 'Adjustments', placeholder: 'Tuning instructions...' },
        { key: 'type', label: 'Type', placeholder: 'Output format type...' },
        { key: 'extras', label: 'Extras', placeholder: 'Any additional context...' }
    ],
    'CARE': [
        { key: 'context', label: 'Context', placeholder: 'Situation background...' },
        { key: 'action', label: 'Action', placeholder: 'Steps taken...' },
        { key: 'result', label: 'Result', placeholder: 'Outcome achieved...' },
        { key: 'example', label: 'Example', placeholder: 'Concrete illustration...' }
    ]
};

const FieldInput = ({ label, value, onChange, placeholder, isShort }) => {
    const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1 px-1">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark fs-7">{label}</span>
                    <HelpCircle size={14} className="text-muted cursor-pointer" />
                </div>
                <div className="d-flex align-items-center gap-2">
                    {isShort && <span className="text-warning fs-9 fw-bold text-uppercase me-2">Too short</span>}
                    <Button variant="link" className="p-0 text-muted hover-text-primary text-decoration-none fs-9 fw-bold d-flex align-items-center gap-1">
                        <Paperclip size={12} /> Attach
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-4 border shadow-sm p-3 transition-all position-relative focus-within-shadow-md">
                <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={placeholder}
                    className="border-0 bg-transparent p-0 shadow-none fs-6 resize-none"
                    style={{ minHeight: '100px' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center text-muted fs-8 fw-medium">
                    <div>
                        {wordCount} words
                    </div>
                </div>
            </div>
        </div>
    );
};

const FrameworkPanel = ({ framework, data, onChange, onAutoExpand, isExpanding, isMobile }) => {

    const fields = useMemo(() => {
        return FRAMEWORK_DEFINITIONS[framework] || FRAMEWORK_DEFINITIONS['CO-STAR'];
    }, [framework]);

    return (
        <Card className={`border-0 bg-transparent d-flex flex-column ${isMobile ? '' : 'h-100 overflow-hidden'}`}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-1 flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <span className="fw-bold text-uppercase fs-7 text-dark ls-1">{framework} INPUTS</span>
                </div>
                <Button
                    variant="gradient-primary"
                    size="sm"
                    className="btn-animated shadow-sm rounded-pill px-3 fw-bold fs-8"
                    onClick={onAutoExpand}
                    disabled={isExpanding}
                    style={{ background: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)', border: 'none' }}
                >
                    {isExpanding ? 'Expanding...' : 'Auto-Expand'}
                </Button>
            </div>

            <div className={`flex-grow-1 ${isMobile ? '' : 'overflow-y-auto pe-2 custom-scrollbar pb-5'}`}>
                {fields.map(field => (
                    <FieldInput
                        key={field.key}
                        label={field.label}
                        placeholder={field.placeholder}
                        value={data[field.key] || ''}
                        onChange={(val) => onChange(field.key, val)}
                        isShort={data[field.key] && data[field.key].length < 10}
                    />
                ))}
            </div>
        </Card>
    );
};

export default FrameworkPanel;
