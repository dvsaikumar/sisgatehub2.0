import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Grid, Sliders, Target, Layout, RotateCcw, Users } from 'react-feather';
import FrameworkModal from './FrameworkModal';
import ToneModal from './ToneModal';
import AmbiguityModal from './AmbiguityModal';

// ClickableCard for all config options (opens modal)
const ClickableCard = ({ icon: Icon, title, value, onClick, color = "primary" }) => (
    <div className="flex-fill cursor-pointer" onClick={onClick}>
        <div className="bg-white border rounded-4 px-3 py-3 h-100 d-flex align-items-center gap-3 transition-all shadow-hover" style={{ minHeight: '70px' }}>
            <div className={`avatar avatar-sm avatar-soft-${color} avatar-rounded flex-shrink-0`}>
                <span className="initial-wrap"><Icon size={20} /></span>
            </div>
            <div className="flex-grow-1 overflow-hidden lh-sm">
                <div className="fs-8 text-uppercase text-muted fw-bold mb-1 tracking-wide">{title}</div>
                <div className="fs-6 fw-bold text-dark text-truncate">{value}</div>
            </div>
        </div>
    </div>
);

const DocConfigHeader = ({ config, onConfigChange, onTemplatesClick }) => {
    const [showFrameworkModal, setShowFrameworkModal] = useState(false);
    const [showToneModal, setShowToneModal] = useState(false);
    const [showAmbiguityModal, setShowAmbiguityModal] = useState(false);
    const [ambiguityConstraints, setAmbiguityConstraints] = useState([]);

    const handleFrameworkSelect = (frameworkId) => {
        onConfigChange('framework', frameworkId);
    };

    const handleToneSelect = (toneId) => {
        onConfigChange('tone', toneId);
    };

    const handleAmbiguitySelect = (constraints) => {
        setAmbiguityConstraints(constraints);
        // Update config with count or first constraint preview
        const displayValue = constraints.length === 0
            ? 'No Rules Set'
            : `${constraints.length} Rule${constraints.length > 1 ? 's' : ''} Active`;
        onConfigChange('ambiguity', displayValue);
    };

    // Get display value for ambiguity
    const getAmbiguityDisplay = () => {
        if (ambiguityConstraints.length === 0) return 'No Rules Set';
        return `${ambiguityConstraints.length} Rule${ambiguityConstraints.length > 1 ? 's' : ''} Active`;
    };

    return (
        <>
            <div className="mb-4">
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold">Configuration</h5>
                        <Button
                            variant="primary"
                            size="lg"
                            className="text-decoration-none fw-bold px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow"
                            onClick={onTemplatesClick}
                        >
                            <Layout size={18} /> Templates
                        </Button>
                    </div>
                </div>

                <div className="d-flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    <ClickableCard
                        icon={Grid}
                        title="Framework"
                        value={config.framework}
                        color="primary"
                        onClick={() => setShowFrameworkModal(true)}
                    />
                    <ClickableCard
                        icon={Sliders}
                        title="Tone & Style"
                        value={config.tone}
                        color="danger"
                        onClick={() => setShowToneModal(true)}
                    />
                    <ClickableCard
                        icon={Target}
                        title="Ambiguity Rules"
                        value={getAmbiguityDisplay()}
                        color="success"
                        onClick={() => setShowAmbiguityModal(true)}
                    />
                </div>
            </div>

            <FrameworkModal
                show={showFrameworkModal}
                onHide={() => setShowFrameworkModal(false)}
                currentFramework={config.framework}
                onSelect={handleFrameworkSelect}
            />

            <ToneModal
                show={showToneModal}
                onHide={() => setShowToneModal(false)}
                currentTone={config.tone}
                onSelect={handleToneSelect}
            />

            <AmbiguityModal
                show={showAmbiguityModal}
                onHide={() => setShowAmbiguityModal(false)}
                currentConstraints={ambiguityConstraints}
                onSelect={handleAmbiguitySelect}
            />
        </>
    );
};

export default DocConfigHeader;
