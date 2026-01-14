import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import DocConfigHeader from './components/DocConfigHeader';
import GoalInput from './components/GoalInput';
import FrameworkPanel from './components/FrameworkPanel';
import CreationModal from './components/CreationModal';
import { generateAIResponse } from '../../../utils/aiService';
import { supabase } from '../../../configs/supabaseClient';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import PageFooter from '../../../layout/Footer/PageFooter';
import TemplatesDrawer from './components/TemplatesDrawer';
import DocumentTypeModal from './components/DocumentTypeModal';
import SaveToCloudModal from './components/SaveToCloudModal';

const CreateDoc = () => {
    const [goal, setGoal] = useState('');
    const [config, setConfig] = useState({
        framework: 'CO-STAR',
        tone: 'Professional',
        ambiguity: 'Standard Level',
        model: 'GPT-4o',
        persona: 'Master Persuader',
        documentType: null
    });

    // Framework Data State
    const [frameworkData, setFrameworkData] = useState({});

    // UI States
    const [isExpanding, setIsExpanding] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [pendingSaveContent, setPendingSaveContent] = useState({ name: '', content: '' });
    const [showDocTypeModal, setShowDocTypeModal] = useState(false);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        if (key === 'framework') setFrameworkData({});
    };

    const handleTemplateSelect = (template) => {
        if (template) {
            const toneValue = Array.isArray(template.tone) ? template.tone.join(' & ') : template.tone;

            // Set default ambiguity rules based on template category
            let defaultAmbiguity = 'Standard Level';

            switch (template.category) {
                case 'Legal':
                    defaultAmbiguity = 'High Precision';
                    break;
                case 'Technical':
                    defaultAmbiguity = 'High Precision';
                    break;
                case 'Creative':
                    defaultAmbiguity = 'Flexible';
                    break;
                case 'Business':
                    defaultAmbiguity = 'Standard Level';
                    break;
                case 'Marketing':
                    defaultAmbiguity = 'Flexible';
                    break;
                default:
                    defaultAmbiguity = 'Standard Level';
            }

            setConfig(prev => ({
                ...prev,
                framework: template.framework,
                tone: toneValue,
                ambiguity: defaultAmbiguity
            }));
            toast.success(`Template "${template.title}" applied with ${defaultAmbiguity} ambiguity rules!`);
        }
    };

    const handleFrameworkDataChange = (key, value) => {
        setFrameworkData(prev => ({ ...prev, [key]: value }));
    };

    const handleAutoExpand = async () => {
        if (!goal.trim()) {
            toast.error("Please enter a goal first.");
            return;
        }
        setIsExpanding(true);
        const toastId = toast.loading("Expanding goal parameters...");
        try {
            // Define framework field mappings
            const frameworkFields = {
                'CO-STAR': ['context', 'objective', 'style', 'tone', 'audience', 'response'],
                'ROSE': ['role', 'objective', 'scenario', 'expected_outcome'],
                'SCOPED': ['situation', 'core_objective', 'obstacles', 'plan', 'evaluation', 'decision'],
                'TAG': ['task', 'action', 'goal'],
                'CREATE': ['character', 'request', 'examples', 'adjustments', 'type', 'extras'],
                'CARE': ['context', 'action', 'result', 'example']
            };

            const fields = frameworkFields[config.framework] || frameworkFields['CO-STAR'];
            const fieldsList = fields.map(f => `"${f}"`).join(', ');

            const prompt = `You are an expert document planning assistant. Analyze the user's goal and intelligently fill out the ${config.framework} framework parameters.

GOAL: "${goal}"

SELECTED TONE: ${config.tone}
SELECTED FRAMEWORK: ${config.framework}

Your task is to break down this goal into the ${config.framework} framework components and return a JSON object with the following keys: ${fieldsList}.

Guidelines:
- Be specific and actionable for each field
- Ensure the content matches the selected tone (${config.tone})
- Each field should have 2-4 sentences of detailed, relevant content
- Return ONLY valid JSON, no markdown formatting, no explanations

Example format:
{
  ${fields.map(f => `"${f}": "Detailed content here..."`).join(',\n  ')}
}`;

            const response = await generateAIResponse([
                { role: "system", content: "You are a precise JSON generator that outputs only valid JSON objects without markdown formatting." },
                { role: "user", content: prompt }
            ]);

            let parsedData = {};
            try {
                const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(jsonStr);

                // Validate that we got the expected fields
                const hasValidFields = fields.some(field => parsedData[field]);
                if (!hasValidFields) {
                    throw new Error("Response missing expected framework fields");
                }
            } catch (e) {
                console.error("JSON Parse Error", e);
                console.error("Raw response:", response);
                toast.error("AI returned invalid format. Please try again.", { id: toastId });
                setIsExpanding(false);
                return;
            }

            setFrameworkData(parsedData);
            toast.success("Framework fields populated!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to auto-expand. Please try again.", { id: toastId });
        } finally {
            setIsExpanding(false);
        }
    };

    const handleCreateDocument = () => {
        if (Object.keys(frameworkData).length === 0 && !goal) {
            toast.error("Please fill in the goal or parameters.");
            return;
        }
        // Show document type selection modal first
        setShowDocTypeModal(true);
    };

    const handleDocumentTypeSelect = async (selectedType) => {
        setShowDocTypeModal(false);

        // Store selected document type
        setConfig(prev => ({ ...prev, documentType: selectedType }));

        // Now proceed with generation
        setShowModal(true);
        setIsGenerating(true);
        setGeneratedContent('');

        try {
            const prompt = `
                Create a COMPREHENSIVE, DETAILED, and LEGALLY-SOUND ${selectedType.name} document based on the following parameters using the ${config.framework} framework.

                DOCUMENT TYPE: ${selectedType.name}
                Description: ${selectedType.description}

                Framework Parameters:
                ${Object.entries(frameworkData).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n')}

                Goal Context: ${goal}
                Tone: ${config.tone}
                Perspective: ${config.persona}

                CRITICAL INSTRUCTIONS FOR LEGAL-GRADE QUALITY:
                - Generate a DETAILED and THOROUGH document suitable for legal and professional use
                - Use PRECISE and UNAMBIGUOUS language throughout - no room for misinterpretation
                - Provide in-depth explanations for every topic, concept, and clause
                - Include comprehensive examples, scenarios, and use cases with full context
                - Expand on ALL points with detailed descriptions and complete explanations
                - Do NOT be brief or concise - prioritize thoroughness, completeness, and accuracy
                - Cover every aspect comprehensively with full legal and contextual explanations
                - Include background information, rationale, and detailed reasoning for all points
                - Add relevant details, elaborations, and supporting information
                - Ensure each section is well-developed, substantive, and legally sound
                - Define ALL terms clearly and leave NO ambiguities
                - Use clear, precise language that cannot be misunderstood
                - Ensure consistency throughout the document
                - Include all necessary clauses, conditions, and qualifications
                - Make the document complete, comprehensive, and ready for professional use

                FORMATTING INSTRUCTIONS:
                - Format this as a professional ${selectedType.name}
                - Use {{Client}} placeholder for personalization
                - Format professionally with clear structure, headings, and sections
                - No markdown blocks in output
                - Use proper spacing, organization, and numbering for readability
                - Include proper legal formatting where applicable

                TYPE-SPECIFIC REQUIREMENTS:
                ${selectedType.id === 'guide' ? '- Include comprehensive step-by-step explanations with detailed examples, legal considerations, and scenarios for each point' : ''}
                ${selectedType.id === 'template' ? '- Include detailed [PLACEHOLDER] fields with comprehensive instructions, legal notes, and examples for each section' : ''}
                ${selectedType.id === 'step-by-step' ? '- Number each step clearly and provide detailed, precise, actionable instructions with thorough explanations and legal considerations for every step' : ''}
                ${selectedType.id === 'checklist' ? '- Use checkbox format with detailed descriptions, legal requirements, and comprehensive guidance for each item' : ''}
                ${selectedType.id === 'letters' ? '- Include proper greeting, detailed and comprehensive body paragraphs with complete context and legal precision, and appropriate closing' : ''}

                QUALITY STANDARDS:
                - Document must be complete and ready for professional/legal use
                - No vague statements or undefined terms
                - All conditions and requirements clearly stated
                - Comprehensive coverage with no gaps or omissions
                - Professional language suitable for legal and business environments

                REMEMBER: Generate a LONG, DETAILED, COMPREHENSIVE, and LEGALLY-SOUND document with ZERO ambiguities. This document should be ready for professional and legal use without any modifications needed.
            `;

            const response = await generateAIResponse([
                { role: "system", content: "You are an expert legal document writer and professional document specialist. Create comprehensive, detailed, and legally-sound documents with precise, unambiguous language. Always provide extensive coverage with in-depth explanations. Never be brief or concise - prioritize detail, thoroughness, legal precision, and completeness. Ensure all documents are ready for professional and legal use without ambiguities or errors." },
                { role: "user", content: prompt }
            ]);
            setGeneratedContent(response);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate document.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveCloud = (docName, content) => {
        // Open save modal instead of directly saving
        setPendingSaveContent({ name: docName, content: content });
        setShowSaveModal(true);
    };

    const handleSaveSuccess = () => {
        setShowModal(false);
        setPendingSaveContent({ name: '', content: '' });
    };

    const handleDownload = (docName, content) => {
        // Simple HTML export for Word compatibility
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Document</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content.replace(/\n/g, "<br>") + footer;

        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
        saveAs(blob, `${docName}.doc`);
        toast.success("Download started!");
    };

    // Responsive hook
    const [width, setWidth] = useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = width < 992; // lg breakpoint

    return (
        <div className={`hk-pg-body bg-white py-2 ${isMobile ? '' : 'overflow-hidden'}`} style={{ height: isMobile ? 'auto' : 'calc(100vh - 85px)' }}>
            <Container fluid className="px-xxl-5 h-100 d-flex flex-column">
                <div className="flex-shrink-0">

                    <DocConfigHeader
                        config={config}
                        onConfigChange={handleConfigChange}
                        onTemplatesClick={() => {
                            console.log("Opening Templates Drawer");
                            toast("Opening Templates...", { icon: '📂' });
                            setShowTemplates(true);
                        }}
                    />
                </div>

                <div className="flex-grow-1" style={{ minHeight: 0, marginBottom: isMobile ? '180px' : '115px' }}>
                    {/* Row takes remaining height minus footer space */}
                    <Row className={`g-3 ${isMobile ? '' : 'h-100'}`}>
                        <Col lg={6} className={isMobile ? 'mb-4' : 'h-100'}>
                            <GoalInput
                                value={goal}
                                onChange={setGoal}
                            />
                        </Col>

                        <Col lg={6} className={isMobile ? '' : 'h-100'}>
                            <FrameworkPanel
                                framework={config.framework}
                                data={frameworkData}
                                onChange={handleFrameworkDataChange}
                                onAutoExpand={handleAutoExpand}
                                isExpanding={isExpanding}
                                isMobile={isMobile}
                            />
                        </Col>
                    </Row>
                </div>

                {/* Custom Action Footer */}
                <div
                    className="position-fixed bg-white border-top shadow-sm py-2 d-flex justify-content-between align-items-center"
                    style={{
                        zIndex: 1020,
                        left: isMobile ? 0 : 'var(--hk-sidebar-width, 270px)',
                        paddingLeft: 0,
                        right: 0,
                        bottom: isMobile ? '90px' : '42px', // Clears Mobile Nav
                        height: isMobile ? 'auto' : '70px',
                        paddingTop: '1rem',
                        paddingBottom: '1rem'
                    }}
                >
                    <Container fluid className="px-xxl-5 h-100 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <div className="text-muted fs-7 text-center text-md-start">
                            <span className="fw-bold text-dark">{goal ? goal.split(/\s+/).length : 0}</span> Words &bull; <span className="fw-bold text-dark">{config.tone}</span> Tone &bull; <span className="fw-bold text-dark">{config.framework}</span> Framework
                        </div>
                        <div className="d-flex w-100 w-md-auto justify-content-center gap-2">
                            <Button
                                variant="ghost-secondary"
                                className="rounded-pill px-4 fs-7 fw-bold"
                                onClick={() => setGoal('')}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="gradient-primary"
                                className="rounded-pill px-4 shadow-sm btn-animated fw-bold flex-grow-1 flex-md-grow-0"
                                onClick={handleCreateDocument}
                                disabled={isGenerating}
                            >
                                {isGenerating ?
                                    <><span className="spinner-border spinner-border-sm me-2" />Generating...</>
                                    : 'Create Document'
                                }
                            </Button>
                        </div>
                    </Container>
                </div>

                {/* Standard Page Footer - Hide on mobile to prevent clutter */}
                {!isMobile && (
                    <div style={{ zIndex: 1200, position: 'relative' }}>
                        <PageFooter style={{ left: 0, paddingLeft: 'var(--hk-sidebar-width, 270px)' }} />
                    </div>
                )}

                <TemplatesDrawer
                    show={showTemplates}
                    onHide={() => setShowTemplates(false)}
                    onSelect={handleTemplateSelect}
                />

                <CreationModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    isGenerating={isGenerating}
                    content={generatedContent}
                    onSaveCloud={handleSaveCloud}
                    onDownload={handleDownload}
                    title={goal ? goal.slice(0, 30) + "..." : "Untitled Doc"}
                />

                <SaveToCloudModal
                    show={showSaveModal}
                    onHide={() => setShowSaveModal(false)}
                    docName={pendingSaveContent.name}
                    content={pendingSaveContent.content}
                    onSaveSuccess={handleSaveSuccess}
                />

                <DocumentTypeModal
                    show={showDocTypeModal}
                    onHide={() => setShowDocTypeModal(false)}
                    onSelect={handleDocumentTypeSelect}
                />

            </Container>
        </div>
    );
};

export default CreateDoc;
