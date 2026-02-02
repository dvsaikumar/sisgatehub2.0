import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Target, Mic, Paperclip, X } from 'react-feather';

interface GoalInputProps {
    value: string;
    onChange: (value: string) => void;
}

const GoalInput: React.FC<GoalInputProps> = ({ value, onChange }) => {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    return (
        <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden d-flex flex-column bg-white">
            {/* Card Header with unified design */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light-subtle">
                <div className="d-flex align-items-center gap-2">
                    <div className="avatar avatar-xs avatar-soft-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <Target size={16} />
                    </div>
                    <div>
                        <h5 className="fw-bold text-dark mb-0 ls-tight">Goal & Context</h5>
                        <div className="text-muted fs-8 fw-medium">What do you want to create?</div>
                    </div>
                </div>
                <div className="d-flex gap-1">
                    <Button variant="ghost" size="sm" className="btn-icon rounded-circle text-muted hover-text-primary" title="Voice Input">
                        <Mic size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" className="btn-icon rounded-circle text-muted hover-text-primary" title="Attach Context">
                        <Paperclip size={18} />
                    </Button>
                </div>
            </div>

            {/* Main Input Area */}
            <div className="flex-grow-1 p-0 position-relative d-flex flex-column">
                <Form.Control
                    as="textarea"
                    placeholder="Describe your document goal in detail. Usually, the best results come from clear instructions about the topic, audience, and key points to cover..."
                    className="border-0 shadow-none h-100 p-4 fs-6 resize-none bg-transparent"
                    style={{ minHeight: '300px', lineHeight: '1.6' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                {value && (
                    <Button
                        variant="link"
                        className="position-absolute top-0 end-0 mt-3 me-3 p-1 text-muted hover-text-danger"
                        onClick={() => onChange('')}
                    >
                        <X size={20} />
                    </Button>
                )}
            </div>

            {/* Footer Status Bar */}
            <div className="px-4 py-3 border-top bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${wordCount > 5 ? 'bg-soft-success text-success' : 'bg-soft-secondary text-secondary'} rounded-pill fs-9 fw-bold px-2`}>
                        {wordCount} Words
                    </span>
                </div>
                <div className="text-muted fs-8 fw-medium d-flex align-items-center gap-2">
                    {wordCount === 0 && <span className="text-primary opacity-75">✨ AI Tip: Be specific!</span>}
                </div>
            </div>
        </Card>
    );
};

export default GoalInput;
