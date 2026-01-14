import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { Target, Mic, Paperclip, X } from 'react-feather';

const GoalInput = ({ value, onChange }) => {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    return (
        <Card className="h-100 border-0 bg-transparent d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <div className="d-flex align-items-center gap-2">
                    <Target size={18} className="text-primary" />
                    <span className="fw-bold text-uppercase fs-7 text-dark ls-1">GOAL & CONTEXT</span>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="link" className="p-0 text-muted hover-text-primary text-decoration-none" title="Voice Input">
                        <Mic size={16} />
                    </Button>
                    <Button variant="link" className="p-0 text-muted hover-text-primary text-decoration-none" title="Attach Context">
                        <Paperclip size={16} />
                    </Button>
                </div>
            </div>

            <div className="flex-grow-1 bg-white rounded-4 border shadow-sm p-3 position-relative d-flex flex-column transition-all focus-within-shadow-md">
                <Form.Control
                    as="textarea"
                    placeholder="Describe what you want to write..."
                    className="border-0 shadow-none h-100 p-0 fs-6 resize-none bg-transparent"
                    style={{ minHeight: '300px' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                {value && (
                    <Button
                        variant="link"
                        className="position-absolute top-0 end-0 mt-2 me-2 p-1 text-muted hover-text-danger"
                        onClick={() => onChange('')}
                    >
                        <X size={16} />
                    </Button>
                )}

                <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center text-muted fs-8 fw-medium">
                    <div>
                        {wordCount} words
                    </div>
                    <div>
                        Type focused, specific instructions
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default GoalInput;
