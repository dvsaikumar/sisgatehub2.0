import React, { useMemo } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Paperclip, HelpCircle, FileText } from 'react-feather';

interface FrameworkField {
    key: string;
    label: string;
    placeholder: string;
}

const FRAMEWORK_DEFINITIONS: Record<string, FrameworkField[]> = {
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

interface FieldInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    isShort?: boolean;
}

const FieldInput: React.FC<FieldInputProps> = ({ label, value, onChange, placeholder, isShort }) => {
    const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark fs-9">{label}</span>
                    <HelpCircle size={14} className="text-muted cursor-pointer opacity-75 hover-opacity-100" />
                </div>
                <div className="d-flex align-items-center gap-2">
                    {/* @ts-ignore */}
                    {isShort && <span className="text-warning fs-9 fw-bold text-uppercase me-2">Too short</span>}
                    <Button variant="link" className="p-0 text-muted hover-text-primary text-decoration-none fs-9 fw-bold d-flex align-items-center gap-1">
                        <Paperclip size={12} /> Attach
                    </Button>
                </div>
            </div>

            <div className="bg-light-subtle rounded-3 border-0 p-1 position-relative focus-within-ring transition-all">
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={placeholder}
                    className="border-0 bg-transparent p-3 shadow-none fs-7 resize-none w-100"
                    style={{ minHeight: '80px', lineHeight: '1.5' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                {/* Footer metadata inside the input box for compact look */}
                <div className="px-3 pb-2 pt-0 d-flex justify-content-end opacity-50">
                    <span className="fs-9 fw-medium">{wordCount} words</span>
                </div>
            </div>
        </div>
    );
};

interface FrameworkPanelProps {
    framework: string;
    data: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onAutoExpand: () => void;
    isExpanding: boolean;
    isMobile: boolean;
}

const FrameworkPanel: React.FC<FrameworkPanelProps> = ({ framework, data, onChange, onAutoExpand, isExpanding, isMobile }) => {

    const fields = useMemo(() => {
        return FRAMEWORK_DEFINITIONS[framework] || FRAMEWORK_DEFINITIONS['CO-STAR'];
    }, [framework]);

    return (
        <Card className={`border-0 shadow-sm rounded-4 d-flex flex-column bg-white ${isMobile ? '' : 'h-100 overflow-hidden'}`}>
            {/* Unified Card Header */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light-subtle flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                    <div className="avatar avatar-xs avatar-soft-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <FileText size={16} />
                    </div>
                    <div>
                        <h5 className="fw-bold text-dark mb-0 ls-tight">{framework} Framework</h5>
                        <div className="text-muted fs-8 fw-medium">Structured inputs for better results</div>
                    </div>
                </div>
                <Button
                    variant="gradient-primary"
                    size="sm"
                    className="btn-animated shadow-sm rounded-pill px-3 fw-bold fs-8"
                    onClick={onAutoExpand}
                    disabled={isExpanding}
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }}
                >
                    {isExpanding ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Expanding...
                        </>
                    ) : (
                        <>
                            <span className="me-1">✨</span> Auto-Fill
                        </>
                    )}
                </Button>
            </div>

            {/* Scrollable Content Area */}
            <div className={`flex-grow-1 p-4 ${isMobile ? '' : 'overflow-y-auto custom-scrollbar'}`}>
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
        </Card >
    );
};

export default FrameworkPanel;
