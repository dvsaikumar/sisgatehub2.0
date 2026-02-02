import React, { useState } from 'react';
import { Modal, Row, Col, Card } from 'react-bootstrap';
// @ts-ignore
import {
    BookOpen,
    FileText,
    List,
    CheckSquare,
    Mail,
    MoreHorizontal
} from 'react-feather';

const DOCUMENT_TYPES = [
    {
        id: 'guide',
        name: 'Guide',
        icon: BookOpen,
        color: '#6366f1',
        description: 'Comprehensive guide with detailed explanations'
    },
    {
        id: 'template',
        name: 'Template',
        icon: FileText,
        color: '#8b5cf6',
        description: 'Reusable template with placeholders'
    },
    {
        id: 'step-by-step',
        name: 'Step By Step',
        icon: List,
        color: '#06b6d4',
        description: 'Sequential instructions with clear steps'
    },
    {
        id: 'checklist',
        name: 'Check List',
        icon: CheckSquare,
        color: '#10b981',
        description: 'Actionable checklist items'
    },
    {
        id: 'letters',
        name: 'Letters',
        icon: Mail,
        color: '#f59e0b',
        description: 'Formal or informal correspondence'
    },
    {
        id: 'others',
        name: 'Others',
        icon: MoreHorizontal,
        color: '#6b7280',
        description: 'Custom document format'
    }
];

interface DocumentTypeModalProps {
    show: boolean;
    onHide: () => void;
    onSelect: (type: any) => void;
}

const DocumentTypeModal: React.FC<DocumentTypeModalProps> = ({ show, onHide, onSelect }) => {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (type: any) => {
        setSelected(type.id);
        // Small delay for visual feedback before proceeding
        setTimeout(() => {
            onSelect(type);
            setSelected(null);
        }, 200);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-2">
                <Modal.Title className="fw-bold">Choose Document Type</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 py-4">
                <p className="text-muted mb-4">Select the type of document you want to create</p>
                <Row className="g-3">
                    {DOCUMENT_TYPES.map((type) => {
                        const IconComponent = type.icon;
                        const isSelected = selected === type.id;

                        return (
                            <Col md={4} key={type.id}>
                                <Card
                                    className={`border-0 shadow-sm h-100 cursor-pointer transition-all ${isSelected ? 'shadow-lg' : ''}`}
                                    onClick={() => handleSelect(type)}
                                    style={{
                                        transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Card.Body className="p-4 text-center">
                                        <div
                                            className="avatar avatar-lg rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                background: `linear-gradient(135deg, ${type.color}15 0%, ${type.color}25 100%)`,
                                                border: isSelected ? `2px solid ${type.color}` : 'none'
                                            }}
                                        >
                                            <IconComponent size={32} color={type.color} />
                                        </div>
                                        <h6 className="fw-bold mb-2">{type.name}</h6>
                                        <p className="text-muted fs-8 mb-0">{type.description}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default DocumentTypeModal;
