import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const EUAIActChecklist = () => {
    const defaultTitle = "EU AI Act Deployer Checklist";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Obligations for SMEs acting as "Deployers" (users) of AI systems.</p>
        </div>

        <div class="alert alert-warning mb-4">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Note:</strong> This page is a static template for reference.
        </div>

        <div class="policy-section mb-4">
            <h4>1. Prohibited Practices (Review Required)</h4>
            <div class="p-3 bg-light border rounded mb-3">
                <p>Verify that the system is NOT used for:</p>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">Social scoring of individuals.</label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">Biometric identification in public spaces.</label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">Emotion recognition in workplace/schools.</label>
                </div>
                <div class="mt-2 text-danger">
                    <small>*If any are checked, STOP immediately. These are banned in the EU.</small>
                </div>
            </div>

            <h4>2. Transparency & Staff Literacy</h4>
            <div class="p-3 bg-light border rounded mb-3">
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">Have staff received basic AI literacy training?</label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">If the AI interacts with people (chatbots), is it disclosed that they are speaking to a machine?</label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">If AI generates content (audio/video/text) of public interest, is it marked as artificially generated?</label>
                </div>
            </div>

            <h4>3. High-Risk AI Systems (Specific Categories)</h4>
            <div class="p-3 bg-light border rounded">
                <p>Does the system make decisions in: HR/Recruitment, Credit Scoring, Critical Infrastructure, Educational Access?</p>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" disabled>
                    <label class="form-check-label">No, we only use General Purpose AI (e.g. Chatbots, Office tools).</label>
                </div>
                <div class="alert alert-warning mt-2 mb-0">
                    <small>If "No" is NOT checked, you may be deploying a "High-Risk AI System" effectively requiring an Fundamental Rights Impact Assessment (FRIA). Consult Legal.</small>
                </div>
            </div>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="eu_ai_act"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default EUAIActChecklist;
