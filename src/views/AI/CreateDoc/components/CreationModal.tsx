import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
// @ts-ignore
import { FileDoc, CloudArrowUp, DownloadSimple, CheckCircle } from '@phosphor-icons/react';
// @ts-ignore
import ReactConfetti from 'react-confetti';

import { useWindowSize } from '@react-hook/window-size';
// @ts-ignore
import TipTapEditor from '../../../../components/Editor/TipTapEditor';

interface CreationModalProps {
    show: boolean;
    onHide: () => void;
    isGenerating: boolean;
    content: string;
    onSaveCloud: (title: string, content: string) => void;
    onDownload: (title: string, content: string) => void;
    title: string;
}

const CreationModal: React.FC<CreationModalProps> = ({ show, onHide, isGenerating, content, onSaveCloud, onDownload, title }) => {
    const [width, height] = useWindowSize();
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const [docName, setDocName] = useState<string>(title || "Untitled Document");

    useEffect(() => {
        if (!isGenerating && show && content) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [isGenerating, show, content]);

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
            {showConfetti && <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={200} />}

            <Modal.Header closeButton={!isGenerating}>
                <Modal.Title className="d-flex align-items-center gap-2">
                    {isGenerating ? (
                        <>
                            <Spinner animation="border" variant="primary" size="sm" />
                            <span>Generating Document...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={24} className="text-success" weight="fill" />
                            <span>Document Ready!</span>
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {isGenerating ? (
                    <div className="py-5 text-center bg-light">
                        <div className="mb-4">
                            <div className="avatar avatar-xl avatar-soft-primary avatar-rounded pulse-ring mx-auto">
                                <span className="initial-wrap"><FileDoc size={40} /></span>
                            </div>
                        </div>
                        <h4 className="mb-2">Crafting your document</h4>
                        <p className="text-muted">Applying framework, tone, and zero-ambiguity parameters...</p>
                    </div>
                ) : (
                    <div className="p-4">
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Document Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                placeholder="Enter document name"
                            />
                        </Form.Group>

                        <div className="mb-3">
                            <TipTapEditor content={content} onChange={(html: string) => console.log(html)} />
                        </div>
                    </div>
                )}
            </Modal.Body>
            {!isGenerating && (
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Close</Button>
                    <Button variant="outline-primary" onClick={() => onDownload(docName, content)}>
                        <DownloadSimple size={18} className="me-2" />
                        Download .docx
                    </Button>
                    <Button variant="gradient-primary" onClick={() => onSaveCloud(docName, content)}>
                        <CloudArrowUp size={18} className="me-2" />
                        Save to Cloud
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default CreationModal;
