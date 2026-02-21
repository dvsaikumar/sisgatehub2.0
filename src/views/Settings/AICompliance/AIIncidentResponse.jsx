import React from 'react';
import EditableCompliancePage from '../../../components/EditableCompliancePage/EditableCompliancePage';

const AIIncidentResponse = () => {
    const defaultTitle = "AI Incident Response Procedure";
    const defaultHtmlContent = `
        <div class="mb-4">
            <p class="text-muted">Protocol for handling AI-related errors, data breaches, or compliance failures.</p>
        </div>

        <div class="policy-section mb-4">
            <h4>Trigger Events</h4>
            <p>This procedure is triggered by:</p>
            <ul>
                <li><strong>Data Leak:</strong> Sensitive data accidentally input into a public AI model.</li>
                <li><strong>Critical Hallucination:</strong> AI output causing significant business error or client misinformation.</li>
                <li><strong>Copyright Claim:</strong> Allegation of IP infringement regarding AI content.</li>
                <li><strong>Bias/Ethics:</strong> Report of discriminatory output from an AI system.</li>
            </ul>
        </div>

        <div class="policy-section mb-4">
            <h4>Step 1: Immediate Containment (0-4 Hours)</h4>
            <ul>
                <li>Stop using the affected AI tool immediately.</li>
                <li>If a data leak: Attempt to delete chat history/session if possible. Contact vendor support if critical data is exposed.</li>
                <li>Notify the AI Compliance Officer / DPO.</li>
            </ul>
        </div>

        <div class="policy-section mb-4">
            <h4>Step 2: Investigation & Assessment (4-24 Hours)</h4>
            <ul>
                <li>Determine scope: specific users, specific clients affected.</li>
                <li>Assess impact severity (Low/Medium/High).</li>
                <li>For data leaks: Determine if it constitutes a GDPR breach requiring ICO notification (72h deadline).</li>
            </ul>
        </div>

        <div class="policy-section mb-4">
            <h4>Step 3: Remediation & Communication</h4>
            <ul>
                <li>Correct erroneous information with the client ("Human-in-the-loop" correction).</li>
                <li>If personal data was compromised, notify affected data subjects as per GDPR policy.</li>
                <li>Retrain staff or adjust tool configurations to prevent recurrence.</li>
            </ul>
        </div>

        <div class="policy-section mb-4">
            <h4>Step 4: Post-Incident Review</h4>
            <ul>
                <li>Update the AI Risk Register.</li>
                <li>Review Vendor Due Diligence for the tool involved.</li>
                <li>Generate incident report for audit log.</li>
            </ul>
        </div>
    `;

    return (
                <EditableCompliancePage
            pageKey="ai_incident"
            defaultTitle={defaultTitle}
            defaultHtmlContent={defaultHtmlContent}
        />
            );
};

export default AIIncidentResponse;
